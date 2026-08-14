import type { User } from '@shared/api-client';

export type UserRole = User['role'];

export const ROLES = {
  user: 'user',
  staff: 'staff',
  admin: 'admin',
} as const satisfies Record<UserRole, UserRole>;

export function hasRole(
  user: Pick<User, 'role'> | null | undefined,
  allowed: readonly UserRole[],
): boolean {
  if (!user) return false;
  return allowed.includes(user.role);
}

/** Librarian desk: staff + admin. */
export const LIBRARIAN_ROLES: readonly UserRole[] = [ROLES.staff, ROLES.admin];

/** Platform admin only. */
export const ADMIN_ROLES: readonly UserRole[] = [ROLES.admin];
