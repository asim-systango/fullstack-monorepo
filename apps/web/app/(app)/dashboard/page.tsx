'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Skeleton, TextInput } from '@shared/ui/components';
import { AdminDashboard } from '@/components/admin';
import { MemberOverview } from '@/components/member';
import {
  StaffEmptyState,
  StaffMetricCard,
  StaffPageHeader,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { ROUTES, librarianMemberPath } from '@/lib/auth/routes';
import { useLibrarianDashboard, useMemberSearch, useMembers } from '@/lib/bookly';
import { memberGreeting } from '@/lib/member/greeting';
import { useDebouncedValue } from '@/lib/staff';

const RECENT_MEMBER_LIMIT = 3;

export default function DashboardPage() {
  const { user } = useAuth();
  const isMember = hasRole(user, [ROLES.user]);
  const isStaff = hasRole(user, [ROLES.staff]);
  const isAdmin = hasRole(user, [ROLES.admin]);

  if (isMember) {
    return <MemberOverview />;
  }

  if (isStaff) {
    return <StaffDashboard />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return null;
}

function StaffDashboard() {
  const { user } = useAuth();
  const librarianDash = useLibrarianDashboard();
  const [memberQuery, setMemberQuery] = useState('');
  const debouncedMemberQ = useDebouncedValue(memberQuery.trim(), 250);
  const searching = debouncedMemberQ.length > 0;

  const recentMembers = useMembers(
    { limit: RECENT_MEMBER_LIMIT, sort: '-createdAt' },
    { enabled: !searching },
  );
  const memberHits = useMemberSearch(debouncedMemberQ);

  const loading = librarianDash.isPending;

  return (
    <div className="staff-content">
      <StaffPageHeader
        title={memberGreeting(user?.name)}
        description="Today's library operations at a glance."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton size="lg" />
          <Skeleton size="lg" />
          <Skeleton size="lg" />
          <Skeleton size="lg" />
        </div>
      ) : null}

      {librarianDash.isError ? (
        <Alert tone="danger" title="Could not load desk metrics">
          {toUserMessage(librarianDash.error)}
        </Alert>
      ) : null}

      {!loading && librarianDash.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StaffMetricCard
            label="Books / copies"
            value={`${librarianDash.data.totalBooks} / ${librarianDash.data.totalCopies}`}
            hint={`${librarianDash.data.availableCopies} available to issue`}
            href={ROUTES.librarianBooks}
          />
          <StaffMetricCard
            label="Active Loans"
            value={librarianDash.data.activeLoans}
            hint="Currently issued books"
          />
          <StaffMetricCard
            label="Overdues"
            value={librarianDash.data.overdueLoans}
            hint={
              librarianDash.data.overdueLoans > 0
                ? 'Needs follow-up'
                : 'Everything is on schedule'
            }
            tone={librarianDash.data.overdueLoans > 0 ? 'warn' : 'ok'}
            href={ROUTES.librarianOverdue}
          />
          <StaffMetricCard
            label="Total Members"
            value={librarianDash.data.memberCount}
            hint="Registered members"
            href={ROUTES.librarianMembers}
          />
        </div>
      ) : null}

      <section className="staff-card mt-6">
        <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-2">
          <div>
            <h2 className="staff-section-title">Find Members</h2>
            <p className="staff-section-desc">
              Search by name, email, or member ID. Recently registered members appear
              when the search is empty.
            </p>
          </div>
          <Link
            href={ROUTES.librarianMembers}
            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
          >
            View all members
          </Link>
        </div>
        <div className="staff-panel-body staff-form-stack">
          <TextInput
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Search name, email, or member ID…"
            autoComplete="off"
            aria-label="Search members"
          />

          {searching ? (
            <DashboardMemberResults
              isPending={memberHits.isPending}
              isError={memberHits.isError}
              error={memberHits.error}
              items={
                memberHits.data?.map((hit) => ({
                  userId: hit.userId,
                  fullName: hit.fullName,
                  email: hit.email,
                  activeLoanCount: hit.activeLoanCount,
                })) ?? []
              }
              emptyTitle="No members match that search."
              emptyDescription="Try a different name, email, or member ID."
            />
          ) : (
            <DashboardMemberResults
              isPending={recentMembers.isPending}
              isError={recentMembers.isError}
              error={recentMembers.error}
              items={
                recentMembers.data?.items.map((row) => ({
                  userId: row.userId,
                  fullName: row.fullName,
                  email: row.email,
                  activeLoanCount: row.activeLoanCount,
                })) ?? []
              }
              emptyTitle="No members registered yet."
              emptyDescription="New members will appear here after they join."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardMemberResults({
  isPending,
  isError,
  error,
  items,
  emptyTitle,
  emptyDescription,
}: Readonly<{
  isPending: boolean;
  isError: boolean;
  error: unknown;
  items: Array<{
    userId: string;
    fullName: string;
    email: string;
    activeLoanCount: number;
  }>;
  emptyTitle: string;
  emptyDescription: string;
}>) {
  if (isPending) return <Skeleton size="lg" />;
  if (isError) {
    return (
      <Alert tone="danger" title="Could not load members">
        {toUserMessage(error)}
      </Alert>
    );
  }
  if (items.length === 0) {
    return <StaffEmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <ul className="staff-result-list">
      {items.map((row) => (
        <li key={row.userId}>
          <Link
            href={librarianMemberPath(row.userId)}
            className="staff-pick-row"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 font-medium text-[color:var(--bookly-navy)]">{row.fullName}</p>
              <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                {row.email} · {row.activeLoanCount} active loan(s)
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
