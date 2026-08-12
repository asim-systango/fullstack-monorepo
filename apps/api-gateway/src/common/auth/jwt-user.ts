import type { UserRole } from '@shared/http/auth';

/** Authenticated principal on the internal API (from Bearer JWT payload). */
export type JwtUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};
