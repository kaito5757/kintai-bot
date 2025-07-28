import { NextRequest, NextResponse } from 'next/server';
import { verifySlackRequest } from '@/lib/slack-verify';
import { handleAttendanceAction } from '@/lib/attendance-handler';

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

  const result = await handleAttendanceAction(payload, '休憩終了');
  return NextResponse.json(result);
}