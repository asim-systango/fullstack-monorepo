import { createApiClient, createAuthApi, createHealthApi } from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window === 'undefined') return;
    const { pathname, search } = window.location;
    if (pathname.startsWith('/login')) return;
    // come back to the same page after logging in again
    window.location.assign(`/login?next=${encodeURIComponent(pathname + search)}`);
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
