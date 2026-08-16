import type { AxiosError } from 'axios';
import { apiErrorSchema, type ApiErrorBody } from '@shared/types';

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

function readErrorMessage(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'string') return value;
  return '';
}

export function toApiClientError(error: AxiosError): ApiClientError {
  const data = error.response?.data;
  const parsed = apiErrorSchema.safeParse(data);
  if (parsed.success) {
    return new ApiClientError(parsed.data);
  }

  // Keep the API's message even when optional fields (details shape, etc.) fail Zod.
  if (data !== null && typeof data === 'object' && 'message' in data) {
    const body = data as { message?: unknown; error?: unknown };
    const message = readErrorMessage(body.message);
    if (message.trim()) {
      return new ApiClientError({
        statusCode: error.response?.status ?? 500,
        error: typeof body.error === 'string' ? body.error : 'Error',
        message,
      });
    }
  }

  return new ApiClientError({
    statusCode: error.response?.status ?? 500,
    error: 'UnknownError',
    message: error.message || 'Request failed',
  });
}
