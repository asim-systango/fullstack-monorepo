import { createApiClient, createAuthApi, createHealthApi } from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    // Intentionally empty. Route protection and authentication state
    // are handled gracefully by components and useAuth provider.
  },
});

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
