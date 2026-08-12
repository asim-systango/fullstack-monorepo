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

// Track every real HTTP call for the global loading overlay.
// Skip auth session/login/logout/register — those use AuthBusyOverlay labels instead.
function shouldTrackApiLoading(url: string): boolean {
  return !(
    url.includes('/auth/me') ||
    url.includes('/auth/login') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/register')
  );
}

apiClient.interceptors.request.use((config) => {
  const url = config.url ?? '';
  if (shouldTrackApiLoading(url)) {
    apiLoading.start();
    (config as { __apiLoadingTracked?: boolean }).__apiLoadingTracked = true;
  }
  return config;
});

function stopTrackedLoading(config: { __apiLoadingTracked?: boolean } | undefined) {
  if (!config?.__apiLoadingTracked) return;
  apiLoading.stop();
  // Prevent double-stop if both response + error paths somehow run.
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
