'use client';

import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useLoans, useMembers, useOverdueLoans } from '@/lib/bookly';
import { AdminEmptyState } from './admin-empty-state';
import { useMemberNameMap } from './admin-fine-row';
import { AdminLoanRow, AdminOverdueLoanRow } from './admin-loan-row';

export function AdminLoansPanel({
  showOverdue = true,
}: Readonly<{ showOverdue?: boolean }>) {
  const activeLoans = useLoans({ limit: 20, status: 'active' });
  const overdue = useOverdueLoans({ limit: 20 });
  const members = useMembers({ limit: 100 });
  const membersByUserId = useMemberNameMap(members.data?.items);

  const overdueCount = overdue.data?.total ?? overdue.data?.items.length ?? 0;

  let overdueDescription = 'Loading overdue circulation…';
  if (!overdue.isPending) {
    if (overdueCount > 0) {
      const noun = overdueCount === 1 ? 'item' : 'items';
      overdueDescription = `${overdueCount} ${noun} require attention`;
    } else {
      overdueDescription = 'Everything is currently on schedule.';
    }
  }

  return (
    <div className="space-y-4">
      {showOverdue ? (
        <section id="overdue" className="admin-panel admin-card">
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <h2 className="admin-section-title">Overdue loans</h2>
            <p className="admin-section-desc">{overdueDescription}</p>
          </div>
          <div className="admin-panel-body">
            {overdue.isPending ? (
              <div className="space-y-2">
                <Skeleton size="md" />
                <Skeleton size="md" />
              </div>
            ) : null}
            {overdue.isError ? (
              <Alert tone="danger" title="Could not load overdue loans">
                {toUserMessage(overdue.error)}
              </Alert>
            ) : null}
            {overdue.data && overdue.data.items.length === 0 ? (
              <AdminEmptyState
                title="No overdue loans"
                description="There are currently no overdue loans."
              />
            ) : null}
            {overdue.data && overdue.data.items.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {overdue.data.items.map((loan) => (
                  <AdminOverdueLoanRow
                    key={loan.id}
                    loan={loan}
                    membersByUserId={membersByUserId}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      <section id="loans" className="admin-panel admin-card">
        <div className="px-4 pt-4 pb-2 sm:px-5">
          <h2 className="admin-section-title">Active loans</h2>
          <p className="admin-section-desc">System-wide circulation visibility.</p>
        </div>
        <div className="admin-panel-body">
          {activeLoans.isPending ? (
            <div className="space-y-2">
              <Skeleton size="md" />
              <Skeleton size="md" />
            </div>
          ) : null}
          {activeLoans.isError ? (
            <Alert tone="danger" title="Could not load loans">
              {toUserMessage(activeLoans.error)}
            </Alert>
          ) : null}
          {activeLoans.data && activeLoans.data.items.length === 0 ? (
            <AdminEmptyState
              title="No active loans"
              description="Nothing is checked out right now."
            />
          ) : null}
          {activeLoans.data && activeLoans.data.items.length > 0 ? (
            <ul className="m-0 list-none p-0">
              {activeLoans.data.items.map((loan) => (
                <AdminLoanRow
                  key={loan.id}
                  loan={loan}
                  membersByUserId={membersByUserId}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}
