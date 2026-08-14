'use client';

import { useState } from 'react';
import { StatusMessage } from '@shared/ui/components';
import {
  MemberEmpty,
  MemberError,
  MemberLoadingGrid,
  RequireMember,
  ReservationCard,
} from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useCancelReservation, useMyReservations } from '@/lib/bookly';

function MyReservationsContent() {
  const reservations = useMyReservations({ limit: 50, status: 'active' });
  const cancelReservation = useCancelReservation();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onCancel(reservation: { id: string; bookId: string }) {
    setError(null);
    setSuccess(null);
    setCancellingId(reservation.id);
    try {
      await cancelReservation.mutateAsync({
        id: reservation.id,
        bookId: reservation.bookId,
      });
      setSuccess('Reservation cancelled.');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="member-enter">
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
          My Reservations
        </h1>
        <p className="mt-2 mb-0 text-[color:var(--bookly-muted)]">
          Watch your queue position and cancel holds you no longer need.
        </p>
      </header>

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

      {reservations.isPending ? <MemberLoadingGrid count={3} /> : null}
      {reservations.isError ? (
        <MemberError title="Could not load reservations" error={reservations.error} />
      ) : null}

      {!reservations.isPending &&
      !reservations.isError &&
      (reservations.data?.items.length ?? 0) === 0 ? (
        <MemberEmpty
          title="No active reservations."
          description="Reserve a title when every copy is on loan."
          href={ROUTES.books}
          actionLabel="Find a Book"
        />
      ) : null}

      {reservations.data && reservations.data.items.length > 0 ? (
        <div className="grid gap-3">
          {reservations.data.items.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              cancelPending={cancellingId === reservation.id}
              onCancel={(item) => void onCancel(item)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MyReservationsPage() {
  return (
    <RequireMember>
      <MyReservationsContent />
    </RequireMember>
  );
}
