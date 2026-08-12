import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { resolveApiBaseUrl } from './base-url';
import { ApiClientError, toApiClientError } from './errors';
import { unwrapData } from './envelope';

export type CreateApiClientOptions = {
  baseURL?: string;
  /** Called on 401 outside auth login/register/me. */
  onUnauthorized?: () => void;
};

const AUTH_PUBLIC_PATHS = ['/auth/me', '/auth/login', '/auth/register'] as const;

function isAuthPublicPath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PUBLIC_PATHS.some((path) => url.includes(path));
}

function defaultUnauthorizedHandler(): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/login')) return;
  window.location.assign('/login');
}

function attachRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set('Accept', 'application/json');
    if (!config.headers.has('Content-Type') && config.method !== 'get') {
      config.headers.set('Content-Type', 'application/json');
    }
    return config;
  });
}

function attachResponseInterceptor(
  client: AxiosInstance,
  onUnauthorized: () => void,
): void {
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      response.data = unwrapData(response.data);
      return response;
    },
    (error: AxiosError) => {
      const url = error.config?.url;
      const apiError = toApiClientError(error);

      if (apiError.statusCode === 401 && !isAuthPublicPath(url)) {
        onUnauthorized();
      }

      return Promise.reject(apiError);
    },
  );
}

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const onUnauthorized = options.onUnauthorized ?? defaultUnauthorizedHandler;

  const client = axios.create({
    baseURL: options.baseURL ?? resolveApiBaseUrl(),
    timeout: 15_000,
    withCredentials: true,
  });

  attachRequestInterceptor(client);
  attachResponseInterceptor(client, onUnauthorized);

  return client;
}

/** Shared browser API client — cookie JWT via `withCredentials`. */
export const apiClient = createApiClient();

export { ApiClientError };
