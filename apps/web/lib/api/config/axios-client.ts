import { createApiClient } from '@shared/api-client';
import { resolveApiBaseUrl } from '../../api-base-url';

export const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('organization');

      const currentPath = window.location.pathname;
      if (
        !currentPath.startsWith('/login') &&
        !currentPath.startsWith('/update-password') &&
        !currentPath.startsWith('/reset-password')
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
