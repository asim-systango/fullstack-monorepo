import type { User } from '@shared/api-client';

/** Post-login landing path by gateway role. */
export function roleHome(role: User['role']): string {
  if (role === 'admin') return '/admin/templates';
  if (role === 'user') return '/resumes';
  return '/';
}

export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}
