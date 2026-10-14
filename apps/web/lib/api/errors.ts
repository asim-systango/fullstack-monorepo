export type ApiError = Error & {
  status?: number;
  body?: {
    statusCode: number;
    error: string;
    message: string | string[];
    details?: Array<{ field: string; message: string }>;
  };
};

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as ApiError).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}
