import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack-verify';
import { db } from '@/db';
import { attendanceRecords } from '@/db/schema';
import { canPerformAction, type AttendanceAction } from '@/lib/attendance-status';

const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;

interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const timestamp = request.headers.get('X-Slack-Request-Timestamp') || '';
  const signature = request.headers.get('X-Slack-Signature') || '';

  // Slack署名検証
  const isValid = verifySlackRequest(SLACK_SIGNING_SECRET, timestamp, body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // URLSearchParamsでパース
  const params = new URLSearchParams(body);
  const payload: SlackCommandPayload = {
    token: params.get('token') || '',
    team_id: params.get('team_id') || '',
    team_domain: params.get('team_domain') || '',
    channel_id: params.get('channel_id') || '',
    channel_name: params.get('channel_name') || '',
    user_id: params.get('user_id') || '',
    user_name: params.get('user_name') || '',
    command: params.get('command') || '',
    text: params.get('text') || '',
    response_url: params.get('response_url') || '',
    trigger_id: params.get('trigger_id') || '',
  };

  // コマンドに応じて処理
  if (payload.command === '/kintai') {
    return handleKintaiCommand(payload);
  }

  return NextResponse.json({ text: '不明なコマンドです' });
}

async function handleKintaiCommand(payload: SlackCommandPayload) {
  const subCommand = payload.text.trim();
  
  // サブコマンドなしの場合はボタンを表示（自分だけに見える）
  if (!subCommand) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '勤怠を記録する項目を選択してください',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '勤怠を記録する項目を選択してください：'
          }
        },
        {
          type: 'actions',
          block_id: 'kintai_actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '業務開始',
                emoji: true
              },
              style: 'primary',
              action_id: 'work_start',
              value: 'work_start'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '業務終了',
                emoji: true
              },
              style: 'danger',
              action_id: 'work_end',
              value: 'work_end'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '休憩開始',
                emoji: true
              },
              action_id: 'break_start',
              value: 'break_start'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '休憩終了',
                emoji: true
              },
              action_id: 'break_end',
              value: 'break_end'
            }
          ]
        }
      ]
    });
  }

  // テキストコマンドでの入力も受け付ける
  const actionMap: Record<string, string> = {
    'start': '業務開始',
    '開始': '業務開始',
    '業務開始': '業務開始',
    'end': '業務終了',
    '終了': '業務終了',
    '業務終了': '業務終了',
    'break': '休憩開始',
    '休憩': '休憩開始',
    '休憩開始': '休憩開始',
    'back': '休憩終了',
    '戻る': '休憩終了',
    '休憩終了': '休憩終了',
  };

  const action = actionMap[subCommand];
  
  if (!action) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '無効なコマンドです。\n使用例: `/kintai start`, `/kintai end`, `/kintai break`, `/kintai back`'
    });
  }

  // ステータスチェック
  const validation = await canPerformAction(payload.user_id, action as AttendanceAction);
  
  if (!validation.allowed) {
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `:warning: ${validation.message}`
    });
  }

  try {
    // 勤怠記録を保存
    await db.insert(attendanceRecords).values({
      slackUserId: payload.user_id,
      action: action,
      timestamp: new Date(),
      slackTimestamp: new Date().getTime().toString(),
      rawMessage: `/kintai ${subCommand}`,
    });

    return NextResponse.json({
      response_type: 'in_channel',
      text: `<@${payload.user_id}> ${action}を記録しました :white_check_mark:`
    });
  } catch (error) {
    console.error('勤怠記録の保存に失敗:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: 'エラーが発生しました。もう一度お試しください。'
    });
  }
}