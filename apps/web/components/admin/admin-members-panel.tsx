'use client';

import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useMembers } from '@/lib/bookly';
import { AdminEmptyState } from './admin-empty-state';
import { AdminMemberRow } from './admin-member-row';

export function AdminMembersPanel({
  limit = 50,
  compact = false,
}: Readonly<{ limit?: number; compact?: boolean }>) {
  const members = useMembers({ limit });

  return (
    <section id="members" className="admin-panel admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Members</h2>
        <p className="admin-section-desc">
          {compact
            ? 'Recent member profiles.'
            : 'Member administration — suspend or reinstate library access.'}
        </p>
      </div>
      <div className="admin-panel-body">
        {members.isPending ? (
          <div className="space-y-2">
            <Skeleton size="md" />
            <Skeleton size="md" />
            <Skeleton size="md" />
          </div>
        ) : null}
        {members.isError ? (
          <Alert tone="danger" title="Could not load members">
            {toUserMessage(members.error)}
          </Alert>
        ) : null}
        {members.data && members.data.items.length === 0 ? (
          <AdminEmptyState
            title="No members yet"
            description="Verified library members will appear here."
          />
        ) : null}
        {members.data && members.data.items.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {members.data.items.map((member) =>
              compact ? (
                <li key={member.id} className="admin-row">
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-medium">{member.fullName}</p>
                    <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                      {member.email}
                    </p>
                  </div>
                  <span
                    className={`admin-status-chip ${
                      member.status === 'suspended'
                        ? 'admin-status-suspended'
                        : 'admin-status-active'
                    }`}
                  >
                    {member.status === 'suspended' ? 'Suspended' : 'Active'}
                  </span>
                </li>
              ) : (
                <AdminMemberRow key={member.id} member={member} />
              ),
            )}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
