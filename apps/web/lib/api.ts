import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  createAppointmentsApi,
  API_ENDPOINTS,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';

const baseURL = resolveApiBaseUrl();

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
export const appointmentsApi = createAppointmentsApi(apiClient);
export { API_ENDPOINTS };
