import type { UserRole } from '@shared/http/auth';

export type JwtUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
};
