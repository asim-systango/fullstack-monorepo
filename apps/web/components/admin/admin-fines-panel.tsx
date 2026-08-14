'use client';

import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useFines, useMembers } from '@/lib/bookly';
import { AdminEmptyState } from './admin-empty-state';
import { AdminFineRow, useMemberNameMap } from './admin-fine-row';

export function AdminFinesPanel() {
  const fines = useFines({ limit: 50 });
  const members = useMembers({ limit: 100 });
  const membersByUserId = useMemberNameMap(members.data?.items);

  return (
    <section id="fines" className="admin-panel admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Fines</h2>
        <p className="admin-section-desc">Outstanding and historical fines.</p>
      </div>
      <div className="admin-panel-body">
        {fines.isPending ? (
          <div className="space-y-2">
            <Skeleton size="md" />
            <Skeleton size="md" />
            <Skeleton size="md" />
          </div>
        ) : null}
        {fines.isError ? (
          <Alert tone="danger" title="Could not load fines">
            {toUserMessage(fines.error)}
          </Alert>
        ) : null}
        {fines.data && fines.data.items.length === 0 ? (
          <AdminEmptyState
            title="No outstanding fines"
            description="All current fine balances are clear."
          />
        ) : null}
        {fines.data && fines.data.items.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {fines.data.items.map((fine) => (
              <AdminFineRow key={fine.id} fine={fine} membersByUserId={membersByUserId} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
