import type { User } from '@shared/api-client';

/** Same-origin relative paths only; rejects protocol-relative `//…`. */
export function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) {
    return null;
  }
  return raw;
}

export function roleHomePath(role: User['role']): string {
  switch (role) {
    case 'admin':
      return '/admin/auctions';
    case 'staff':
      return '/seller';
    case 'user':
      return '/';
    default:
      return '/';
  }
}

export function postLoginPath(nextRaw: string | null, role: User['role']): string {
  return safeNextPath(nextRaw) ?? roleHomePath(role);
}

export function authPathWithNext(
  path: '/login' | '/register',
  nextRaw: string | null,
): string {
  const next = safeNextPath(nextRaw);
  if (!next) return path;
  return `${path}?next=${encodeURIComponent(next)}`;
}
