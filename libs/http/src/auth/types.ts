/** Shared role union supporting healthcare domain roles. */
export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'admin' | 'user' | 'staff';

/** Minimal principal shape used by shared guards. */
export type AuthPrincipal = {
  role: UserRole;
  [key: string]: unknown;
};
