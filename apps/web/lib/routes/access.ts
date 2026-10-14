import type { AppRole } from '@/lib/auth/jwt';
import { canRoleAccess, matchAppRoute, type RouteAccess } from '@/lib/routes/config';

export type RouteGateResult =
  | { status: 'allow' }
  | { status: 'login' }
  | { status: 'forbidden' }
  | { status: 'unknown' };

export function evaluateRouteAccess(
  pathname: string,
  role: AppRole | null | undefined,
): RouteGateResult {
  const route = matchAppRoute(pathname);
  if (!route) {
    return { status: 'unknown' };
  }

  return evaluateAccess(route.access, role);
}

export function evaluateAccess(
  access: RouteAccess,
  role: AppRole | null | undefined,
): RouteGateResult {
  if (access.type === 'public') {
    return { status: 'allow' };
  }

  if (!role) {
    return { status: 'login' };
  }

  if (canRoleAccess(access, role)) {
    return { status: 'allow' };
  }

  return { status: 'forbidden' };
}
