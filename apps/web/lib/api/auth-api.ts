import { apiClient } from '@/lib/api/client';
import type { MeUser } from '@/lib/auth/session';

export type LoginBody = { email: string; password: string };
export type RegisterBody = { email: string; password: string; name: string };
export type ChangePasswordBody = { currentPassword: string; newPassword: string };

export async function login(body: LoginBody): Promise<MeUser> {
  const { data } = await apiClient.post<MeUser>('/auth/login', body);
  return data;
}

export async function register(body: RegisterBody): Promise<MeUser> {
  const { data } = await apiClient.post<MeUser>('/auth/register', body);
  return data;
}

export async function fetchMe(): Promise<MeUser> {
  const { data } = await apiClient.get<MeUser>('/auth/me', { skipAuthRedirect: true });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout', undefined, { skipAuthRedirect: true });
}

export async function changePassword(body: ChangePasswordBody): Promise<MeUser> {
  const { data } = await apiClient.post<MeUser>('/auth/change-password', body);
  return data;
}
