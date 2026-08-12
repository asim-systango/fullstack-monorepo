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

export function toApiClientError(error: AxiosError): ApiClientError {
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
