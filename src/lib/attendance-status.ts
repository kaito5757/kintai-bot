import { db } from '@/db';
import { attendanceRecords } from '@/db/schema';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

export type AttendanceStatus = '退勤' | '業務中' | '休憩中';
export type AttendanceAction = '業務開始' | '業務終了' | '休憩開始' | '休憩終了';

// ステータス遷移ルール（1日に複数回の業務開始・終了を許可）
const transitionRules: Record<AttendanceStatus, AttendanceAction[]> = {
  '退勤': ['業務開始'],
  '業務中': ['業務終了', '休憩開始'],
  '休憩中': ['休憩終了'],
};

// アクションによる次のステータス
const nextStatus: Record<AttendanceAction, AttendanceStatus> = {
  '業務開始': '業務中',
  '業務終了': '退勤',
  '休憩開始': '休憩中',
  '休憩終了': '業務中',
};

// ユーザーの現在のステータスを取得
export async function getCurrentStatus(slackUserId: string): Promise<AttendanceStatus> {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // 今日の最新の記録を取得
  const latestRecord = await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.slackUserId, slackUserId),
        gte(attendanceRecords.timestamp, todayStart),
        lte(attendanceRecords.timestamp, todayEnd)
      )
    )
    .orderBy(desc(attendanceRecords.timestamp))
    .limit(1);

  if (latestRecord.length === 0) {
    console.log(`ステータス取得: ${slackUserId} | 今日の記録なし → 退勤`);
    return '退勤';
  }

  const lastAction = latestRecord[0].action as AttendanceAction;
  console.log(`ステータス取得: ${slackUserId} | 最新アクション: ${lastAction} | 時刻: ${latestRecord[0].timestamp}`);
  
  // 最後のアクションに基づいて現在のステータスを判定
  switch (lastAction) {
    case '業務開始':
      return '業務中';
    case '業務終了':
      return '退勤';
    case '休憩開始':
      return '休憩中';
    case '休憩終了':
      return '業務中';
    default:
      return '退勤';
  }
}

// アクションが実行可能かチェック
export async function canPerformAction(
  slackUserId: string,
  action: AttendanceAction
): Promise<{ allowed: boolean; currentStatus: AttendanceStatus; message?: string }> {
  const currentStatus = await getCurrentStatus(slackUserId);
  const allowedActions = transitionRules[currentStatus];
  
  console.log(`ステータスチェック: ${slackUserId} | 現在: ${currentStatus} | アクション: ${action} | 許可されるアクション: ${allowedActions.join(', ')}`);

  if (!allowedActions.includes(action)) {
    let message = `現在のステータス「${currentStatus}」では「${action}」はできません。`;
    
    // より詳細なメッセージ
    if (currentStatus === '退勤' && action !== '業務開始') {
      message += '\nまず「業務開始」を記録してください。';
    } else if (currentStatus === '休憩中' && action !== '休憩終了') {
      message += '\nまず「休憩終了」を記録してください。';
    } else if (currentStatus === '業務中') {
      if (action === '業務開始') {
        message += '\n「業務終了」を記録してから再度「業務開始」してください。';
      } else if (action === '休憩終了') {
        message += '\n休憩中ではありません。';
      }
    }

    console.log(`バリデーション失敗: ${currentStatus} -> ${action}`);
    return { allowed: false, currentStatus, message };
  }

  return { allowed: true, currentStatus };
}

// アクション実行後の次のステータスを取得
export function getNextStatus(action: AttendanceAction): AttendanceStatus {
  return nextStatus[action];
}