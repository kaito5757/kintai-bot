import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workSessions, breaks, slackUsers, slackChannels } from '@/db/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const channelId = searchParams.get('channelId');

    console.log('勤怠詳細API呼び出し:', { userId, channelId });

    // フィルタ条件を作成
    const whereConditions = [];
    if (userId) {
      whereConditions.push(eq(workSessions.slackUserId, userId));
    }
    if (channelId) {
      whereConditions.push(eq(workSessions.slackChannelId, channelId));
    }

    // セッション、ユーザー、チャンネル、休憩情報をすべて1つのクエリで取得
    const query = db
      .select({
        session: {
          id: workSessions.id,
          startTime: workSessions.startTime,
          endTime: workSessions.endTime,
          slackUserId: workSessions.slackUserId,
          slackChannelId: workSessions.slackChannelId,
          createdAt: workSessions.createdAt,
          updatedAt: workSessions.updatedAt,
        },
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
        },
        break: {
          id: breaks.id,
          workSessionId: breaks.workSessionId,
          startTime: breaks.startTime,
          endTime: breaks.endTime,
          createdAt: breaks.createdAt,
          updatedAt: breaks.updatedAt,
        }
      })
      .from(workSessions)
      .leftJoin(slackUsers, eq(workSessions.slackUserId, slackUsers.slackUserId))
      .leftJoin(slackChannels, eq(workSessions.slackChannelId, slackChannels.slackChannelId))
      .leftJoin(breaks, eq(workSessions.id, breaks.workSessionId))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(workSessions.startTime), desc(breaks.startTime))
      .limit(1000); // 休憩データも含むため制限を上げる

    const results = await query;
    console.log('クエリ結果数:', results.length);

    // 結果をセッション単位でグループ化
    const sessionsMap = new Map();
    
    results.forEach(row => {
      const sessionId = row.session.id;
      
      if (!sessionsMap.has(sessionId)) {
        sessionsMap.set(sessionId, {
          id: row.session.id,
          startTime: row.session.startTime,
          endTime: row.session.endTime,
          slackUserId: row.session.slackUserId,
          slackChannelId: row.session.slackChannelId,
          createdAt: row.session.createdAt,
          updatedAt: row.session.updatedAt,
          user: row.user,
          channel: row.channel,
          breaks: []
        });
      }
      
      // 休憩データがある場合のみ追加
      if (row.break && row.break.id) {
        const session = sessionsMap.get(sessionId);
        session.breaks.push({
          id: row.break.id,
          workSessionId: row.break.workSessionId,
          startTime: row.break.startTime,
          endTime: row.break.endTime,
          createdAt: row.break.createdAt,
          updatedAt: row.break.updatedAt,
        });
      }
    });

    const sessionsWithBreaks = Array.from(sessionsMap.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 100); // 最終的に100セッションに制限

    console.log('最終セッション数:', sessionsWithBreaks.length);

    return NextResponse.json({
      success: true,
      data: sessionsWithBreaks
    });
  } catch (error) {
    console.error('勤怠詳細の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: '勤怠詳細の取得に失敗しました'
    }, { status: 500 });
  }
}