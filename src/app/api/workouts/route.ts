import { NextRequest, NextResponse } from 'next/server';
import { generateWorkout } from '@/lib/generator';
import { getHistory, saveWorkout } from '@/lib/storage';
import { WorkoutGoal } from '@/lib/types';

const VALID_GOALS: WorkoutGoal[] = ['strength', 'endurance', 'fat_loss', 'muscle_building'];

export async function GET() {
  const history = await getHistory();
  // Return most recent first
  return NextResponse.json([...history.workouts].reverse());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const goal = body.goal as WorkoutGoal;

  if (!VALID_GOALS.includes(goal)) {
    return NextResponse.json({ error: 'Invalid goal' }, { status: 400 });
  }

  const history = await getHistory();
  const workout = generateWorkout(goal, history);
  await saveWorkout(workout);

  return NextResponse.json(workout);
}
