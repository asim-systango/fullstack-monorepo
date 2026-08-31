import { apiClient } from '@/lib/api/client';
import type { Job, PaginatedJobs } from '@/lib/api/types';

export type ListJobsParams = {
  page?: number;
  limit?: number;
  title?: string;
  location?: string;
};

export async function listPublicJobs(
  params: ListJobsParams = {},
): Promise<PaginatedJobs> {
  const { data } = await apiClient.get<PaginatedJobs>('/jobs', { params });
  return data;
}

export async function getPublicJob(id: string): Promise<Job> {
  const { data } = await apiClient.get<Job>(`/jobs/${id}`);
  return data;
}

export async function listCompanyJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<Job[]>('/company/jobs');
  return data;
}

export async function createJob(body: {
  title: string;
  location: string;
  description: string;
}): Promise<Job> {
  const { data } = await apiClient.post<Job>('/jobs', body);
  return data;
}

export async function updateJob(
  id: string,
  body: Partial<{ title: string; location: string; description: string }>,
): Promise<Job> {
  const { data } = await apiClient.patch<Job>(`/jobs/${id}`, body);
  return data;
}

export async function closeJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/jobs/${id}/close`);
  return data;
}

export async function deleteJob(id: string): Promise<{ ok: true }> {
  const { data } = await apiClient.delete<{ ok: true }>(`/jobs/${id}`);
  return data;
}
