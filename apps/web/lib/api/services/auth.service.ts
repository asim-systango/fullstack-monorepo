import { unwrapData } from '@shared/api-client';
import { apiClient } from '../config/axios-client';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { LoginResponse } from '../types';

export const authApi = {
  async login(payload: { email: string; password?: string }): Promise<LoginResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
    return unwrapData<LoginResponse>(response.data);
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
    return unwrapData<{ message: string }>(response.data);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.warn('Logout API failed, clearing local session anyway', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('organization');
        document.cookie =
          'systango_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
  },
};
