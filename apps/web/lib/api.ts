import { createApiClient, unwrapData } from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | null;
  isPasswordChangeRequired: boolean;
  lastLoginAt: number;
}

export interface OrganizationContext {
  id: string;
  name: string;
  slug: string;
  primaryDomain: string;
  logoUrl?: string;
}

export interface LoginResponse {
  accessToken: string | null;
  passwordResetToken?: string | null;
  isPasswordChangeRequired?: boolean;
  tokenType?: string;
  expiresIn?: string;
  user: UserProfile;
  organization: OrganizationContext | null;
  message?: string;
}

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/update-password') &&
        !window.location.pathname.startsWith('/reset-password')
      ) {
        window.location.assign('/login');
      }
    }
  },
});

// Attach Authorization header if token exists in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

import type { OnboardOrganizationPayload } from '@shared/types';
export type { OnboardOrganizationPayload };

export const authApi = {
  async login(payload: { email: string; password?: string }): Promise<LoginResponse> {
    // Bulletproof routing: ensure request always hits /api/v1/auth/login
    const endpoint = baseURL.endsWith('/v1') ? '/auth/login' : '/v1/auth/login';
    const response = await apiClient.post(endpoint, payload);
    return unwrapData<LoginResponse>(response.data);
  },
  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const endpoint = baseURL.endsWith('/v1')
      ? '/auth/reset-password'
      : '/v1/auth/reset-password';
    const response = await apiClient.post(endpoint, payload);
    return unwrapData<{ message: string }>(response.data);
  },
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');
      document.cookie =
        'systango_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  },
};

export const organizationsApi = {
  async onboard(payload: OnboardOrganizationPayload) {
    const endpoint = baseURL.endsWith('/v1')
      ? '/organizations/onboard'
      : '/v1/organizations/onboard';
    const response = await apiClient.post(endpoint, payload);
    return unwrapData(response.data);
  },
};

export interface SubmitOnboardingRequestPayload {
  contactName: string;
  email: string;
  companyName: string;
  phone?: string;
  companySize?: string;
  industry?: string;
  website?: string;
  message?: string;
}

export const formsApi = {
  async submitOnboardingRequest(payload: SubmitOnboardingRequestPayload) {
    const endpoint = baseURL.endsWith('/v1')
      ? '/forms/onboarding-request'
      : '/v1/forms/onboarding-request';
    const response = await apiClient.post(endpoint, payload);
    return unwrapData<{ message: string; submissionId: string }>(response.data);
  },
};
