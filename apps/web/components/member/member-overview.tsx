'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { MEMBER_BORROW_LIMIT_MESSAGE } from '@shared/types';
import { useAuth } from '@/components/auth';
import { ROUTES } from '@/lib/auth/routes';
import { useMemberDashboard } from '@/lib/bookly';
import { countDueSoon, formatMoneyInr, memberGreeting } from '@/lib/member';
import { LoanCard } from './loan-card';
import { MemberMetricCard } from './metric-card';
import {
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  MemberSection,
} from './page-states';
import { MemberContent } from './page-header';

export function MemberOverview() {
  const { user } = useAuth();
  const memberDash = useMemberDashboard();
  const loading = memberDash.isPending;
  const data = memberDash.data;
  const activeLoans = useMemo(() => data?.activeLoans ?? [], [data?.activeLoans]);
  const reservations = data?.reservations ?? [];
  const outstandingCents = data?.outstandingFineTotalCents ?? 0;
  const maxActiveLoans = data?.maxActiveLoans;
  const dueSoonCount = countDueSoon(activeLoans);
  const previewLoans = useMemo(
    () =>
      [...activeLoans]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [activeLoans],
  );
  const topQueue = reservations.find((r) => r.queuePosition != null)?.queuePosition;

  let loansHint = 'All looking healthy';
  if (maxActiveLoans != null && activeLoans.length >= maxActiveLoans) {
    loansHint = MEMBER_BORROW_LIMIT_MESSAGE;
  } else if (dueSoonCount > 0) loansHint = `${dueSoonCount} due within 3 days`;
  else if (activeLoans.length === 0) loansHint = 'Nothing checked out';

  let reservationsHint = 'Waiting for a copy';
  if (topQueue != null) reservationsHint = `#${topQueue} in queue`;
  else if (reservations.length === 0) reservationsHint = 'No active holds';

  return (
    <MemberContent className="space-y-8">
      <header className="member-page-header member-enter">
        <div>
          <h1 className="member-page-title">{memberGreeting(user?.name)}</h1>
          <p className="member-page-desc">
            Here&apos;s what&apos;s happening with your library activity.
          </p>
        </div>
        <Link
          href={ROUTES.books}
          className="ui-button ui-button-md ui-button-primary no-underline"
        >
          Browse Books
        </Link>
      </header>

      {loading ? <MemberLoadingGrid /> : null}

      {memberDash.isError ? (
        <MemberError title="Could not load dashboard" error={memberDash.error} />
      ) : null}

      {!loading && data && maxActiveLoans != null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MemberMetricCard
            label="Active loans"
            value={`${activeLoans.length} / ${maxActiveLoans}`}
            hint={loansHint}
            href={ROUTES.myLoans}
            stagger={0}
          />
          <MemberMetricCard
            label="Due soon"
            value={String(dueSoonCount)}
            hint={dueSoonCount > 0 ? 'Return or renew at the desk' : 'No urgent returns'}
            href={`${ROUTES.myLoans}?dueSoon=1`}
            stagger={1}
          />
          <MemberMetricCard
            label="Reservations"
            value={String(reservations.length)}
            hint={reservationsHint}
            href={ROUTES.myReservations}
            stagger={2}
          />
          <MemberMetricCard
            label="Outstanding"
            value={formatMoneyInr(outstandingCents)}
            hint={
              outstandingCents === 0 ? "You're all clear" : 'Settle at the library desk'
            }
            href={ROUTES.myFines}
            stagger={3}
          />
        </div>
      ) : null}

      <MemberSection
        title="Currently borrowed"
        description="Titles checked out to you."
        stagger={1}
        action={
          <Link href={ROUTES.myLoans} className="member-inline-link">
            View all loans →
          </Link>
        }
      >
        {memberDash.isError ? (
          <MemberError title="Could not load loans" error={memberDash.error} />
        ) : null}
        {!loading && !memberDash.isError && activeLoans.length === 0 ? (
          <MemberEmpty
            title="No active loans"
            description="You don't currently have any books checked out."
            href={ROUTES.books}
            actionLabel="Browse Books"
          />
        ) : null}
        {previewLoans.length > 0 ? (
          <div className="member-list-stack">
            {previewLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : null}
      </MemberSection>
    </MemberContent>
  );
}
