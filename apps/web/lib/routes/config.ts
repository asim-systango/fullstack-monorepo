import type { AppRole } from '@/lib/auth/jwt';

export type RouteAccess =
  | { type: 'public' }
  | { type: 'authenticated' }
  | { type: 'roles'; roles: readonly AppRole[] };

export type AppRouteConfig = {
  /** Path pattern; `:param` segments supported */
  path: string;
  access: RouteAccess;
  /** Optional label for nav / docs */
  label?: string;
};

/**
 * Single source of truth for app routes and role access.
 * Middleware + client helpers both read from this list.
 */
export const appRoutes: readonly AppRouteConfig[] = [
  { path: '/', access: { type: 'public' }, label: 'Home' },
  { path: '/jobs', access: { type: 'public' }, label: 'Jobs' },
  { path: '/jobs/:id', access: { type: 'public' }, label: 'Job detail' },
  { path: '/login', access: { type: 'public' }, label: 'Login' },
  { path: '/register', access: { type: 'public' }, label: 'Register' },
  { path: '/unauthorized', access: { type: 'public' }, label: 'Unauthorized' },

  {
    path: '/applications',
    access: { type: 'roles', roles: ['user'] },
    label: 'My applications',
  },
  { path: '/bookmarks', access: { type: 'roles', roles: ['user'] }, label: 'Bookmarks' },
  {
    path: '/applications/summary',
    access: { type: 'roles', roles: ['user'] },
    label: 'Applications summary',
  },

  {
    path: '/company/jobs',
    access: { type: 'roles', roles: ['staff'] },
    label: 'Company jobs',
  },
  {
    path: '/dashboard',
    access: { type: 'roles', roles: ['staff'] },
    label: 'Staff dashboard',
  },
  {
    path: '/company/applications',
    access: { type: 'roles', roles: ['staff'] },
    label: 'Company applications',
  },

  { path: '/admin', access: { type: 'roles', roles: ['admin'] }, label: 'Admin' },
] as const;

export function routesForRole(role: AppRole | null | undefined): AppRouteConfig[] {
  return appRoutes.filter((route) => canRoleAccess(route.access, role));
}

export function canRoleAccess(
  access: RouteAccess,
  role: AppRole | null | undefined,
): boolean {
  if (access.type === 'public') {
    return true;
  }
  if (!role) {
    return false;
  }
  if (access.type === 'authenticated') {
    return true;
  }
  return access.roles.includes(role);
}

/** Convert `/jobs/:id` → regex that matches `/jobs/abc` */
export function pathToRegex(path: string): RegExp {
  const escaped = path
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      if (segment.startsWith(':')) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp(`^${escaped}/?$`);
}

export function matchAppRoute(pathname: string): AppRouteConfig | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return appRoutes.find((route) => pathToRegex(route.path).test(normalized));
}
