import { ROUTES } from './routes';

const FALLBACK = ROUTES.dashboard;

/**
 * Allow only same-origin relative paths. Blocks protocol-relative and open redirects.
 */
export function getSafeNextPath(
  value: string | null | undefined,
  fallback = FALLBACK,
): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('://')) {
    return fallback;
  }
  return value;
}
