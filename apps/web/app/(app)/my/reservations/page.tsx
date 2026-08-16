'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  StatusMessage,
} from '@shared/ui/components';
import {
  MemberContent,
  MemberEmpty,
  MemberError,
  MemberLoadingList,
  MemberPageHeader,
  RequireMember,
  ReservationCard,
} from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useCancelReservation, useMyReservations } from '@/lib/bookly';

type CancelTarget = { id: string; bookId: string; title: string };

function MyReservationsContent() {
  const reservations = useMyReservations({ limit: 50, status: 'active' });
  const cancelReservation = useCancelReservation();
  const [pendingCancel, setPendingCancel] = useState<CancelTarget | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function confirmCancel() {
    if (!pendingCancel) return;
    const target = pendingCancel;
    setError(null);
    setSuccess(null);
    setCancellingId(target.id);
    try {
      await cancelReservation.mutateAsync({
        id: target.id,
        bookId: target.bookId,
      });
      setSuccess('Reservation cancelled.');
      setPendingCancel(null);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <MemberContent className="flex flex-col gap-6">
      <MemberPageHeader
        title="My Reservations"
        description="Watch your queue position and cancel holds you no longer need."
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

      {reservations.isPending ? (
        <div className="member-reservation-list">
          <MemberLoadingList count={3} />
        </div>
      ) : null}
      {reservations.isError ? (
        <MemberError title="Could not load reservations" error={reservations.error} />
      ) : null}

      {!reservations.isPending &&
      !reservations.isError &&
      (reservations.data?.items.length ?? 0) === 0 ? (
        <div className="member-reservation-list">
          <MemberEmpty
            title="No active reservations"
            description="You don't have any books in your reservation queue."
            href={ROUTES.books}
            actionLabel="Browse Books"
          />
        </div>
      ) : null}

      {reservations.data && reservations.data.items.length > 0 ? (
        <div className="member-reservation-list">
          {reservations.data.items.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              cancelPending={cancellingId === reservation.id}
              onCancel={(item) =>
                setPendingCancel({
                  id: item.id,
                  bookId: item.bookId,
                  title: item.book.title,
                })
              }
            />
          ))}
        </div>
      ) : null}

      <Dialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => {
          if (!open && !cancellingId) setPendingCancel(null);
        }}
        showClose={false}
      >
        <DialogHeader>
          <DialogTitle>Cancel this reservation?</DialogTitle>
          <DialogDescription>
            {pendingCancel
              ? `You will lose your place in the queue for ${pendingCancel.title}.`
              : 'You will lose your place in the queue.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setPendingCancel(null)}
            disabled={Boolean(cancellingId)}
          >
            Keep reservation
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={Boolean(cancellingId)}
            loadingText="Cancelling…"
            onClick={() => void confirmCancel()}
          >
            Cancel reservation
          </Button>
        </DialogFooter>
      </Dialog>
    </MemberContent>
  );
}

export default function MyReservationsPage() {
  return (
    <RequireMember>
      <MyReservationsContent />
    </RequireMember>
  );
}
