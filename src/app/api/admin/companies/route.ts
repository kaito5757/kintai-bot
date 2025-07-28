import { NextResponse } from 'next/server';
import { db } from '@/db';
import { slackChannels, workSessions } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('会社一覧（チャンネル別）の取得を開始');

    // 各チャンネルごとのユーザー数と最新勤怠情報を取得
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

    console.log('取得したチャンネル統計:', channelStats);

    // 結果を整形
    const companies = channelStats.map(stat => ({
      channelId: stat.channelId,
      companyName: stat.channelName || `Unknown Channel (${stat.channelId})`,
      channelType: stat.channelType || 'unknown',
      userCount: stat.userCount || 0,
      sessionCount: stat.sessionCount || 0,
      lastActivity: stat.lastActivity,
    })).filter(company => company.userCount > 0); // ユーザーがいるチャンネルのみ

    console.log('最終的な会社データ:', companies);

    return NextResponse.json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error('会社一覧の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: '会社一覧の取得に失敗しました'
    }, { status: 500 });
  }
}