'use client';

import { RequireRole } from '@/components/dashboard/require-role';
import { AdminCreateMemberForm } from '@/components/admin/admin-create-member-form';
import { AdminMembersPanel } from '@/components/admin/admin-members-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ADMIN_ROLES } from '@/lib/auth/roles';

export default function AdminMembersPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <div className="admin-content">
        <AdminPageHeader
          title="Members"
          description="Create library members and promote them to staff. Temporary passwords are emailed, never shown here."
        />
        <div className="grid gap-4">
          <AdminCreateMemberForm />
          <AdminMembersPanel />
        </div>
      </div>
    </RequireRole>
  );
}
