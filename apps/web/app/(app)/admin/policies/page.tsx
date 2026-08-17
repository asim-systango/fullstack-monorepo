'use client';

import { RequireRole } from '@/components/dashboard/require-role';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminSettingsPanel } from '@/components/admin/admin-settings-panel';
import { ADMIN_ROLES } from '@/lib/auth/roles';

export default function AdminPoliciesPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <div className="admin-content">
        <AdminPageHeader
          title="Library policies"
          description="Borrowing limits, loan duration, and fine configuration."
        />
        <AdminSettingsPanel />
      </div>
    </RequireRole>
  );
}
