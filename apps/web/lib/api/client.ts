import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { resolveApiBaseUrl } from '@/lib/api-base-url';
import { AUTH_LOGIN_PATH } from '@/lib/auth/constants';

export type ApiEnvelope<T> = {
  data: T;
};

export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: Array<{ field: string; message: string }>;
  correlationId?: string;
};

type RetryableConfig = InternalAxiosRequestConfig;

let unauthorizedHandler: (() => void) | null = null;

/** Register a callback (e.g. clear Zustand auth) for 401 responses. */
export function onUnauthorized(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function isEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(value) && typeof value === 'object' && 'data' in (value as object);
}

export function createApiClient(baseURL = resolveApiBaseUrl()): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (isEnvelope(response.data)) {
        return { ...response, data: response.data.data };
      }
      return response;
    },
    (error: AxiosError<ApiErrorBody>) => {
      const status = error.response?.status;
      const config = error.config as RetryableConfig | undefined;

      if (status === 401 && config && !config.skipAuthRedirect) {
        unauthorizedHandler?.();

        if (typeof window !== 'undefined') {
          const next = `${window.location.pathname}${window.location.search}`;
          const loginUrl = new URL(AUTH_LOGIN_PATH, window.location.origin);
          if (next && next !== AUTH_LOGIN_PATH) {
            loginUrl.searchParams.set('next', next);
          }
          if (!window.location.pathname.startsWith(AUTH_LOGIN_PATH)) {
            window.location.assign(loginUrl.toString());
          }
        }
      }

      return Promise.reject(normalizeApiError(error));
    },
  );

  return client;
}

export function normalizeApiError(error: AxiosError<ApiErrorBody>): Error & {
  status?: number;
  body?: ApiErrorBody;
} {
  const body = error.response?.data;
  const messageFromBody = Array.isArray(body?.message)
    ? body.message.join(', ')
    : body?.message;
  const message = messageFromBody || error.message || 'Request failed';
  const normalized = new Error(message) as Error & {
    status?: number;
    body?: ApiErrorBody;
  };
  normalized.status = error.response?.status;
  normalized.body = body;
  return normalized;
}

/** Shared browser/server axios instance (cookie JWT via credentials). */
export const apiClient = createApiClient();
