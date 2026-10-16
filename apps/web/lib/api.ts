import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  createSplitterApi,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      const next = window.location.pathname + window.location.search;
      window.location.assign(`/login?returnUrl=${encodeURIComponent(next)}`);
    }
  },
});

export const authApi = createAuthApi(apiClient);
export const splitterApi = createSplitterApi(apiClient);
export const healthApi = createHealthApi(apiClient);
