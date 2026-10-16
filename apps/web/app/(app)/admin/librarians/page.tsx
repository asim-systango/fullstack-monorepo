'use client';

import { RequireRole } from '@/components/dashboard/require-role';
import { AdminMembersPanel } from '@/components/admin/admin-members-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ADMIN_ROLES } from '@/lib/auth/roles';

export default function AdminLibrariansPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <div className="admin-content">
        <AdminPageHeader
          title="Librarians"
          description="Staff accounts with library desk access."
        />
        <AdminMembersPanel
          role="staff"
          title="Staff"
          description="Promote members from the Members page. Suspend or restore access here."
        />
      </div>
    </RequireRole>
  );
}
