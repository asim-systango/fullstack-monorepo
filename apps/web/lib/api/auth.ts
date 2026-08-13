import type { User } from '@shared/types';
import { apiClient, ApiClientError } from './api-client';

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function register(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/register', input);
  return data;
}

export async function login(input: LoginInput): Promise<User> {
  const { data } = await apiClient.post<User>('/auth/login', input);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  } catch (error) {
    if (error instanceof ApiClientError && error.statusCode === 401) {
      return null;
    }
    throw error;
  }
}
