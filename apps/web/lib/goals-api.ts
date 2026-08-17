import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';

export type GoalWithProgress = {
  id: string;
  userId: string;
  exerciseName: string;
  targetWeightKg: number;
  targetReps: number | null;
  targetDate: string | null;
  currentBestWeightKg: number | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalInput = {
  exerciseName: string;
  targetWeightKg: number;
  targetReps?: number;
  targetDate?: string;
};

export type UpdateGoalInput = Partial<CreateGoalInput>;

export async function fetchGoals(): Promise<GoalWithProgress[]> {
  const { data } = await apiClient.get('/goals');
  return unwrapData<GoalWithProgress[]>(data);
}

export async function fetchGoal(id: string): Promise<GoalWithProgress> {
  const { data } = await apiClient.get(`/goals/${id}`);
  return unwrapData<GoalWithProgress>(data);
}

export async function createGoal(input: CreateGoalInput): Promise<GoalWithProgress> {
  const { data } = await apiClient.post('/goals', input);
  return unwrapData<GoalWithProgress>(data);
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput,
): Promise<GoalWithProgress> {
  const { data } = await apiClient.patch(`/goals/${id}`, input);
  return unwrapData<GoalWithProgress>(data);
}

export async function deleteGoal(id: string): Promise<void> {
  await apiClient.delete(`/goals/${id}`);
}
