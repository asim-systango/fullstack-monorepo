import { unwrapData } from '@shared/api-client';
import { apiClient } from './api';
import type { PaginatedWorkouts, PersonalRecord, WorkoutFilters } from './workouts-api';

export type AssignedAthlete = {
  athleteId: string;
  email: string;
  name: string | null;
};

export async function fetchAssignedAthletes(): Promise<AssignedAthlete[]> {
  const { data } = await apiClient.get('/coach/athletes');
  return unwrapData<AssignedAthlete[]>(data);
}

export async function fetchAthleteWorkouts(
  athleteId: string,
  filters: WorkoutFilters = {},
): Promise<PaginatedWorkouts> {
  const { dateFrom, dateTo, search, page, pageSize } = filters;
  const { data } = await apiClient.get(`/coach/athletes/${athleteId}/workouts`, {
    params: { dateFrom, dateTo, search, page, limit: pageSize },
  });
  return unwrapData<PaginatedWorkouts>(data);
}

export async function fetchAthletePrs(athleteId: string): Promise<PersonalRecord[]> {
  const { data } = await apiClient.get(`/coach/athletes/${athleteId}/prs`);
  return unwrapData<PersonalRecord[]>(data);
}

export async function fetchAthleteDetails(athleteId: string) {
  const { data } = await apiClient.get(`/coach/athletes/${athleteId}`);
  return unwrapData<AssignedAthlete>(data);
}

// —— Admin: coach↔athlete assignment management ——

export type CoachOrAthleteUser = {
  id: string;
  email: string;
  name: string | null;
};

export type CoachAssignment = {
  id: string;
  coach: CoachOrAthleteUser;
  athlete: CoachOrAthleteUser;
  createdAt: string;
};

export async function fetchAssignments(): Promise<CoachAssignment[]> {
  const { data } = await apiClient.get('/coach/assignments');
  return unwrapData<CoachAssignment[]>(data);
}

export async function fetchCoachCandidates(): Promise<CoachOrAthleteUser[]> {
  const { data } = await apiClient.get('/coach/assignments/coaches');
  return unwrapData<CoachOrAthleteUser[]>(data);
}

export async function fetchAthleteCandidates(): Promise<CoachOrAthleteUser[]> {
  const { data } = await apiClient.get('/coach/assignments/athletes');
  return unwrapData<CoachOrAthleteUser[]>(data);
}

export async function createAssignment(input: {
  coachUserId: string;
  athleteUserId: string;
}): Promise<CoachAssignment> {
  const { data } = await apiClient.post('/coach/assignments', input);
  return unwrapData<CoachAssignment>(data);
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient.delete(`/coach/assignments/${id}`);
}
