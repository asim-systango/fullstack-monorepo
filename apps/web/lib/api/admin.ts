import { apiClient } from './api-client';
import type { User } from '@shared/types';

export type CreateEditorInput = {
  name: string;
  email: string;
  password: string;
};

/** Wider than the session `User`: the console also shows join date and status. */
export type AdminUser = User & {
  isActive: boolean;
  createdAt: string;
};

export type UpdateAdminUserInput = {
  id: string;
  name?: string;
  email?: string;
  isActive?: boolean;
};

export type AdminUsersResponse = {
  users: AdminUser[];
  counts: {
    total: number;
    authors: number;
    editors: number;
    admins: number;
  };
};

export async function fetchAdminUsers(): Promise<AdminUsersResponse> {
  const { data } = await apiClient.get<AdminUsersResponse>('/admin/users');
  return data;
}

export async function createEditor(input: CreateEditorInput): Promise<AdminUser> {
  const { data } = await apiClient.post<AdminUser>('/admin/editors', input);
  return data;
}

export async function updateAdminUser({
  id,
  ...patch
}: UpdateAdminUserInput): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}`, patch);
  return data;
}
