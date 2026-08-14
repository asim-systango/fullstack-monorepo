import type { User } from '@shared/api-client';

export function homePathForRole(role: User['role']): string {
  if (role === 'staff') return '/restaurant/dashboard';
  if (role === 'admin') return '/admin';
  return '/restaurants';
}
