import { db } from '@/db';
import { workSessions, breaks, attendanceRecords } from '@/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';
import { SlackUserManager } from './slack-user-manager';
import { SlackChannelManager } from './slack-channel-manager';

export type AttendanceAction = '業務開始' | '業務終了' | '休憩開始' | '休憩終了';
export type AttendanceStatus = '退勤' | '業務中' | '休憩中';

export class WorkSessionManager {
  // 現在のアクティブなワークセッションを取得
  static async getActiveWorkSession(slackUserId: string) {
    const activeSession = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.slackUserId, slackUserId),
          isNull(workSessions.endTime)
        )
      )
      .orderBy(desc(workSessions.startTime))
      .limit(1);

    return activeSession[0] || null;
  }

  // 現在のアクティブな休憩を取得
  static async getActiveBreak(workSessionId: string) {
    const activeBreak = await db
      .select()
      .from(breaks)
      .where(
        and(
          eq(breaks.workSessionId, workSessionId),
          isNull(breaks.endTime)
        )
      )
      .orderBy(desc(breaks.startTime))
      .limit(1);

    return activeBreak[0] || null;
  }

  // 現在のステータスを取得（1つのクエリで最適化）
  static async getCurrentStatus(slackUserId: string): Promise<AttendanceStatus> {
    const result = await db
      .select({
        session: {
          id: workSessions.id,
          startTime: workSessions.startTime,
          endTime: workSessions.endTime,
        },
        break: {
          id: breaks.id,
          startTime: breaks.startTime,
          endTime: breaks.endTime,
        }
      })
      .from(workSessions)
      .leftJoin(breaks, and(
        eq(breaks.workSessionId, workSessions.id),
        isNull(breaks.endTime)
      ))
      .where(and(
        eq(workSessions.slackUserId, slackUserId),
        isNull(workSessions.endTime)
      ))
      .orderBy(desc(workSessions.startTime))
      .limit(1);

    if (result.length === 0) {
      return '退勤';
    }

    const activeSession = result[0];
    if (activeSession.break && activeSession.break.id) {
      return '休憩中';
    }

    return '業務中';
  }

  // アクションが可能かチェック
  static async canPerformAction(slackUserId: string, action: AttendanceAction): Promise<{
    allowed: boolean;
    currentStatus: AttendanceStatus;
    message?: string;
  }> {
    const currentStatus = await this.getCurrentStatus(slackUserId);
    
    console.log(`ステータスチェック: ${slackUserId} | 現在: ${currentStatus} | アクション: ${action}`);

    const rules: Record<AttendanceStatus, AttendanceAction[]> = {
      '退勤': ['業務開始'],
      '業務中': ['業務終了', '休憩開始'],
      '休憩中': ['休憩終了'],
    };

    const allowedActions = rules[currentStatus];
    
    if (!allowedActions.includes(action)) {
      let message = `現在のステータス「${currentStatus}」では「${action}」はできません。`;
      
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

      return { allowed: false, currentStatus, message };
    }

    return { allowed: true, currentStatus };
  }

  // アクションを実行
  static async performAction(
    slackUserId: string, 
    action: AttendanceAction,
    rawMessage?: string,
    channelId?: string
  ): Promise<void> {
    const now = new Date();

    // ユーザー情報とチャンネル情報を自動取得・更新
    await SlackUserManager.ensureUser(slackUserId);
    if (channelId) {
      await SlackChannelManager.ensureChannel(channelId);
    }

    // 履歴ログを記録
    await db.insert(attendanceRecords).values({
      slackUserId,
      slackChannelId: channelId,
      action,
      timestamp: now,
      slackTimestamp: now.getTime().toString(),
      rawMessage: rawMessage || action,
    });

    switch (action) {
      case '業務開始':
        // 新しいワークセッションを開始
        await db.insert(workSessions).values({
          slackUserId: slackUserId, // 文字列IDをそのまま使用
          slackChannelId: channelId,
          startTime: now,
        });
        break;

      case '業務終了':
        // アクティブなワークセッションを終了
        const activeSession = await this.getActiveWorkSession(slackUserId);
        if (activeSession) {
          // アクティブな休憩があれば終了
          const activeBreak = await this.getActiveBreak(activeSession.id);
          if (activeBreak) {
            await db
              .update(breaks)
              .set({ endTime: now, updatedAt: now })
              .where(eq(breaks.id, activeBreak.id));
          }

          // セッション終了
          await db
            .update(workSessions)
            .set({ endTime: now, updatedAt: now })
            .where(eq(workSessions.id, activeSession.id));
        }
        break;

      case '休憩開始':
        // アクティブなセッションに休憩を追加
        const currentSession = await this.getActiveWorkSession(slackUserId);
        if (currentSession) {
          await db.insert(breaks).values({
            workSessionId: currentSession.id,
            startTime: now,
          });
        }
        break;

      case '休憩終了':
        // アクティブな休憩を終了
        const workSession = await this.getActiveWorkSession(slackUserId);
        if (workSession) {
          const activeBreak = await this.getActiveBreak(workSession.id);
          if (activeBreak) {
            await db
              .update(breaks)
              .set({ endTime: now, updatedAt: now })
              .where(eq(breaks.id, activeBreak.id));
          }
        }
        break;
    }

    console.log(`アクション実行完了: ${slackUserId} | ${action}`);
  }
}