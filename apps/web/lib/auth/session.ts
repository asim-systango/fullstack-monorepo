import type { User } from '@shared/types';
import type { AppRole } from '@/lib/auth/jwt';

/** Auth/me + login payload from the gateway. */
export type MeUser = User & {
  mustChangePassword?: boolean;
  requires_password_change?: boolean;
};

export function requiresPasswordChange(user: MeUser | null | undefined): boolean {
  if (!user) return false;
  return user.mustChangePassword === true || user.requires_password_change === true;
}

export function homePathForRole(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin/companies';
    case 'staff':
      return '/dashboard';
    case 'user':
      return '/jobs';
    default:
      return '/jobs';
  }
}
