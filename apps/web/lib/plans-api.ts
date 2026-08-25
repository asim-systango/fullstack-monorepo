import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';

export type PlanExercise = {
  exerciseName: string;
  targetSets: number;
  targetReps: number;
};

export type PlanDay = {
  id: string;
  dayLabel: string;
  order: number;
  exercises: PlanExercise[];
};

export type WorkoutPlan = {
  id: string;
  userId: string;
  title: string;
  notes: string | null;
  days: PlanDay[];
  createdAt: string;
  updatedAt: string;
};

export type PlanDayInput = {
  dayLabel: string;
  order: number;
  exercises: PlanExercise[];
};

export type CreatePlanInput = {
  title: string;
  notes?: string;
  days: PlanDayInput[];
};

export type UpdatePlanInput = {
  title?: string;
  notes?: string;
  days?: PlanDayInput[];
};

export async function fetchPlans(): Promise<WorkoutPlan[]> {
  const { data } = await apiClient.get('/plans');
  return unwrapData<WorkoutPlan[]>(data);
}

export async function fetchPlan(id: string): Promise<WorkoutPlan> {
  const { data } = await apiClient.get(`/plans/${id}`);
  return unwrapData<WorkoutPlan>(data);
}

export async function createPlan(input: CreatePlanInput): Promise<WorkoutPlan> {
  const { data } = await apiClient.post('/plans', input);
  return unwrapData<WorkoutPlan>(data);
}

export async function updatePlan(
  id: string,
  input: UpdatePlanInput,
): Promise<WorkoutPlan> {
  const { data } = await apiClient.patch(`/plans/${id}`, input);
  return unwrapData<WorkoutPlan>(data);
}

export async function deletePlan(id: string): Promise<void> {
  await apiClient.delete(`/plans/${id}`);
}
