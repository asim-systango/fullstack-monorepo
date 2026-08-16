import { apiClient } from '@/lib/api/client';
import type { Company, Job } from '@/lib/api/types';
import type { MeUser } from '@/lib/auth/session';
import { FEATURES } from '@/lib/auth/session';

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

/** Pending AdminController endpoint — gated by FEATURES.adminStaffCreate. */
export async function createStaff(body: CreateStaffBody): Promise<CreateStaffResult> {
  if (!FEATURES.adminStaffCreate) {
    throw Object.assign(
      new Error(
        'POST /admin/staff is not enabled yet (set NEXT_PUBLIC_ENABLE_ADMIN_STAFF_CREATE=true when the endpoint ships).',
      ),
      { status: 501 },
    );
  }
  const { data } = await apiClient.post<CreateStaffResult>('/admin/staff', body);
  return data;
}
