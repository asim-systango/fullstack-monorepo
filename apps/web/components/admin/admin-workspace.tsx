'use client';

import Link from 'next/link';
import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useAdminDashboard } from '@/lib/bookly';
import { AdminFinesPanel } from './admin-fines-panel';
import { AdminLoansPanel } from './admin-loans-panel';
import { AdminMembersPanel } from './admin-members-panel';
import { AdminMetricCard } from './admin-metric-card';
import { AdminPageHeader } from './admin-page-header';
import { AdminSettingsPanel } from './admin-settings-panel';

const SECTION_LINKS = [
  { href: '#members', label: 'Members' },
  { href: '#settings', label: 'Policies' },
  { href: '#fines', label: 'Fines' },
  { href: '#loans', label: 'Loans' },
] as const;

export function AdminWorkspace() {
  const adminDash = useAdminDashboard();
  const overdueCount = adminDash.data?.overdueLoans ?? 0;

  return (
    <div className="admin-content">
      <AdminPageHeader
        title="Administration"
        description="Manage members, borrowing policies, fines, and library configuration."
        actions={
          <Link
            href={`${ROUTES.librarian}?panel=catalog`}
            className="ui-button ui-button-sm ui-button-secondary no-underline hover:no-underline"
          >
            Catalog management
          </Link>
        }
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
        <Alert tone="danger" title="Could not load admin metrics">
          {toUserMessage(adminDash.error)}
        </Alert>
      ) : null}

      {adminDash.data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            label="Members"
            value={adminDash.data.memberCount}
            hint="Registered members"
          />
          <AdminMetricCard
            label="Active loans"
            value={adminDash.data.activeLoans}
            hint="Books currently checked out"
          />
          <AdminMetricCard
            label="Overdue"
            value={adminDash.data.overdueLoans}
            hint={overdueCount > 0 ? 'Loans past due date' : 'Everything is on schedule'}
            tone={overdueCount > 0 ? 'warn' : 'ok'}
          />
          <AdminMetricCard
            label="Max loans / member"
            value={adminDash.data.maxActiveLoans}
            hint="Current borrowing limit"
            tone="policy"
          />
        </div>
      ) : null}

      <nav className="admin-section-nav" aria-label="Administration sections">
        {SECTION_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminMembersPanel />
        <AdminSettingsPanel />
      </div>

      <div className="mt-4">
        <AdminFinesPanel />
      </div>

      <div className="mt-4">
        <AdminLoansPanel />
      </div>
    </div>
  );
}
