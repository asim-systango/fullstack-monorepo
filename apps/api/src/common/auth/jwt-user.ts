import type { UserRole } from '@shared/http/auth';

/** Authenticated principal on the internal API (from DB-backed JWT strategy). */
export type JwtUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  emailVerified?: boolean;
  mustChangePassword?: boolean;
};
