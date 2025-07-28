import { db } from '@/db';
import { slackUsers, slackChannels, workSessions, breaks } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

// ユーザー一覧取得
export async function getUsers() {
  return await db.select().from(slackUsers).orderBy(desc(slackUsers.createdAt));
}

// チャンネル一覧取得
export async function getChannels() {
  return await db.select().from(slackChannels).orderBy(desc(slackChannels.createdAt));
}

// 指定チャンネルのユーザー一覧取得
export async function getChannelUsers(channelId: string) {
  const decodedChannelId = decodeURIComponent(channelId);
  
  return await db
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
    .where(eq(workSessions.slackChannelId, decodedChannelId))
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
}

// ワークセッション一覧取得
export async function getWorkSessions() {
  return await db.select().from(workSessions).orderBy(desc(workSessions.createdAt));
}

// 会社一覧取得（チャンネル別統計）
export async function getCompanies() {
  const channelStats = await db
    .select({
      channelId: slackChannels.slackChannelId,
      channelName: slackChannels.channelName,
      channelType: slackChannels.channelType,
      userCount: sql<number>`count(distinct ${workSessions.slackUserId})`,
      lastActivity: sql<string>`max(${workSessions.updatedAt})`,
      sessionCount: sql<number>`count(${workSessions.id})`,
    })
    .from(slackChannels)
    .leftJoin(workSessions, eq(slackChannels.slackChannelId, workSessions.slackChannelId))
    .groupBy(slackChannels.slackChannelId, slackChannels.channelName, slackChannels.channelType)
    .orderBy(desc(sql`max(${workSessions.updatedAt})`));

  return channelStats.map(stat => ({
    channelId: stat.channelId,
    companyName: stat.channelName || `Unknown Channel (${stat.channelId})`,
    channelType: stat.channelType || 'unknown',
    userCount: stat.userCount || 0,
    sessionCount: stat.sessionCount || 0,
    lastActivity: stat.lastActivity,
  })).filter(company => company.userCount > 0);
}

// ユーザーの勤怠データ取得
export async function getUserAttendanceData(userId: string, channelId: string) {
  const decodedUserId = decodeURIComponent(userId);
  const decodedChannelId = decodeURIComponent(channelId);

  // ワークセッションと関連データを取得
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
        teamId: slackUsers.teamId,
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
    .innerJoin(slackUsers, eq(workSessions.slackUserId, slackUsers.slackUserId))
    .innerJoin(slackChannels, eq(workSessions.slackChannelId, slackChannels.slackChannelId))
    .where(
      sql`${workSessions.slackUserId} = ${decodedUserId} AND ${workSessions.slackChannelId} = ${decodedChannelId}`
    )
    .orderBy(workSessions.startTime);

  // 各セッションの休憩データを取得
  const sessionIds = sessions.map(s => s.id);
  
  // 各セッションIDの休憩データを個別に取得
  const allBreaks: any[] = [];
  for (const sessionId of sessionIds) {
    const sessionBreaks = await db
      .select()
      .from(breaks)
      .where(eq(breaks.workSessionId, sessionId))
      .orderBy(breaks.startTime);
    allBreaks.push(...sessionBreaks);
  }

  // セッションに休憩データを結合し、型を文字列に変換
  const sessionsWithBreaks = sessions.map(session => ({
    id: session.id,
    startTime: session.startTime.toISOString(),
    endTime: session.endTime?.toISOString() || null,
    slackUserId: session.slackUserId,
    slackChannelId: session.slackChannelId || '',
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    user: {
      id: session.user.id,
      slackUserId: session.user.slackUserId,
      username: session.user.username || '',
      displayName: session.user.displayName || '',
      realName: session.user.realName || '',
      email: session.user.email || '',
      teamId: session.user.teamId || '',
      isActive: session.user.isActive || 'false',
      createdAt: session.user.createdAt.toISOString(),
    },
    channel: {
      id: session.channel.id,
      slackChannelId: session.channel.slackChannelId,
      channelName: session.channel.channelName || '',
      channelType: session.channel.channelType || '',
      isActive: session.channel.isActive || 'false',
      createdAt: session.channel.createdAt.toISOString(),
    },
    breaks: allBreaks
      .filter(breakItem => breakItem.workSessionId === session.id)
      .map(breakItem => ({
        id: breakItem.id,
        workSessionId: breakItem.workSessionId,
        startTime: breakItem.startTime.toISOString(),
        endTime: breakItem.endTime?.toISOString() || null,
        createdAt: breakItem.createdAt.toISOString(),
        updatedAt: breakItem.updatedAt.toISOString(),
      }))
  }));

  return sessionsWithBreaks;
}