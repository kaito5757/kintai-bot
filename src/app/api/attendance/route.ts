import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workSessions, breaks, slackUsers } from '@/db/schema';
import { between, asc, eq } from 'drizzle-orm';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearMonth = searchParams.get('month'); // YYYY-MM形式

  let startDate: Date;
  let endDate: Date;

  if (yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    startDate = startOfMonth(new Date(year, month - 1));
    endDate = endOfMonth(new Date(year, month - 1));
  } else {
    // デフォルトは現在の月
    startDate = startOfMonth(new Date());
    endDate = endOfMonth(new Date());
  }

  try {
    // ワークセッションを取得（リレーションで休憩も一緒に取得）
    const sessions = await db
      .select({
        id: workSessions.id,
        slackUserId: workSessions.slackUserId,
        startTime: workSessions.startTime,
        endTime: workSessions.endTime,
      })
      .from(workSessions)
      .where(between(workSessions.startTime, startDate, endDate))
      .orderBy(asc(workSessions.startTime));

    // 各セッションの休憩を取得
    const sessionsWithBreaks = await Promise.all(
      sessions.map(async (session) => {
        const sessionBreaks = await db
          .select()
          .from(breaks)
          .where(eq(breaks.workSessionId, session.id))
          .orderBy(asc(breaks.startTime));

        return {
          ...session,
          breaks: sessionBreaks,
        };
      })
    );

    // 日付ごとにグループ化
    const groupedRecords = sessionsWithBreaks.reduce((acc, session) => {
      const date = format(session.startTime, 'yyyy-MM-dd');
      
      if (!acc[date]) {
        acc[date] = {
          date,
          sessions: [],
          totalWorkTime: 0,
        };
      }

      // セッションの稼働時間を計算
      let sessionMinutes = 0;
      if (session.endTime) {
        sessionMinutes = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        
        // 休憩時間を差し引く
        const breakMinutes = session.breaks.reduce((total, breakPeriod) => {
          if (breakPeriod.endTime) {
            return total + (breakPeriod.endTime.getTime() - breakPeriod.startTime.getTime()) / (1000 * 60);
          }
          return total;
        }, 0);
        
        sessionMinutes = Math.max(0, sessionMinutes - breakMinutes);
      }

      acc[date].sessions.push({
        startTime: session.startTime,
        endTime: session.endTime,
        breaks: session.breaks.map(b => ({
          start: b.startTime,
          end: b.endTime,
        })),
        workMinutes: sessionMinutes,
      });

      acc[date].totalWorkTime += sessionMinutes;

      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      month: format(startDate, 'yyyy-MM'),
      data: Object.values(groupedRecords),
    });
  } catch (error) {
    console.error('勤怠データの取得に失敗:', error);
    return NextResponse.json(
      { error: '勤怠データの取得に失敗しました' },
      { status: 500 }
    );
  }
}