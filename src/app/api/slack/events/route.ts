import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack-verify';
import { WorkSessionManager, type AttendanceAction } from '@/lib/work-session-manager';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;

// 勤怠アクションのマッピング
const ACTION_MAP: Record<string, string> = {
  '業務開始': '業務開始',
  '業務終了': '業務終了',
  '休憩開始': '休憩開始',
  '休憩終了': '休憩終了',
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = request.headers.get('X-Slack-Request-Timestamp') || '';
  const signature = request.headers.get('X-Slack-Signature') || '';

  // Slack署名検証
  const isValid = verifySlackRequest(SLACK_SIGNING_SECRET, timestamp, body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);

  // URL検証リクエストへの応答
  if (payload.type === 'url_verification') {
    return NextResponse.json({ challenge: payload.challenge });
  }

  // イベント処理
  if (payload.type === 'event_callback') {
    const event = payload.event;

    // メッセージイベントのみ処理（ボットのメッセージは除外）
    if (event.type === 'message' && !event.subtype && !event.bot_id && !event.app_id) {
      const text = event.text || '';
      
      // 確認メッセージ（「を記録しました」を含む）は除外
      if (text.includes('を記録しました') || text.includes(':white_check_mark:') || text.includes(':warning:')) {
        return NextResponse.json({ ok: true });
      }
      
      const action = Object.keys(ACTION_MAP).find(key => text.includes(key));

      if (action) {
        // ステータスチェック
        const actionText = ACTION_MAP[action];
        const validation = await WorkSessionManager.canPerformAction(event.user, actionText as AttendanceAction);
        
        if (!validation.allowed) {
          // Slackにエラーメッセージを投稿
          const slackBotToken = process.env.SLACK_BOT_TOKEN;
          if (slackBotToken) {
            await fetch('https://slack.com/api/chat.postMessage', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${slackBotToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                channel: event.channel,
                text: `:warning: <@${event.user}> ${validation.message}`
              }),
            });
          }
          return NextResponse.json({ ok: true });
        }

        try {
          // アクションを実行（新しいテーブル構造で保存）
          await WorkSessionManager.performAction(
            event.user,
            actionText as AttendanceAction,
            text,
            event.channel
          );

          console.log(`勤怠記録を保存: ${event.user} - ${actionText}`);
        } catch (error) {
          console.error('勤怠記録の保存に失敗:', error);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}