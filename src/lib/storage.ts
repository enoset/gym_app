import { promises as fs } from 'fs';
import path from 'path';
import { Workout, WorkoutHistory } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'workouts.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getHistory(): Promise<WorkoutHistory> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { workouts: [] };
  }
}

async function saveHistory(history: WorkoutHistory): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const history = await getHistory();
  history.workouts.push(workout);
  await saveHistory(history);
}

export async function updateWorkout(workout: Workout): Promise<void> {
  const history = await getHistory();
  const index = history.workouts.findIndex(w => w.id === workout.id);
  if (index === -1) {
    history.workouts.push(workout);
  } else {
    history.workouts[index] = workout;
  }
  await saveHistory(history);
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const history = await getHistory();
  return history.workouts.find(w => w.id === id) || null;
}
