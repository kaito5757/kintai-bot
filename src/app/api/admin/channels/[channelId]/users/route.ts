import { NextResponse } from 'next/server';
import { db } from '@/db';
import { slackUsers, workSessions } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const channelId = decodeURIComponent(params.channelId);
    console.log(`チャンネル ${channelId} のユーザー一覧取得開始`);

    // 指定されたチャンネルでセッションがあるユーザーを取得
    const channelUsers = await db
      .select({
        user: {
          id: slackUsers.id,
          slackUserId: slackUsers.slackUserId,
          username: slackUsers.username,
          displayName: slackUsers.displayName,
          realName: slackUsers.realName,
          email: slackUsers.email,
          teamId: slackUsers.teamId,
          isActive: slackUsers.isActive,
          createdAt: slackUsers.createdAt,
        },
        sessionCount: sql<number>`count(${workSessions.id})`,
        lastSession: sql<string>`max(${workSessions.updatedAt})`,
      })
      .from(workSessions)
      .innerJoin(slackUsers, eq(workSessions.slackUserId, slackUsers.slackUserId))
      .where(eq(workSessions.slackChannelId, channelId))
      .groupBy(
        slackUsers.id,
        slackUsers.slackUserId,
        slackUsers.username,
        slackUsers.displayName,
        slackUsers.realName,
        slackUsers.email,
        slackUsers.teamId,
        slackUsers.isActive,
        slackUsers.createdAt
      )
      .orderBy(desc(sql`max(${workSessions.updatedAt})`));

    console.log(`取得したユーザー数: ${channelUsers.length}`);

    return NextResponse.json({
      success: true,
      data: channelUsers
    });
  } catch (error) {
    console.error('チャンネルユーザー一覧の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: 'チャンネルユーザー一覧の取得に失敗しました'
    }, { status: 500 });
  }
}