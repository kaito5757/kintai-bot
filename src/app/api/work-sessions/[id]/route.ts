import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH: 業務記録の更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { startTime, endTime } = body;

    if (!startTime) {
      return NextResponse.json(
        { error: 'startTime is required' },
        { status: 400 }
      );
    }

    const result = await db
      .update(workSessions)
      .set({
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        updatedAt: new Date(),
      })
      .where(eq(workSessions.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Work session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating work session:', error);
    return NextResponse.json(
      { error: 'Failed to update work session' },
      { status: 500 }
    );
  }
}

// DELETE: 業務記録の削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(workSessions)
      .where(eq(workSessions.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Work session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting work session:', error);
    return NextResponse.json(
      { error: 'Failed to delete work session' },
      { status: 500 }
    );
  }
}
