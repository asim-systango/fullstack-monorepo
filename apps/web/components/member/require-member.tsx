import type { ReactNode } from 'react';
import { RequireRole } from '@/components/dashboard/require-role';
import { ROLES } from '@/lib/auth/roles';

export function RequireMember({ children }: Readonly<{ children: ReactNode }>) {
  return <RequireRole allowed={[ROLES.user]}>{children}</RequireRole>;
}
