'use client';

import { RequireRole } from '@/components/dashboard/require-role';
import { AdminWorkspace } from '@/components/admin';
import { ADMIN_ROLES } from '@/lib/auth/roles';

export default function AdminPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <AdminWorkspace />
    </RequireRole>
  );
}
