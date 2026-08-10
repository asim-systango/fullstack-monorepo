import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  createAppointmentsApi,
  API_ENDPOINTS,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';
import { useAuthStore } from '../features/auth/store/use-auth-store';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      useAuthStore.getState().clearAuth();
      window.location.assign('/login');
    }
  },
});

// Attach Authorization Bearer token header interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token =
      useAuthStore.getState().accessToken || localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for automatic token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        useAuthStore.getState().refreshToken ||
        (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await apiClient.post('/auth/refresh', { refreshToken });
        const newAccessToken = data.accessToken || data.data?.accessToken;
        const newRefreshToken = data.refreshToken || data.data?.refreshToken;
        const user = data.user || data.data?.user;

        if (newAccessToken && user) {
          useAuthStore.getState().setAuth({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken || refreshToken,
            user,
          });
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().clearAuth();
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
export const appointmentsApi = createAppointmentsApi(apiClient);
export { API_ENDPOINTS };
