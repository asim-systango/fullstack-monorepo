/** Shared role union — rename `staff` for your domain. */
export type UserRole = 'admin' | 'user' | 'staff';

/** Minimal principal shape used by shared guards. */
export type AuthPrincipal = {
  role: UserRole;
};
