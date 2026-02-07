import { Workout, WorkoutHistory } from './types';

const STORAGE_KEY = 'kettlebell-workouts';

function readStorage(): WorkoutHistory {
  if (typeof window === 'undefined') return { workouts: [] };
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { workouts: [] };
  } catch {
    return { workouts: [] };
  }
}

function writeStorage(history: WorkoutHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function getHistory(): Promise<WorkoutHistory> {
  return readStorage();
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const history = readStorage();
  history.workouts.push(workout);
  writeStorage(history);
}

export async function updateWorkout(workout: Workout): Promise<void> {
  const history = readStorage();
  const index = history.workouts.findIndex(w => w.id === workout.id);
  if (index === -1) {
    history.workouts.push(workout);
  } else {
    history.workouts[index] = workout;
  }
  writeStorage(history);
}

export async function deleteWorkout(id: string): Promise<boolean> {
  const history = readStorage();
  const index = history.workouts.findIndex(w => w.id === id);
  if (index === -1) return false;
  history.workouts.splice(index, 1);
  writeStorage(history);
  return true;
}

export async function getWorkout(id: string): Promise<Workout | null> {
  const history = readStorage();
  return history.workouts.find(w => w.id === id) || null;
}
