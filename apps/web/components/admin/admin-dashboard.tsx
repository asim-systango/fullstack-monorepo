'use client';

import Link from 'next/link';
import type { AdminDashboard as AdminDashboardData, MemberListItem, OverdueLoan } from '@shared/types';
import { Alert, Skeleton } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useAdminDashboard, useMembers, useOverdueLoans } from '@/lib/bookly';
import { memberGreeting } from '@/lib/member/greeting';
import { AdminEmptyState } from './admin-empty-state';
import { AdminMetricCard } from './admin-metric-card';
import { AdminPageHeader } from './admin-page-header';

function AdminOverviewMetrics({ data }: Readonly<{ data: AdminDashboardData }>) {
  const overdueCount = data.overdueLoans;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AdminMetricCard
        label="Total members"
        value={data.memberCount}
        hint="Registered library members"
        href={ROUTES.adminMembers}
      />
      <AdminMetricCard
        label="Total librarians"
        value={data.librarianCount}
        hint="Staff desk accounts"
        href={ROUTES.adminLibrarians}
      />
      <AdminMetricCard
        label="Active loans"
        value={data.activeLoans}
        hint="Books currently checked out"
        href={`${ROUTES.admin}#loans`}
      />
      <AdminMetricCard
        label="Overdues"
        value={data.overdueLoans}
        hint={overdueCount > 0 ? 'Loans past due date' : 'Everything is on schedule'}
        tone={overdueCount > 0 ? 'warn' : 'ok'}
        href={`${ROUTES.admin}#overdue`}
      />
      <AdminMetricCard
        label="Books / copies"
        value={`${data.totalBooks} / ${data.totalCopies}`}
        hint={`${data.availableCopies} available to issue`}
        href={ROUTES.librarianBooks}
      />
    </div>
  );
}

function RecentMembersCard({
  items,
  isPending,
  isError,
  error,
}: Readonly<{
  items: MemberListItem[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
}>) {
  return (
    <section className="admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Members</h2>
        <p className="admin-section-desc">
          Recent profiles.{' '}
          <Link href={ROUTES.adminMembers} className="font-medium">
            Manage
          </Link>
        </p>
      </div>
      <div className="admin-panel-body">
        {isPending ? <Skeleton size="md" /> : null}
        {isError ? (
          <Alert tone="danger" title="Could not load members">
            {toUserMessage(error)}
          </Alert>
        ) : null}
        {items && items.length === 0 ? (
          <AdminEmptyState
            title="No members yet"
            description="Verified library members will appear here."
          />
        ) : null}
        {items && items.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {items.map((member) => (
              <li key={member.id} className="admin-row">
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-medium">{member.fullName}</p>
                  <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
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
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function OverdueSnapshotCard({
  overdueCount,
  items,
  isPending,
  isError,
  error,
}: Readonly<{
  overdueCount: number;
  items: OverdueLoan[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
}>) {
  return (
    <section className="admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Overdue loans</h2>
        <p className="admin-section-desc">
          {overdueCount > 0
            ? `${overdueCount} require attention.`
            : 'Everything is on schedule.'}{' '}
          <Link href={`${ROUTES.admin}#overdue`} className="font-medium">
            Review
          </Link>
        </p>
      </div>
      <div className="admin-panel-body">
        {isPending ? <Skeleton size="md" /> : null}
        {isError ? (
          <Alert tone="danger" title="Could not load overdue loans">
            {toUserMessage(error)}
          </Alert>
        ) : null}
        {items && items.length === 0 ? (
          <AdminEmptyState
            title="No overdue loans"
            description="There are currently no overdue loans."
          />
        ) : null}
        {items && items.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {items.map((loan) => (
              <li key={loan.id} className="admin-row">
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate font-medium">{loan.book.title}</p>
                  <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                    {loan.daysLate} day{loan.daysLate === 1 ? '' : 's'} late
                  </p>
                </div>
                <span className="admin-status-chip admin-status-overdue">Overdue</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const adminDash = useAdminDashboard();
  const members = useMembers({ limit: 6 });
  const overdue = useOverdueLoans({ limit: 6 });
  const overdueCount = adminDash.data?.overdueLoans ?? 0;

  return (
    <div className="admin-content">
      <AdminPageHeader
        title={memberGreeting(user?.name)}
        description="Library health at a glance. Use the sidebar for catalog, members, policies, and fines."
      />

      {adminDash.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton size="lg" />
          <Skeleton size="lg" />
          <Skeleton size="lg" />
          <Skeleton size="lg" />
          <Skeleton size="lg" />
        </div>
      ) : null}

      {adminDash.isError ? (
        <Alert tone="danger" title="Could not load admin dashboard">
          {toUserMessage(adminDash.error)}
        </Alert>
      ) : null}

      {adminDash.data ? <AdminOverviewMetrics data={adminDash.data} /> : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <RecentMembersCard
          items={members.data?.items}
          isPending={members.isPending}
          isError={members.isError}
          error={members.error}
        />
        <OverdueSnapshotCard
          overdueCount={overdueCount}
          items={overdue.data?.items}
          isPending={overdue.isPending}
          isError={overdue.isError}
          error={overdue.error}
        />
      </div>
    </div>
  );
}
