import { createApiClient, createAuthApi, createHealthApi } from '@repo/api-client';

/** Same-origin `/api` → Next rewrite → api-gateway. Override only if needed. */
const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/$/, '');

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
