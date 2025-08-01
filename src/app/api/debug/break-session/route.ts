import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { breaks } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workSessionId, startTime, endTime } = body;

    if (!workSessionId || !startTime) {
      return NextResponse.json(
        { error: 'workSessionId and startTime are required' },
        { status: 400 }
      );
    }

    const result = await db.insert(breaks).values({
      workSessionId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating break session:', error);
    return NextResponse.json(
      { error: 'Failed to create break session' },
      { status: 500 }
    );
  }
}