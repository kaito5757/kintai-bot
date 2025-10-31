import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workSessions } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, channelId, startTime, endTime } = body;

    if (!userId || !channelId || !startTime) {
      return NextResponse.json(
        { error: 'userId, channelId, startTime are required' },
        { status: 400 }
      );
    }

    const result = await db.insert(workSessions).values({
      slackUserId: userId,
      slackChannelId: channelId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating work session:', error);
    return NextResponse.json(
      { error: 'Failed to create work session' },
      { status: 500 }
    );
  }
}
