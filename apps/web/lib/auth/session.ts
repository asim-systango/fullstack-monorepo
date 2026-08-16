import type { User } from '@shared/types';
import type { AppRole } from '@/lib/auth/jwt';

/** Auth/me payload — optional password-change flags may arrive later from gateway. */
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

/**
 * Pending backend endpoints — keep pages wired, gate the real HTTP call.
 * Set NEXT_PUBLIC_ENABLE_* = "true" once the gateway/api routes ship.
 */
export const FEATURES = {
  changePassword: process.env.NEXT_PUBLIC_ENABLE_CHANGE_PASSWORD === 'true',
  adminStaffCreate: process.env.NEXT_PUBLIC_ENABLE_ADMIN_STAFF_CREATE === 'true',
} as const;
