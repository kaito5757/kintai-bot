import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { breaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH: 休憩記録の更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { startTime, endTime } = body;

    if (!startTime) {
      return NextResponse.json(
        { error: 'startTime is required' },
        { status: 400 }
      );
    }

    const result = await db
      .update(breaks)
      .set({
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        updatedAt: new Date(),
      })
      .where(eq(breaks.id, params.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Break not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating break:', error);
    return NextResponse.json(
      { error: 'Failed to update break' },
      { status: 500 }
    );
  }
}

// DELETE: 休憩記録の削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db
      .delete(breaks)
      .where(eq(breaks.id, params.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Break not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting break:', error);
    return NextResponse.json(
      { error: 'Failed to delete break' },
      { status: 500 }
    );
  }
}
