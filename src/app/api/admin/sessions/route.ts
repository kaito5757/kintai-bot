import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workSessions, breaks, slackUsers, slackChannels } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // 最新50件のワークセッションを取得（ユーザーとチャンネル情報含む）
    const sessions = await db
      .select({
        id: workSessions.id,
        startTime: workSessions.startTime,
        endTime: workSessions.endTime,
        slackUserId: workSessions.slackUserId,
        slackChannelId: workSessions.slackChannelId,
        createdAt: workSessions.createdAt,
        updatedAt: workSessions.updatedAt,
        user: {
          id: slackUsers.id,
          slackUserId: slackUsers.slackUserId,
          username: slackUsers.username,
          displayName: slackUsers.displayName,
          realName: slackUsers.realName,
          email: slackUsers.email,
          isActive: slackUsers.isActive,
          createdAt: slackUsers.createdAt,
        },
        channel: {
          id: slackChannels.id,
          slackChannelId: slackChannels.slackChannelId,
          channelName: slackChannels.channelName,
          channelType: slackChannels.channelType,
          isActive: slackChannels.isActive,
          createdAt: slackChannels.createdAt,
        }
      })
      .from(workSessions)
      .leftJoin(slackUsers, eq(workSessions.slackUserId, slackUsers.slackUserId))
      .leftJoin(slackChannels, eq(workSessions.slackChannelId, slackChannels.slackChannelId))
      .orderBy(desc(workSessions.startTime))
      .limit(50);

    // 各セッションの休憩情報を取得
    const sessionIds = sessions.map(s => s.id);
    const allBreaks = sessionIds.length > 0 ? await db
      .select()
      .from(breaks)
      .where(eq(breaks.workSessionId, sessionIds[0])) // TODO: Fix this to handle multiple sessions
      .orderBy(desc(breaks.startTime)) : [];

    // セッションごとに休憩情報を紐付け
    const sessionsWithBreaks = await Promise.all(
      sessions.map(async (session) => {
        const sessionBreaks = await db
          .select()
          .from(breaks)
          .where(eq(breaks.workSessionId, session.id))
          .orderBy(desc(breaks.startTime));

        return {
          ...session,
          breaks: sessionBreaks
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: sessionsWithBreaks
    });
  } catch (error) {
    console.error('セッション一覧の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: 'セッション一覧の取得に失敗しました'
    }, { status: 500 });
  }
}