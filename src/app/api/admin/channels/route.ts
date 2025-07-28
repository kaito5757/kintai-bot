import { NextResponse } from 'next/server';
import { db } from '@/db';
import { slackChannels } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = db.select().from(slackChannels);
    
    if (teamId && teamId !== 'all') {
      query = query.where(eq(slackChannels.teamId, teamId));
    }

    const channels = await query.orderBy(desc(slackChannels.createdAt));

    return NextResponse.json({
      success: true,
      data: channels
    });
  } catch (error) {
    console.error('チャンネル一覧の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: 'チャンネル一覧の取得に失敗しました'
    }, { status: 500 });
  }
}