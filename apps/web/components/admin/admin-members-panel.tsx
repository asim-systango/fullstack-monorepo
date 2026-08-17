'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { MemberStatus } from '@shared/types';
import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useMembers } from '@/lib/bookly';
import { AdminEmptyState } from './admin-empty-state';
import { AdminMemberRow } from './admin-member-row';

export function AdminMembersPanel({
  limit = 50,
  compact = false,
  role,
  status,
  title = 'Members',
  description,
}: Readonly<{
  limit?: number;
  compact?: boolean;
  role?: 'admin' | 'user' | 'staff';
  status?: MemberStatus;
  title?: string;
  description?: ReactNode;
}>) {
  const members = useMembers({ limit, role, status });

  let emptyTitle = 'No members yet';
  let emptyDescription = 'Verified library members will appear here.';
  if (role === 'staff') {
    emptyTitle = 'No librarians yet';
    emptyDescription = 'Promote a member to staff to see them here.';
  } else if (status === 'suspended') {
    emptyTitle = 'No suspended members';
    emptyDescription = 'Suspended accounts will appear here for restore.';
  }

  const defaultDescription = compact ? (
    <>
      Recent member profiles.{' '}
      <Link href={ROUTES.adminMembers} className="font-medium">
        Manage
      </Link>
    </>
  ) : (
    'Create members, promote staff, or suspend library access.'
  );

  return (
    <section id="members" className="admin-panel admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">{title}</h2>
        <p className="admin-section-desc">{description ?? defaultDescription}</p>
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
          <AdminEmptyState title={emptyTitle} description={emptyDescription} />
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
