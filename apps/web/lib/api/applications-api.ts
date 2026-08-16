import { apiClient } from '@/lib/api/client';
import type { Application, ApplicationStatus, CandidateSummary } from '@/lib/api/types';

export async function applyToJob(
  jobId: string,
  body: { coverLetter: string; resumeMetaId?: string; resumeUrl?: string },
): Promise<Application> {
  const { data } = await apiClient.post<Application>(`/jobs/${jobId}/applications`, body);
  return data;
}

export async function listMyApplications(): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>('/my/applications');
  return data;
}

export async function getMyApplicationsSummary(): Promise<CandidateSummary> {
  const { data } = await apiClient.get<CandidateSummary>('/my/applications/summary');
  return data;
}

export async function listCompanyApplications(
  status?: ApplicationStatus,
): Promise<Application[]> {
  const { data } = await apiClient.get<Application[]>('/company/applications', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function getCompanyApplication(id: string): Promise<Application> {
  const { data } = await apiClient.get<Application>(`/company/applications/${id}`);
  return data;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<Application> {
  const { data } = await apiClient.patch<Application>(`/applications/${id}/status`, {
    status,
  });
  return data;
}
