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
  window.dispatchEvent(
    new CustomEvent('wordnest:auth', { detail: { mode: 'login', from: '/write' } }),
  );
}

function isFormDataPayload(data: unknown): boolean {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

function attachRequestInterceptor(client: AxiosInstance): void {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set('Accept', 'application/json');
    // A JSON Content-Type makes axios serialize FormData as JSON, which breaks
    // multipart uploads; leave it unset so the browser adds the part boundary.
    const skipJsonContentType = config.method === 'get' || isFormDataPayload(config.data);
    if (!skipJsonContentType && !config.headers.has('Content-Type')) {
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
