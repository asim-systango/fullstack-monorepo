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

/** Desk mutations: checkout, issue, return. Admin may view, not issue. */
export const STAFF_DESK_ROLES: readonly UserRole[] = [ROLES.staff];

export function canCheckout(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, STAFF_DESK_ROLES);
}

export function canReturn(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, STAFF_DESK_ROLES);
}

export function canManageBooks(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, LIBRARIAN_ROLES);
}

export function canManageMembers(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, LIBRARIAN_ROLES);
}

export function canManageFines(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, LIBRARIAN_ROLES);
}

export function canManageSettings(user: Pick<User, 'role'> | null | undefined): boolean {
  return hasRole(user, ADMIN_ROLES);
}
