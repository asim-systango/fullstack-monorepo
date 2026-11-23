import axios, {
  type AxiosError,
  type AxiosInstance,
  type CreateAxiosDefaults,
} from 'axios';
import { z } from 'zod';
import { apiErrorSchema, userSchema, type ApiErrorBody, type User } from '@shared/types';

export { apiErrorSchema, userSchema, type ApiErrorBody, type User };

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = body.statusCode;
    this.body = body;
  }
}

function toApiError(error: AxiosError): ApiClientError {
  const data = error.response?.data;
  const parsed = apiErrorSchema.safeParse(data);
  if (parsed.success) {
    return new ApiClientError(parsed.data);
  }
  return new ApiClientError({
    statusCode: error.response?.status ?? 500,
    error: 'UnknownError',
    message: error.message || 'Request failed',
  });
}

/** Unwrap Nest `{ data: T }` success envelope. */
export function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'data' in payload &&
    Object.keys(payload as object).length === 1
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export type CreateApiClientOptions = CreateAxiosDefaults & {
  withCredentials?: boolean;
  onUnauthorized?: () => void;
};

export function createApiClient(options: CreateApiClientOptions = {}): AxiosInstance {
  const { onUnauthorized, ...axiosConfig } = options;
  const client = axios.create({
    timeout: 15_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    ...axiosConfig,
  });

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const apiError = toApiError(error);
      if (apiError.statusCode === 401) {
        const url = error.config?.url ?? '';
        if (
          !url.includes('/auth/me') &&
          !url.includes('/auth/login') &&
          !url.includes('/auth/register')
        ) {
          onUnauthorized?.();
        }
      }
      return Promise.reject(apiError);
    },
  );

  return client;
}

export function createAuthApi(client: AxiosInstance) {
  return {
    async login(input: { email: string; password: string }): Promise<User> {
      const { data } = await client.post('/auth/login', input);
      return userSchema.parse(unwrapData(data));
    },
    async register(input: {
      email: string;
      password: string;
      name: string;
    }): Promise<User> {
      const { data } = await client.post('/auth/register', input);
      return userSchema.parse(unwrapData(data));
    },
    async me(): Promise<User> {
      const { data } = await client.get('/auth/me');
      return userSchema.parse(unwrapData(data));
    },
    async logout(): Promise<void> {
      await client.post('/auth/logout');
    },
  };
}

export function createHealthApi(client: AxiosInstance) {
  return {
    async check(): Promise<{ status: string }> {
      const { data } = await client.get('/health');
      const parsed = z.object({ status: z.string() }).parse(unwrapData(data));
      return { status: parsed.status };
    },
  };
}
