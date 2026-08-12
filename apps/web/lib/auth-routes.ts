import type { User } from '@shared/api-client';

/** First sidebar tab for each role after login. */
export function homePathForRole(role: User['role']): string {
  if (role === 'staff') return '/restaurant/dashboard';
  if (role === 'admin') return '/admin';
  return '/restaurants';
}
