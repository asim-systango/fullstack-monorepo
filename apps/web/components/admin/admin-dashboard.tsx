'use client';

import Link from 'next/link';
import { Alert, Skeleton } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import {
  useAdminDashboard,
  useLoans,
  useMembers,
  useOverdueLoans,
  useSettings,
} from '@/lib/bookly';
import { memberGreeting } from '@/lib/member/greeting';
import { formatMoneyInr } from '@/lib/member/format';
import { AdminEmptyState } from './admin-empty-state';
import { AdminMetricCard } from './admin-metric-card';
import { AdminPageHeader } from './admin-page-header';
import { AdminQuickActions } from './admin-quick-actions';
import { isMoneyCentsSetting, settingLabel } from './setting-labels';

export function AdminDashboard() {
  const { user } = useAuth();
  const adminDash = useAdminDashboard();
  const members = useMembers({ limit: 6 });
  const settings = useSettings();
  const activeLoans = useLoans({ limit: 6, status: 'active' });
  const overdue = useOverdueLoans({ limit: 6 });

  const overdueCount = adminDash.data?.overdueLoans ?? 0;

  return (
    <div className="admin-content">
      <AdminPageHeader
        title={memberGreeting(user?.name)}
        description="Platform health, member activity, and library policy at a glance."
      />

      {adminDash.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {adminDash.data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            label="Members"
            value={adminDash.data.memberCount}
            hint="Registered members"
            href={`${ROUTES.admin}#members`}
          />
          <AdminMetricCard
            label="Active loans"
            value={adminDash.data.activeLoans}
            hint="Books currently checked out"
            href={`${ROUTES.admin}#loans`}
          />
          <AdminMetricCard
            label="Overdue"
            value={adminDash.data.overdueLoans}
            hint={overdueCount > 0 ? 'Loans past due date' : 'Everything is on schedule'}
            tone={overdueCount > 0 ? 'warn' : 'ok'}
            href={`${ROUTES.admin}#overdue`}
          />
          <AdminMetricCard
            label="Max loans / member"
            value={adminDash.data.maxActiveLoans}
            hint="Current borrowing limit"
            tone="policy"
            href={`${ROUTES.admin}#settings`}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <AdminQuickActions
          actions={[
            { href: `${ROUTES.admin}#members`, label: 'Manage Members', primary: true },
            { href: `${ROUTES.admin}#settings`, label: 'Library Policies' },
            { href: `${ROUTES.admin}#fines`, label: 'Review Fines' },
            { href: `${ROUTES.librarian}?panel=catalog`, label: 'Manage Catalog' },
          ]}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="admin-card">
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <h2 className="admin-section-title">Members</h2>
            <p className="admin-section-desc">
              Recent profiles.{' '}
              <Link href={`${ROUTES.admin}#members`} className="font-medium">
                Manage
              </Link>
            </p>
          </div>
          <div className="admin-panel-body">
            {members.isPending ? <Skeleton size="md" /> : null}
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
                {members.data.items.map((member) => (
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

        <section className="admin-card">
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <h2 className="admin-section-title">Library policies</h2>
            <p className="admin-section-desc">
              Current configuration.{' '}
              <Link href={`${ROUTES.admin}#settings`} className="font-medium">
                Edit
              </Link>
            </p>
          </div>
          <div className="admin-panel-body">
            {settings.isPending ? <Skeleton size="md" /> : null}
            {settings.isError ? (
              <Alert tone="danger" title="Could not load settings">
                {toUserMessage(settings.error)}
              </Alert>
            ) : null}
            {settings.data && settings.data.length === 0 ? (
              <AdminEmptyState
                title="No library policies configured"
                description="Configured policies will appear here."
              />
            ) : null}
            {settings.data && settings.data.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {settings.data.map((setting) => (
                  <li key={setting.id} className="admin-row">
                    <p className="m-0 font-medium">{settingLabel(setting.key)}</p>
                    <p className="m-0 font-semibold tabular-nums">
                      {isMoneyCentsSetting(setting.key)
                        ? formatMoneyInr(Number.parseInt(setting.value, 10) || 0)
                        : setting.value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="admin-card">
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <h2 className="admin-section-title">Active loans</h2>
            <p className="admin-section-desc">
              Live checkouts.{' '}
              <Link href={`${ROUTES.admin}#loans`} className="font-medium">
                View all
              </Link>
            </p>
          </div>
          <div className="admin-panel-body">
            {activeLoans.isPending ? <Skeleton size="md" /> : null}
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
                  <li key={loan.id} className="admin-row">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate font-medium">{loan.book.title}</p>
                      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                        Due {loan.dueDate}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

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
            {overdue.isPending ? <Skeleton size="md" /> : null}
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
                  <li key={loan.id} className="admin-row">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate font-medium">{loan.book.title}</p>
                      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                        {loan.daysLate} day{loan.daysLate === 1 ? '' : 's'} late
                      </p>
                    </div>
                    <span className="admin-status-chip admin-status-overdue">
                      Overdue
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
