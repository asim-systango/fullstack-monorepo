import { createApiClient, createAuthApi, createHealthApi } from '@shared/api-client';
import { AUTH_COOKIE_NAME } from '@shared/env/constants';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/;`;
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
