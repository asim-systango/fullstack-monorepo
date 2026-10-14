import { createApiClient, createAuthApi, createHealthApi } from '@shared/api-client';
import { resolveApiBaseUrl } from './api-base-url';
import { apiLoading } from './api-loading';

const baseURL = resolveApiBaseUrl();

export const apiClient = createApiClient({
  baseURL,
  onUnauthorized: () => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login');
    }
  },
});

function shouldTrackApiLoading(url: string, method = 'get'): boolean {
  const m = method.toLowerCase();
  return !(
    url.includes('/auth/me') ||
    url.includes('/auth/login') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/register') ||
    url.includes('/cart') ||
    url.includes('/uploads/cloudinary-signature') ||
    (m === 'patch' && url.includes('/restaurants/')) ||
    (m === 'get' && url.includes('/orders'))
  );
}

apiClient.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const method = config.method ?? 'get';
  if (shouldTrackApiLoading(url, method)) {
    apiLoading.start();
    (config as { __apiLoadingTracked?: boolean }).__apiLoadingTracked = true;
  }
  return config;
});

function stopTrackedLoading(config: { __apiLoadingTracked?: boolean } | undefined) {
  if (!config?.__apiLoadingTracked) return;
  apiLoading.stop();
  config.__apiLoadingTracked = false;
}

apiClient.interceptors.response.use(
  (response) => {
    stopTrackedLoading(response.config as { __apiLoadingTracked?: boolean });
    return response;
  },
  (error: unknown) => {
    const config = (error as { config?: { __apiLoadingTracked?: boolean } })?.config;
    stopTrackedLoading(config);
    return Promise.reject(error);
  },
);

export const authApi = createAuthApi(apiClient);
export const healthApi = createHealthApi(apiClient);
