'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Skeleton, StatusMessage } from '@shared/ui/components';
import { BookCover, MemberError, RequireMember, StatusChip } from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import {
  useBook,
  useCancelReservation,
  useCreateReservation,
  useMyLoans,
  useMyReservations,
} from '@/lib/bookly';
import { formatDueDate, getLoanDueStatus } from '@/lib/member';

function BookDetailContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const bookQuery = useBook(bookId);
  const myLoans = useMyLoans({ status: 'active', limit: 100 });
  const myReservations = useMyReservations({ status: 'active', limit: 100 });
  const createReservation = useCreateReservation();
  const cancelReservation = useCancelReservation();
  const [message, setMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const book = bookQuery.data;
  const ownLoan = myLoans.data?.items.find((loan) => loan.bookId === bookId);
  const ownReservation = myReservations.data?.items.find(
    (item) => item.bookId === bookId,
  );
  const available = (book?.availableCopies ?? 0) > 0;
  const pending = createReservation.isPending || cancelReservation.isPending;

  async function onReserve() {
    if (!bookId) return;
    setMessage(null);
    try {
      await createReservation.mutateAsync({ bookId });
      setMessage({
        tone: 'success',
        text: 'Reservation placed. Track it under My Reservations.',
      });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  async function onCancel() {
    if (!ownReservation) return;
    setMessage(null);
    try {
      await cancelReservation.mutateAsync({
        id: ownReservation.id,
        bookId: ownReservation.bookId,
      });
      setMessage({ tone: 'success', text: 'Reservation cancelled.' });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  if (bookQuery.isPending) {
    return (
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[180px_1fr]">
        <Skeleton size="lg" />
        <div className="space-y-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </div>
    );
  }

  if (bookQuery.isError || !book) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <MemberError title="Could not load this book" error={bookQuery.error} />
        <Link href={ROUTES.books} className="text-sm font-medium">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  const loanStatus = ownLoan ? getLoanDueStatus(ownLoan.dueDate) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={ROUTES.books}
        className="inline-block text-sm font-medium text-[color:var(--bookly-navy)] no-underline hover:underline"
      >
        ← Back to catalog
      </Link>

      <div className="member-enter grid gap-8 md:grid-cols-[180px_1fr]">
        <BookCover title={book.title} size="lg" />

        <div className="space-y-4">
          <div>
            <h1 className="m-0 text-3xl font-semibold tracking-tight text-[color:var(--bookly-navy)]">
              {book.title}
            </h1>
            <p className="mt-2 mb-0 text-lg text-[color:var(--bookly-muted)]">
              {book.author}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {available ? (
              <StatusChip tone="available">Available</StatusChip>
            ) : (
              <StatusChip tone="neutral">Currently unavailable</StatusChip>
            )}
            {ownLoan ? (
              <StatusChip tone={loanStatus!.tone}>On loan to you</StatusChip>
            ) : null}
            {ownReservation ? <StatusChip tone="healthy">Reserved</StatusChip> : null}
          </div>

          <dl className="m-0 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[color:var(--bookly-muted)]">ISBN</dt>
              <dd className="m-0 font-mono">{book.isbn}</dd>
            </div>
            {book.publishedYear != null ? (
              <div>
                <dt className="text-[color:var(--bookly-muted)]">Published</dt>
                <dd className="m-0">{book.publishedYear}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[color:var(--bookly-muted)]">Available copies</dt>
              <dd className="m-0">
                {book.availableCopies} of {book.totalCopies}
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--bookly-muted)]">On loan</dt>
              <dd className="m-0">{book.onLoanCopies}</dd>
            </div>
          </dl>

          {book.description ? (
            <p className="m-0 leading-relaxed text-[color:var(--bookly-navy)]">
              {book.description}
            </p>
          ) : null}

          {message ? (
            <StatusMessage tone={message.tone}>{message.text}</StatusMessage>
          ) : null}

          <div className="member-card space-y-3 p-4">
            {ownLoan ? (
              <>
                <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
                  You have this on loan
                </p>
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                  Due {formatDueDate(ownLoan.dueDate)} · {loanStatus?.label}
                </p>
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                  Returns are handled at the library desk.
                </p>
              </>
            ) : null}

            {!ownLoan && ownReservation ? (
              <>
                <p className="member-queue m-0 text-xl">
                  #{ownReservation.queuePosition ?? '—'} in queue
                </p>
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                  We&apos;ll hold your place until a copy is returned.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  loading={cancelReservation.isPending}
                  disabled={pending}
                  onClick={() => void onCancel()}
                >
                  Cancel reservation
                </Button>
              </>
            ) : null}

            {!ownLoan && !ownReservation && available ? (
              <>
                <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
                  Available now
                </p>
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                  Visit the library desk to check out a copy. Online checkout is not
                  available for members.
                </p>
              </>
            ) : null}

            {!ownLoan && !ownReservation && !available ? (
              <>
                <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
                  All copies are on loan
                </p>
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                  Reserve this title to join the queue.
                </p>
                <Button
                  type="button"
                  loading={createReservation.isPending}
                  disabled={pending}
                  onClick={() => void onReserve()}
                >
                  Reserve this book
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDetailPage() {
  return (
    <RequireMember>
      <BookDetailContent />
    </RequireMember>
  );
}
