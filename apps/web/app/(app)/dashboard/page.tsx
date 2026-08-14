'use client';

import Link from 'next/link';
import { Alert, Skeleton } from '@shared/ui/components';
import { AdminDashboard } from '@/components/admin';
import { MemberOverview } from '@/components/member';
import {
  StaffBookCard,
  StaffEmptyState,
  StaffLoanRow,
  StaffMetricCard,
  StaffPageHeader,
  StaffQuickActions,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, ROLES } from '@/lib/auth/roles';
import { ROUTES } from '@/lib/auth/routes';
import { useBooks, useLibrarianDashboard, useLoans } from '@/lib/bookly';
import { memberGreeting } from '@/lib/member/greeting';

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
  const deskLoans = useLoans({ limit: 6, status: 'active' });
  const books = useBooks({ limit: 6, sort: 'title' });

  const loading = librarianDash.isPending;

  return (
    <div className="staff-content">
      <StaffPageHeader
        title={memberGreeting(user?.name)}
        description="Here's today's library operations at a glance."
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
            label="Books"
            value={librarianDash.data.totalBooks}
            hint="Titles in catalog"
          />
          <StaffMetricCard
            label="Copies"
            value={librarianDash.data.totalCopies}
            hint="Physical copies"
          />
          <StaffMetricCard
            label="Active loans"
            value={librarianDash.data.activeLoans}
            hint="Currently checked out"
          />
          <StaffMetricCard
            label="Overdue"
            value={librarianDash.data.overdueLoans}
            hint={
              librarianDash.data.overdueLoans > 0
                ? 'Needs attention'
                : 'Everything is on schedule'
            }
            tone={librarianDash.data.overdueLoans > 0 ? 'warn' : 'ok'}
            href={
              librarianDash.data.overdueLoans > 0
                ? `${ROUTES.librarian}#overdue`
                : undefined
            }
          />
        </div>
      ) : null}

      <div className="mt-6">
        <StaffQuickActions
          actions={[
            { href: ROUTES.librarian, label: 'Open Librarian Desk', primary: true },
            { href: `${ROUTES.librarian}#member-lookup`, label: 'Find Member' },
            { href: `${ROUTES.librarian}#overdue`, label: 'View Overdue' },
            { href: ROUTES.books, label: 'Browse Catalog' },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="staff-card staff-card-primary">
          <div className="p-4 pb-2">
            <h2 className="staff-section-title">Active loans</h2>
            <p className="staff-section-desc">Books currently checked out to members.</p>
          </div>
          <div className="px-4 pb-4">
            {deskLoans.isError ? (
              <Alert tone="danger" title="Could not load loans">
                {toUserMessage(deskLoans.error)}
              </Alert>
            ) : null}
            {deskLoans.isPending ? <Skeleton size="lg" /> : null}
            {deskLoans.data && deskLoans.data.items.length === 0 ? (
              <StaffEmptyState
                title="No active loans"
                description="All physical copies are currently back on the shelf."
              />
            ) : null}
            {deskLoans.data && deskLoans.data.items.length > 0 ? (
              <ul className="m-0 list-none p-0">
                {deskLoans.data.items.map((loan) => (
                  <StaffLoanRow key={loan.id} loan={loan} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="staff-card">
          <div className="p-4 pb-2">
            <h2 className="staff-section-title">Catalog snapshot</h2>
            <p className="staff-section-desc">Recent titles in the collection.</p>
          </div>
          <div className="px-4 pb-4">
            {books.isError ? (
              <Alert tone="danger" title="Could not load books">
                {toUserMessage(books.error)}
              </Alert>
            ) : null}
            {books.isPending ? <Skeleton size="lg" /> : null}
            {books.data && books.data.items.length === 0 ? (
              <StaffEmptyState
                title="No catalog items"
                description="Add your first book from the Librarian Desk."
                action={
                  <Link
                    href={`${ROUTES.librarian}#catalog`}
                    className="ui-button ui-button-sm ui-button-secondary no-underline"
                  >
                    Manage catalog
                  </Link>
                }
              />
            ) : null}
            {books.data && books.data.items.length > 0 ? (
              <ul className="m-0 grid list-none gap-2 p-0">
                {books.data.items.map((book) => (
                  <StaffBookCard key={book.id} book={book} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
