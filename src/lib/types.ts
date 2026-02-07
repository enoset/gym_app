export type MuscleGroup =
  | 'quadriceps'
  | 'glutes'
  | 'hamstrings'
  | 'back'
  | 'traps'
  | 'lower_back'
  | 'shoulders'
  | 'abs';

export type WorkoutGoal = 'strength' | 'endurance' | 'fat_loss' | 'muscle_building';

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  isCompound: boolean;
}

export interface GoalConfig {
  label: string;
  description: string;
  repsMin: number;
  repsMax: number;
  rounds: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  exerciseCount: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  reps: number;
  weight: number | null;
  suggestedWeight: number | null;
  completed: boolean;
}

export interface Workout {
  id: string;
  goal: WorkoutGoal;
  goalLabel: string;
  date: string;
  exercises: WorkoutExercise[];
  rounds: number;
  currentRound: number;
  restBetweenExercises: number;
  restBetweenRounds: number;
  completed: boolean;
}

export interface WorkoutHistory {
  workouts: Workout[];
}
