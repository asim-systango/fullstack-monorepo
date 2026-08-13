import { unwrapData } from '@shared/api-client';
import { apiClient } from '../../lib/api';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ChangePasswordPayload,
} from './types';

export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', payload);
  return unwrapData<AuthResponse>(data);
}

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', payload);
  return unwrapData<AuthResponse>(data);
}

export async function refreshApi(refreshToken?: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return unwrapData<AuthResponse>(data);
}

export async function logoutApi(): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/logout');
  return unwrapData<{ message: string }>(data);
}

export async function fetchProfileApi(): Promise<AuthUser> {
  const { data } = await apiClient.get('/auth/me');
  return unwrapData<AuthUser>(data);
}

export async function changePasswordApi(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const { data } = await apiClient.post('/auth/change-password', payload);
  return unwrapData<{ message: string }>(data);
}
