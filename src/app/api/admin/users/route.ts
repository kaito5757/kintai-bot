import { NextResponse } from 'next/server';
import { db } from '@/db';
import { slackUsers } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    let query = db.select().from(slackUsers);
    
    if (teamId && teamId !== 'all') {
      query = query.where(eq(slackUsers.teamId, teamId));
    }

    const users = await query.orderBy(desc(slackUsers.createdAt));

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗:', error);
    return NextResponse.json({
      success: false,
      error: 'ユーザー一覧の取得に失敗しました'
    }, { status: 500 });
  }
}