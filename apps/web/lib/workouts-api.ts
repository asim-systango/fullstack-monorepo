import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';

export type WorkoutSet = {
  id: string;
  reps: number;
  weightKg: number | null;
};

export type WorkoutExerciseLog = {
  id: string;
  exerciseName: string;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  userId: string;
  title: string;
  performedAt: string;
  deletedAt: string | null;
  exerciseLogs: WorkoutExerciseLog[];
};

export type PaginatedWorkoutsMeta = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
};

export type PaginatedWorkouts = {
  items: Workout[];
  meta: PaginatedWorkoutsMeta;
};

export type WorkoutFilters = {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  /** Sent as `limit` to match the domain API's `ListWorkoutsDto`. */
  pageSize?: number;
};

export type CreateSetInput = {
  reps: number;
  /** Omit for bodyweight sets with no external weight. */
  weightKg?: number;
};

export type CreateExerciseInput = {
  exerciseName: string;
  sets: CreateSetInput[];
};

export type CreateWorkoutInput = {
  title: string;
  performedAt: string;
  exercises: CreateExerciseInput[];
};

export type UpdateWorkoutInput = {
  title?: string;
  performedAt?: string;
  /** When provided, replaces the entire exercise/set tree. */
  exercises?: CreateExerciseInput[];
};

export type PersonalRecord = {
  id: string;
  userId: string;
  exerciseName: string;
  bestWeightKg: number | null;
  bestReps: number;
  updatedAt: string;
};

export async function fetchWorkouts(
  filters: WorkoutFilters = {},
): Promise<PaginatedWorkouts> {
  const { dateFrom, dateTo, search, page, pageSize } = filters;
  const { data } = await apiClient.get('/workouts', {
    params: { dateFrom, dateTo, search, page, limit: pageSize },
  });
  return unwrapData<PaginatedWorkouts>(data);
}

export type CreatedWorkout = Workout & {
  /** Exercise names whose best set in this save became (or started) a personal record. */
  newPersonalRecords: string[];
};

export async function createWorkout(input: CreateWorkoutInput): Promise<CreatedWorkout> {
  const { data } = await apiClient.post('/workouts', input);
  return unwrapData<CreatedWorkout>(data);
}

export async function fetchWorkout(id: string): Promise<Workout> {
  const { data } = await apiClient.get(`/workouts/${id}`);
  return unwrapData<Workout>(data);
}

export async function updateWorkout(
  id: string,
  input: UpdateWorkoutInput,
): Promise<Workout> {
  const { data } = await apiClient.patch(`/workouts/${id}`, input);
  return unwrapData<Workout>(data);
}

export async function deleteWorkout(id: string): Promise<void> {
  await apiClient.delete(`/workouts/${id}`);
}

export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  const { data } = await apiClient.get('/prs');
  return unwrapData<PersonalRecord[]>(data);
}
