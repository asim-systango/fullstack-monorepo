import { ApiClientError } from '@shared/api-client';

const MESSAGES = {
  credentials: 'Invalid email or password.',
  forbidden: 'You do not have access to do that.',
  notFound: 'We could not find that resource.',
  conflict: 'That action conflicts with the current state.',
  rateLimit: 'Too many attempts. Please wait and try again.',
  server: 'Something went wrong. Please try again.',
  network: 'Unable to connect. Check your connection and try again.',
  generic: 'Request failed. Please try again.',
} as const;

function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof ApiClientError)) return false;
  if (err.body.error === 'UnknownError' && !err.body.correlationId) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('err_network') ||
      msg.includes('failed to fetch')
    );
  }
  return false;
}

export function isEmailUnverifiedError(err: unknown): boolean {
  if (!(err instanceof ApiClientError) || err.statusCode !== 403) return false;
  const msg = err.message.toLowerCase();
  return msg.includes('not verified');
}

export function getFieldErrors(err: unknown): Record<string, string> | undefined {
  if (!(err instanceof ApiClientError) || !err.body.details?.length) return undefined;
  const fields: Record<string, string> = {};
  for (const detail of err.body.details) {
    if (!fields[detail.field]) fields[detail.field] = detail.message;
  }
  return fields;
}

export function toUserMessage(err: unknown): string {
  if (!(err instanceof ApiClientError)) {
    return MESSAGES.generic;
  }

  if (isNetworkFailure(err)) {
    return MESSAGES.network;
  }

  const backendMessage = err.message?.trim();

  switch (err.statusCode) {
    case 400:
      return backendMessage || MESSAGES.generic;
    case 401:
      return backendMessage || MESSAGES.credentials;
    case 403:
      return backendMessage || MESSAGES.forbidden;
    case 404:
      return backendMessage || MESSAGES.notFound;
    case 409:
      return backendMessage || MESSAGES.conflict;
    case 429:
      return MESSAGES.rateLimit;
    default:
      if (err.statusCode >= 500) return backendMessage || MESSAGES.server;
      return backendMessage || MESSAGES.generic;
  }
}
