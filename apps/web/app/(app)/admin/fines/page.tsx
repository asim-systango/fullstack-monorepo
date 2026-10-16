'use client';

import { RequireRole } from '@/components/dashboard/require-role';
import { AdminFinesPanel } from '@/components/admin/admin-fines-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ADMIN_ROLES } from '@/lib/auth/roles';

export default function AdminFinesPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <div className="admin-content">
        <AdminPageHeader
          title="Fines"
          description="Review outstanding balances, mark paid, or waive."
        />
        <AdminFinesPanel />
      </div>
    </RequireRole>
  );
}
