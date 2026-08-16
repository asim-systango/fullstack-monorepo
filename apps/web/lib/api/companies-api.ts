import { apiClient } from '@/lib/api/client';
import type { Company, StaffDashboard } from '@/lib/api/types';

export async function getMyCompany(): Promise<Company> {
  const { data } = await apiClient.get<Company>('/companies/me');
  return data;
}

export async function createCompany(body: {
  name: string;
  website?: string;
  description?: string;
}): Promise<Company> {
  const { data } = await apiClient.post<Company>('/companies', body);
  return data;
}

export async function getStaffDashboard(): Promise<StaffDashboard> {
  const { data } = await apiClient.get<StaffDashboard>('/dashboard');
  return data;
}
