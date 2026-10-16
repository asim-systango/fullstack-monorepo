'use client';

import { Suspense } from 'react';
import type { MemberStatus } from '@shared/types';
import { Field, Select } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import { AdminMembersPanel } from '@/components/admin/admin-members-panel';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { ADMIN_ROLES } from '@/lib/auth/roles';
import { useStaffListParams } from '@/lib/staff';

function SuspendRestoreContent() {
  const { get, replace } = useStaffListParams();
  const status = (get('status') || 'suspended') as MemberStatus | '';

  return (
    <div className="admin-content">
      <AdminPageHeader
        title="Suspend / Restore"
        description="Suspend library access or restore members. Create and promote accounts stay on Members."
      />
      <div className="mb-4 max-w-xs">
        <Field label="Status" htmlFor="suspend-status">
          <Select
            id="suspend-status"
            value={status}
            onChange={(e) => replace({ status: e.target.value || 'suspended' })}
          >
            <option value="suspended">Suspended</option>
            <option value="active">Active</option>
          </Select>
        </Field>
      </div>
      <AdminMembersPanel
        status={(status || 'suspended') as MemberStatus}
        title={status === 'active' ? 'Active members' : 'Suspended members'}
        description="Choose a reason when suspending. Restore returns library access immediately."
      />
    </div>
  );
}

export default function AdminSuspendedPage() {
  return (
    <RequireRole allowed={ADMIN_ROLES}>
      <Suspense
        fallback={
          <div className="admin-content">
            <AdminPageHeader title="Suspend / Restore" />
          </div>
        }
      >
        <SuspendRestoreContent />
      </Suspense>
    </RequireRole>
  );
}
