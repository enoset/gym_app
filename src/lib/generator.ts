import { Exercise, GoalConfig, Workout, WorkoutExercise, WorkoutGoal, WorkoutHistory } from './types';
import { exercises } from './exercises';

const goalConfigs: Record<WorkoutGoal, GoalConfig> = {
  strength: {
    label: 'Strength',
    description: 'Heavy weights, low reps. Build raw strength.',
    repsMin: 5,
    repsMax: 8,
    rounds: 4,
    restBetweenExercises: 20,
    restBetweenRounds: 150,
    exerciseCount: 6,
  },
  muscle_building: {
    label: 'Muscle Building',
    description: 'Moderate weights, controlled reps. Hypertrophy focus.',
    repsMin: 8,
    repsMax: 12,
    rounds: 4,
    restBetweenExercises: 20,
    restBetweenRounds: 120,
    exerciseCount: 7,
  },
  fat_loss: {
    label: 'Fat Loss',
    description: 'Moderate weights, minimal rest. Max calorie burn.',
    repsMin: 12,
    repsMax: 15,
    rounds: 4,
    restBetweenExercises: 20,
    restBetweenRounds: 90,
    exerciseCount: 7,
  },
  endurance: {
    label: 'Endurance',
    description: 'Light weights, high reps. Build stamina.',
    repsMin: 15,
    repsMax: 20,
    rounds: 3,
    restBetweenExercises: 20,
    restBetweenRounds: 120,
    exerciseCount: 8,
  },
};

export function getGoalConfigs(): Record<WorkoutGoal, GoalConfig> {
  return goalConfigs;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLastWeightForExercise(exerciseId: string, history: WorkoutHistory): number | null {
  for (let i = history.workouts.length - 1; i >= 0; i--) {
    const workout = history.workouts[i];
    const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
    if (exercise && exercise.weight !== null) {
      return exercise.weight;
    }
  }
  return null;
}

export function generateWorkout(goal: WorkoutGoal, history: WorkoutHistory): Workout {
  const config = goalConfigs[goal];

  // Get exercise IDs from the most recent workout to avoid repetition
  const lastWorkout = history.workouts.length > 0
    ? history.workouts[history.workouts.length - 1]
    : null;
  const previousExerciseIds = new Set(
    lastWorkout?.exercises.map(e => e.exerciseId) || []
  );

  // Muscle group categories required for full body coverage
  const muscleCategories: { muscles: string[]; minCount: number }[] = [
    { muscles: ['quadriceps', 'glutes', 'hamstrings'], minCount: 2 },
    { muscles: ['back', 'traps', 'lower_back'], minCount: 1 },
    { muscles: ['shoulders'], minCount: 1 },
    { muscles: ['abs'], minCount: 1 },
  ];

  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();

  function pickFrom(pool: Exercise[]): Exercise | null {
    if (pool.length === 0) return null;
    const fresh = pool.filter(e => !previousExerciseIds.has(e.id));
    const candidates = fresh.length > 0 ? fresh : pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // 1. Always include at least one compound movement
  const compoundPool = exercises.filter(e => e.isCompound && !selectedIds.has(e.id));
  const compound = pickFrom(compoundPool);
  if (compound) {
    selected.push(compound);
    selectedIds.add(compound.id);
  }

  // 2. Fill each muscle category to meet minimum counts
  for (const category of muscleCategories) {
    let filled = 0;
    // Count how many selected exercises already cover this category
    for (const ex of selected) {
      if (ex.muscleGroups.some(mg => category.muscles.includes(mg))) {
        filled++;
      }
    }
    while (filled < category.minCount && selected.length < config.exerciseCount) {
      const pool = exercises.filter(
        e => !selectedIds.has(e.id) && e.muscleGroups.some(mg => category.muscles.includes(mg))
      );
      const pick = pickFrom(pool);
      if (!pick) break;
      selected.push(pick);
      selectedIds.add(pick.id);
      filled++;
    }
  }

  // 3. Fill remaining slots with any unused exercises
  while (selected.length < config.exerciseCount) {
    const pool = exercises.filter(e => !selectedIds.has(e.id));
    const pick = pickFrom(pool);
    if (!pick) break;
    selected.push(pick);
    selectedIds.add(pick.id);
  }

  // Shuffle so the order varies
  const shuffled = shuffle(selected);

  const reps = randomInt(config.repsMin, config.repsMax);

  const workoutExercises: WorkoutExercise[] = shuffled.map(e => ({
    exerciseId: e.id,
    name: e.name,
    reps,
    weight: null,
    suggestedWeight: getLastWeightForExercise(e.id, history),
    completed: false,
  }));

  return {
    id: crypto.randomUUID(),
    goal,
    goalLabel: config.label,
    date: new Date().toISOString(),
    exercises: workoutExercises,
    rounds: config.rounds,
    currentRound: 1,
    restBetweenExercises: config.restBetweenExercises,
    restBetweenRounds: config.restBetweenRounds,
    completed: false,
  };
}
