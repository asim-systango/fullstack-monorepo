import { apiClient } from '@/lib/api/client';
import type { Company, Job } from '@/lib/api/types';
import type { MeUser } from '@/lib/auth/session';

export async function listAdminCompanies(): Promise<Company[]> {
  const { data } = await apiClient.get<Company[]>('/admin/companies');
  return data;
}

export async function suspendCompany(id: string): Promise<Company> {
  const { data } = await apiClient.post<Company>(`/admin/companies/${id}/suspend`);
  return data;
}

export async function reactivateCompany(id: string): Promise<Company> {
  const { data } = await apiClient.post<Company>(`/admin/companies/${id}/reactivate`);
  return data;
}

export async function forceCloseJob(id: string): Promise<Job> {
  const { data } = await apiClient.post<Job>(`/admin/jobs/${id}/force-close`);
  return data;
}

export type CreateStaffBody = { email: string; name: string };
export type CreateStaffResult = MeUser & { tempPassword: string };

export async function createStaff(body: CreateStaffBody): Promise<CreateStaffResult> {
  const { data } = await apiClient.post<CreateStaffResult>('/admin/staff', body);
  return data;
}
