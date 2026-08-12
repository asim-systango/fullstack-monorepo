import {
  createApiClient,
  createAuthApi,
  createHealthApi,
  createAppointmentsApi,
  API_ENDPOINTS,
} from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';
import { showErrorToast, showSuccessToast } from './toast';
import { useAuthStore } from '../features/auth/store/use-auth-store';

const baseURL = resolveApiBaseUrl();
const AUTH_REFRESH_PATH = '/auth/refresh';
const APPOINTMENTS_PATH = '/appointments';
const SLOTS_PATH = '/slots';
const DOCTORS_PATH = '/doctors';

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

function getSuccessToastMessage(
  url: string,
  method: string,
  responseData: unknown,
): string | null {
  if (responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;
    if (typeof obj.message === 'string' && obj.message) return obj.message;
    if (obj.data && typeof obj.data === 'object') {
      const inner = obj.data as Record<string, unknown>;
      if (typeof inner.message === 'string' && inner.message) return inner.message;
    }
  }

  if (url.includes('/auth/login')) return 'Signed in successfully!';
  if (url.includes('/auth/register')) return 'Registration completed successfully!';
  if (url.includes('/auth/logout')) return 'Logged out successfully!';
  if (url.includes(AUTH_REFRESH_PATH)) return null;

  if (url.includes('/payments/create-checkout'))
    return 'Redirecting to checkout session...';

  if (url.includes(APPOINTMENTS_PATH)) {
    if (url.includes('/complete')) return 'Appointment marked as completed!';
    if (url.includes('/prescriptions')) return 'Prescription generated successfully!';
    if (url.includes('/medical-notes')) return 'Medical note recorded successfully!';
    if (method === 'POST') return 'Appointment booked successfully!';
    if (method === 'DELETE') return 'Appointment cancelled successfully!';
  }

  if (url.includes(SLOTS_PATH)) {
    if (url.includes('/bulk')) return 'Consultation slots generated successfully!';
    if (method === 'POST') return 'Consultation slot created successfully!';
    if (method === 'PATCH' || method === 'PUT')
      return 'Slot status updated successfully!';
    if (method === 'DELETE') return 'Consultation slot deleted successfully!';
  }

  if (url.includes(DOCTORS_PATH)) {
    if (method === 'POST') return 'Doctor profile created successfully!';
    if (method === 'PATCH' || method === 'PUT')
      return 'Doctor profile updated successfully!';
    if (method === 'DELETE') return 'Doctor account deactivated successfully!';
  }

  if (method === 'POST') return 'Action completed successfully!';
  if (method === 'PUT' || method === 'PATCH') return 'Updated successfully!';
  if (method === 'DELETE') return 'Deleted successfully!';

  return null;
}

function getErrorToastMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const body = (errObj.body || (errObj.response as Record<string, unknown>)?.data) as
      Record<string, unknown> | undefined;

    if (body) {
      if (typeof body.message === 'string' && body.message) return body.message;
      if (Array.isArray(body.message) && body.message.length > 0)
        return body.message.join(', ');
      if (typeof body.error === 'string' && body.error) return body.error;
    }
    if (typeof errObj.message === 'string' && errObj.message) return errObj.message;
  }
  return 'An error occurred while processing your request.';
}

// Response interceptor for automatic token refresh on 401 & global toast notifications
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
  (response) => {
    const method = response.config?.method?.toUpperCase() ?? '';
    const url = response.config?.url ?? '';
    const suppressSuccessToast = (response.config as unknown as Record<string, unknown>)
      ?.suppressSuccessToast;

    if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
      !suppressSuccessToast &&
      typeof window !== 'undefined'
    ) {
      const successMsg = getSuccessToastMessage(url, method, response.data);
      if (successMsg) {
        showSuccessToast(successMsg);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Toast error handling if not explicitly suppressed
    const suppressErrorToast = (originalRequest as Record<string, unknown>)
      ?.suppressErrorToast;
    const url = originalRequest?.url ?? '';

    if (
      !suppressErrorToast &&
      typeof window !== 'undefined' &&
      !url.includes(AUTH_REFRESH_PATH)
    ) {
      const errorMsg = getErrorToastMessage(error);
      showErrorToast(errorMsg);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes(AUTH_REFRESH_PATH) &&
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
        const { data } = await apiClient.post(AUTH_REFRESH_PATH, { refreshToken });
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
