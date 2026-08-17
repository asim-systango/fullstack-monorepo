import type { DraftExercise, DraftSet } from '@/lib/store/workouts.slice';
import type { CreateExerciseInput, Workout } from '@/lib/workouts-api';

export function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateOnlyInput(iso: string): string {
  return iso.slice(0, 10);
}

export function isDraftValid(exercises: DraftExercise[]): boolean {
  if (exercises.length === 0) return false;
  return exercises.every(
    (exercise) =>
      exercise.exerciseName.trim().length > 0 &&
      exercise.sets.length > 0 &&
      exercise.sets.every((set) => set.reps !== '' && Number(set.reps) >= 0),
  );
}

export function toWorkoutExercisesInput(
  exercises: DraftExercise[],
): CreateExerciseInput[] {
  return exercises.map((exercise) => ({
    exerciseName: exercise.exerciseName.trim(),
    sets: exercise.sets.map((set) => ({
      reps: Number(set.reps),
      weightKg: set.weightKg === '' ? undefined : Number(set.weightKg),
    })),
  }));
}

export function workoutToDraftExercises(workout: Workout): DraftExercise[] {
  return workout.exerciseLogs.map((log): DraftExercise => ({
    exerciseName: log.exerciseName,
    sets: log.sets.map((set): DraftSet => ({
      reps: String(set.reps),
      weightKg: set.weightKg === null ? '' : String(set.weightKg),
    })),
  }));
}
