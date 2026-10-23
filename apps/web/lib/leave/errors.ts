type FieldDetail = { field: string; message: string };

// looks like ApiClientError from @shared/api-client, checked by shape so tests don't need axios
type ApiErrorLike = {
  message?: unknown;
  statusCode?: unknown;
  body?: { details?: FieldDetail[] };
};

function asApiError(error: unknown): ApiErrorLike | null {
  return typeof error === 'object' && error !== null ? (error as ApiErrorLike) : null;
}

export function errorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const message = asApiError(error)?.message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

export function errorStatus(error: unknown): number | undefined {
  const status = asApiError(error)?.statusCode;
  return typeof status === 'number' ? status : undefined;
}

// { endDate: 'No working days in this range' } so each message shows under its field
export function fieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  for (const detail of asApiError(error)?.body?.details ?? []) {
    result[detail.field] ??= detail.message;
  }
  return result;
}
