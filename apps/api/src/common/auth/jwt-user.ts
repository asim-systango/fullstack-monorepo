/** Authenticated principal on the internal API (from Bearer JWT payload). */
export type UserRole = 'admin' | 'user' | 'staff';

export type JwtUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};
