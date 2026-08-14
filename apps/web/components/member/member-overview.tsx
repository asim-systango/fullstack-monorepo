'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StatusMessage } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import {
  useCancelReservation,
  useMemberDashboard,
  useMyFines,
  useMyLoans,
  useMyReservations,
} from '@/lib/bookly';
import { countDueSoon, formatMoneyInr, memberGreeting } from '@/lib/member';
import { FineRow } from './fine-row';
import { LoanCard } from './loan-card';
import { MemberMetricCard } from './metric-card';
import {
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  MemberSection,
} from './page-states';
import { QuickActions } from './quick-actions';
import { ReservationCard } from './reservation-card';

export function MemberOverview() {
  const { user } = useAuth();
  const memberDash = useMemberDashboard();
  const myLoans = useMyLoans({ limit: 5, status: 'active' });
  const myReservations = useMyReservations({ limit: 5, status: 'active' });
  const myFines = useMyFines({ limit: 5, status: 'unpaid' });
  const cancelReservation = useCancelReservation();
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loading =
    memberDash.isPending ||
    myLoans.isPending ||
    myReservations.isPending ||
    myFines.isPending;

  const activeLoans = myLoans.data?.items ?? memberDash.data?.activeLoans ?? [];
  const reservations = myReservations.data?.items ?? memberDash.data?.reservations ?? [];
  const unpaidFines = myFines.data?.items ?? [];
  const outstandingCents =
    memberDash.data?.outstandingFineTotalCents ??
    unpaidFines.reduce((sum, fine) => sum + fine.amountCents, 0);
  const dueSoonCount = countDueSoon(activeLoans);
  const topQueue = reservations.find((r) => r.queuePosition != null)?.queuePosition;

  let loansHint = 'All looking healthy';
  if (dueSoonCount > 0) loansHint = `${dueSoonCount} due within 3 days`;
  else if (activeLoans.length === 0) loansHint = 'Nothing checked out';

  let reservationsHint = 'Waiting for a copy';
  if (topQueue != null) reservationsHint = `#${topQueue} in queue`;
  else if (reservations.length === 0) reservationsHint = 'No active holds';

  async function onCancel(reservation: { id: string; bookId: string }) {
    setCancelError(null);
    setCancelSuccess(null);
    setCancellingId(reservation.id);
    try {
      await cancelReservation.mutateAsync({
        id: reservation.id,
        bookId: reservation.bookId,
      });
      setCancelSuccess('Reservation cancelled.');
    } catch (err) {
      setCancelError(toUserMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="member-enter flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)] md:text-3xl">
            {memberGreeting(user?.name)}
          </h1>
          <p className="mt-2 mb-0 max-w-xl text-[color:var(--bookly-muted)]">
            Here&apos;s what&apos;s happening with your library activity.
          </p>
        </div>
        <Link
          href={ROUTES.books}
          className="inline-flex rounded-md bg-[color:var(--bookly-teal)] px-4 py-2.5 text-sm font-semibold text-[color:var(--bookly-navy-deep)] no-underline hover:no-underline"
        >
          Browse Books
        </Link>
      </header>

      {loading ? <MemberLoadingGrid /> : null}

      {!loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MemberMetricCard
            label="Active loans"
            value={String(activeLoans.length)}
            hint={loansHint}
            stagger={0}
          />
          <MemberMetricCard
            label="Due soon"
            value={String(dueSoonCount)}
            hint={dueSoonCount > 0 ? 'Return or renew at the desk' : 'No urgent returns'}
            stagger={1}
          />
          <MemberMetricCard
            label="Reservations"
            value={String(reservations.length)}
            hint={reservationsHint}
            stagger={2}
          />
          <MemberMetricCard
            label="Outstanding"
            value={formatMoneyInr(outstandingCents)}
            hint={
              outstandingCents === 0 ? "You're all clear" : 'Settle at the library desk'
            }
            stagger={3}
          />
        </div>
      ) : null}

      <MemberSection
        title="Currently borrowed"
        description="Titles checked out to you."
        stagger={1}
        action={
          <Link
            href={ROUTES.myLoans}
            className="text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
          >
            View all loans →
          </Link>
        }
      >
        {myLoans.isError ? (
          <MemberError title="Could not load loans" error={myLoans.error} />
        ) : null}
        {!myLoans.isError && activeLoans.length === 0 ? (
          <MemberEmpty
            title="You're not borrowing anything right now."
            description="Browse the catalog and visit the desk to check out a title."
            href={ROUTES.books}
            actionLabel="Browse Books"
          />
        ) : null}
        {activeLoans.length > 0 ? (
          <div className="grid gap-3">
            {activeLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        ) : null}
      </MemberSection>

      <MemberSection
        title="Reservations"
        description="Your place in line for unavailable titles."
        stagger={2}
        action={
          <Link
            href={ROUTES.myReservations}
            className="text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
          >
            View all →
          </Link>
        }
      >
        {cancelError ? <StatusMessage tone="error">{cancelError}</StatusMessage> : null}
        {cancelSuccess ? (
          <StatusMessage tone="success">{cancelSuccess}</StatusMessage>
        ) : null}
        {myReservations.isError ? (
          <MemberError title="Could not load reservations" error={myReservations.error} />
        ) : null}
        {!myReservations.isError && reservations.length === 0 ? (
          <MemberEmpty
            title="No active reservations."
            description="Reserve a title when every copy is on loan."
            href={ROUTES.books}
            actionLabel="Find a Book"
          />
        ) : null}
        {reservations.length > 0 ? (
          <div className="grid gap-3">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                cancelPending={cancellingId === reservation.id}
                onCancel={(item) => void onCancel(item)}
              />
            ))}
          </div>
        ) : null}
      </MemberSection>

      <MemberSection
        title="Fines"
        description="Balances settled at the library desk."
        stagger={3}
        action={
          <Link
            href={ROUTES.myFines}
            className="text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
          >
            View fine history →
          </Link>
        }
      >
        {myFines.isError ? (
          <MemberError title="Could not load fines" error={myFines.error} />
        ) : null}
        {!myFines.isError && unpaidFines.length === 0 && outstandingCents === 0 ? (
          <MemberEmpty
            title="You're all clear."
            description="No unpaid fines on your account."
          />
        ) : null}
        {unpaidFines.length > 0 ? (
          <div className="space-y-3">
            <div className="member-card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
                  Outstanding total
                </p>
                <p className="mt-1 mb-0 text-xl font-semibold text-[color:var(--bookly-navy)]">
                  {formatMoneyInr(outstandingCents)}
                </p>
              </div>
              <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                {unpaidFines.length} unpaid fine{unpaidFines.length === 1 ? '' : 's'}
              </p>
            </div>
            {unpaidFines.map((fine) => (
              <FineRow key={fine.id} fine={fine} />
            ))}
          </div>
        ) : null}
      </MemberSection>

      <MemberSection
        title="Quick actions"
        description="Shortcuts for common tasks."
        stagger={4}
      >
        <QuickActions />
      </MemberSection>
    </div>
  );
}
