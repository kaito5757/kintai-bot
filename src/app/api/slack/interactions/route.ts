import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack-verify';
import { WorkSessionManager, type AttendanceAction } from '@/lib/work-session-manager';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;

interface SlackInteractionPayload {
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  actions: Array<{
    type: string;
    action_id: string;
    block_id: string;
    text: {
      type: string;
      text: string;
    };
    value: string;
    action_ts: string;
  }>;
  response_url: string;
  trigger_id: string;
  channel: {
    id: string;
    name: string;
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = request.headers.get('X-Slack-Request-Timestamp') || '';
  const signature = request.headers.get('X-Slack-Signature') || '';

  console.log('Interaction received');

  // Slack署名検証
  const isValid = verifySlackRequest(SLACK_SIGNING_SECRET, timestamp, body, signature);
  if (!isValid) {
    console.error('Invalid signature');
    return new NextResponse(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // URLSearchParamsでパース
  const params = new URLSearchParams(body);
  const payloadString = params.get('payload');
  
  if (!payloadString) {
    console.error('No payload found');
    return NextResponse.json({ error: 'No payload' }, { status: 400 });
  }

  const payload: SlackInteractionPayload = JSON.parse(payloadString);
  console.log('Payload type:', payload.type);

  // ボタンクリックのインタラクションを処理
  if (payload.type === 'block_actions') {
    const action = payload.actions[0];
    
    const actionMap: Record<string, string> = {
      'work_start': '業務開始',
      'work_end': '業務終了',
      'break_start': '休憩開始',
      'break_end': '休憩終了',
    };

    const actionText = actionMap[action.action_id];
    
    if (!actionText) {
      return NextResponse.json({
        text: '無効なアクションです'
      });
    }

    // ステータスチェック
    const validation = await WorkSessionManager.canPerformAction(payload.user.id, actionText as AttendanceAction);
    
    if (!validation.allowed) {
      return new NextResponse(JSON.stringify({
        replace_original: true,
        text: `:warning: ${validation.message}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:warning: ${validation.message}`
            }
          }
        ]
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    try {
      // アクションを実行（新しいテーブル構造で保存）
      await WorkSessionManager.performAction(
        payload.user.id,
        actionText as AttendanceAction,
        `ボタン: ${actionText}`,
        payload.channel?.id
      );

      console.log('勤怠記録を保存しました:', actionText);

      // Slack Botトークンを使ってチャンネルに投稿
      const slackBotToken = process.env.SLACK_BOT_TOKEN;
      if (slackBotToken && payload.channel) {
        const postMessageResponse = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channel: payload.channel.id,
            text: `<@${payload.user.id}> ${actionText}を記録しました :white_check_mark:`,
            unfurl_links: false,
            unfurl_media: false
          }),
        });
        const result = await postMessageResponse.json();
        console.log('Slack postMessage result:', result);
      }

      // ボタンを削除（メッセージを更新して空にする）
      return new NextResponse(JSON.stringify({
        replace_original: true,
        text: `${actionText}を記録しました :white_check_mark:`,
        blocks: [] // ブロックを空にすることでボタンを削除
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('勤怠記録の保存に失敗:', error);
      return NextResponse.json({
        replace_original: true,
        text: 'エラーが発生しました。もう一度お試しください。'
      });
    }
  }

  return NextResponse.json({ text: 'OK' });
}