import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  createTicketsApi,
  createCategoriesApi,
  createNotificationsApi,
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
export const ticketsApi = createTicketsApi(apiClient);
export const categoriesApi = createCategoriesApi(apiClient);
export const notificationsApi = createNotificationsApi(apiClient);
