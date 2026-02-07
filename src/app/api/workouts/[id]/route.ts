import { NextRequest, NextResponse } from 'next/server';
import { getWorkout, updateWorkout } from '@/lib/storage';
import { Workout } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const workout = await getWorkout(params.id);
  if (!workout) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
  }
  return NextResponse.json(workout);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as Workout;
  if (body.id !== params.id) {
    return NextResponse.json({ error: 'ID mismatch' }, { status: 400 });
  }
  await updateWorkout(body);
  return NextResponse.json(body);
}
