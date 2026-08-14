import type { User } from '@shared/types';

export type GatewayRole = User['role'];

export function getRoleLabel(role: GatewayRole): string {
  switch (role) {
    case 'user':
      return 'Author';
    case 'staff':
      return 'Editor';
    case 'admin':
      return 'Admin';
  }
}

export function getDashboardPath(role: GatewayRole): string {
  switch (role) {
    case 'user':
      return '/studio';
    case 'staff':
      return '/editor';
    case 'admin':
      return '/admin';
  }
}

export function getDashboardLabel(role: GatewayRole): string {
  switch (role) {
    case 'user':
      return 'Go to Studio';
    case 'staff':
      return 'Go to Editor Dashboard';
    case 'admin':
      return 'Go to Admin Dashboard';
  }
}

export function canPublish(role: GatewayRole): boolean {
  return role === 'staff' || role === 'admin';
}

export function canAccessEditor(role: GatewayRole): boolean {
  return role === 'staff';
}

export function canAccessAdmin(role: GatewayRole): boolean {
  return role === 'admin';
}

/** Resolve where to send the user after login/register. Role from API is source of truth. */
export function resolvePostAuthRedirect(
  user: User,
  requestedPath?: string | null,
): string {
  const dashboard = getDashboardPath(user.role);

  if (!requestedPath || requestedPath === '/' || requestedPath === '/write') {
    return dashboard;
  }

  if (user.role === 'user' && requestedPath.startsWith('/studio')) {
    return requestedPath;
  }

  if (
    user.role === 'staff' &&
    (requestedPath.startsWith('/editor') || requestedPath.startsWith('/studio'))
  ) {
    return requestedPath;
  }

  if (user.role === 'admin' && requestedPath.startsWith('/admin')) {
    return requestedPath;
  }

  return dashboard;
}
