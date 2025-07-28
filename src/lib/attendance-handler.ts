import { WorkSessionManager, type AttendanceAction } from '@/lib/work-session-manager';

interface SlackCommandPayload {
  user_id: string;
  user_name: string;
  channel_id: string;
  command: string;
}

export async function handleAttendanceAction(
  payload: SlackCommandPayload,
  action: AttendanceAction
) {
  // ステータスチェック
  const validation = await WorkSessionManager.canPerformAction(payload.user_id, action);
  
  if (!validation.allowed) {
    return {
      response_type: 'ephemeral' as const,
      text: `:warning: ${validation.message}`
    };
  }

  try {
    console.log(`アクション実行開始: ${payload.user_id} | ${action}`);
    
    // アクションを実行（新しいテーブル構造で保存）
    await WorkSessionManager.performAction(
      payload.user_id, 
      action, 
      `${payload.command}`,
      payload.channel_id
    );

    console.log(`アクション実行成功: ${payload.user_id} | ${action}`);

    return {
      response_type: 'in_channel' as const,
      text: `<@${payload.user_id}> ${action}を記録しました :white_check_mark:`
    };
  } catch (error) {
    console.error('勤怠記録の保存に失敗:', error);
    return {
      response_type: 'ephemeral' as const,
      text: 'エラーが発生しました。もう一度お試しください。'
    };
  }
}