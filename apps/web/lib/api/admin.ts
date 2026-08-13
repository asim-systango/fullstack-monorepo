import { apiClient } from './api-client';
import type { User } from '@shared/types';

export type CreateEditorInput = {
  name: string;
  email: string;
  password: string;
};

export type AdminUsersResponse = {
  users: User[];
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

export async function createEditor(input: CreateEditorInput): Promise<User> {
  const { data } = await apiClient.post<User>('/admin/editors', input);
  return data;
}
