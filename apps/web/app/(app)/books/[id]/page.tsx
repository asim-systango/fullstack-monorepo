'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
  StatusMessage,
} from '@shared/ui/components';
import { BookCover, MemberContent, MemberError, RequireMember, StatusChip } from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { MEMBER_BORROW_LIMIT_MESSAGE } from '@shared/types';
import {
  useBook,
  useCancelReservation,
  useCreateCheckoutRequest,
  useCreateReservation,
  useMemberDashboard,
  useMyCheckoutRequests,
  useMyLoans,
  useMyReservations,
} from '@/lib/bookly';
import { formatDueDate, getLoanDueStatus } from '@/lib/member';

function BookDetailContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const bookQuery = useBook(bookId);
  const myLoans = useMyLoans({ status: 'active', limit: 100 });
  const memberDash = useMemberDashboard();
  const myReservations = useMyReservations({ status: 'active', limit: 100 });
  const myCheckoutRequests = useMyCheckoutRequests({ status: 'pending', limit: 100 });
  const createReservation = useCreateReservation();
  const cancelReservation = useCancelReservation();
  const createCheckoutRequest = useCreateCheckoutRequest();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState<{
    tone: 'success' | 'error';
    text: string;
  } | null>(null);

  const book = bookQuery.data;
  const ownLoan = myLoans.data?.items.find((loan) => loan.bookId === bookId);
  const ownReservation = myReservations.data?.items.find(
    (item) => item.bookId === bookId,
  );
  const pendingRequest = myCheckoutRequests.data?.items.find(
    (item) => item.bookId === bookId && item.status === 'pending',
  );
  const available = (book?.availableCopies ?? 0) > 0;
  const maxActiveLoans = memberDash.data?.maxActiveLoans ?? 2;
  const activeLoanCount = myLoans.data?.items.length ?? 0;
  const atBorrowLimit = myLoans.data != null && activeLoanCount >= maxActiveLoans;
  const pending =
    createReservation.isPending ||
    cancelReservation.isPending ||
    createCheckoutRequest.isPending;

  async function onRequestCheckout() {
    if (!bookId) return;
    if (atBorrowLimit) {
      setMessage({ tone: 'error', text: MEMBER_BORROW_LIMIT_MESSAGE });
      return;
    }
    setMessage(null);
    try {
      await createCheckoutRequest.mutateAsync({ bookId });
      setMessage({
        tone: 'success',
        text: 'Checkout request sent successfully.\n\nA librarian will prepare your copy.\nPlease collect the book from the library once it is issued.',
      });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

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
      setConfirmCancel(false);
      setMessage({ tone: 'success', text: 'Reservation cancelled.' });
    } catch (err) {
      setMessage({ tone: 'error', text: toUserMessage(err) });
    }
  }

  if (bookQuery.isPending) {
    return (
      <MemberContent>
        <div className="grid gap-4 md:grid-cols-[3.5rem_1fr]">
          <Skeleton size="lg" />
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </MemberContent>
    );
  }

  if (bookQuery.isError || !book) {
    return (
      <MemberContent className="space-y-4">
        <MemberError title="Could not load this book" error={bookQuery.error} />
        <Link href={ROUTES.books} className="member-back-link">
          ← Back to Browse Books
        </Link>
      </MemberContent>
    );
  }

  const loanStatus = ownLoan ? getLoanDueStatus(ownLoan.dueDate) : null;

  return (
    <MemberContent className="member-book-detail">
      <Link href={ROUTES.books} className="member-back-link">
        ← Back to Browse Books
      </Link>

      <div className="member-enter member-book-hero">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="member-book-identity">
            <div className="member-book-identity-heading">
              <BookCover title={book.title} size="lg" />
              <div className="min-w-0">
                <h1 className="member-page-title">{book.title}</h1>
                <p className="member-page-desc mt-2 mb-0 text-lg">{book.author}</p>
              </div>
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
              {pendingRequest ? <StatusChip tone="available">Request pending</StatusChip> : null}
            </div>
          </div>

          <section className="member-book-section">
            <h2 className="member-book-section-title">Book Information</h2>
            <div className="member-info-grid">
              <div className="member-info-cell">
                <p className="member-info-label">ISBN</p>
                <p className="member-info-value member-info-value-mono">{book.isbn}</p>
              </div>
              <div className="member-info-cell">
                <p className="member-info-label">Published</p>
                <p className="member-info-value">{book.publishedYear ?? '—'}</p>
              </div>
              <div className="member-info-cell">
                <p className="member-info-label">Available</p>
                <p className="member-info-value">
                  {book.availableCopies} of {book.totalCopies}
                </p>
              </div>
              <div className="member-info-cell">
                <p className="member-info-label">On loan</p>
                <p className="member-info-value">{book.onLoanCopies}</p>
              </div>
            </div>
          </section>

          {book.description ? (
            <section className="member-book-section">
              <h2 className="member-book-section-title">Description</h2>
              <p className="m-0 leading-relaxed text-[color:var(--bookly-navy)]">
                {book.description}
              </p>
            </section>
          ) : null}

          {message ? (
            <StatusMessage tone={message.tone}>
              <span className="whitespace-pre-line">{message.text}</span>
            </StatusMessage>
          ) : null}

          <div className="member-card member-book-cta-card">
            <BookDetailCta
              available={available}
              ownLoan={ownLoan}
              loanStatus={loanStatus}
              pendingRequest={Boolean(pendingRequest)}
              ownReservation={ownReservation}
              atBorrowLimit={atBorrowLimit}
              busy={pending}
              requesting={createCheckoutRequest.isPending}
              reserving={createReservation.isPending}
              cancelling={cancelReservation.isPending}
              onRequestCheckout={() => void onRequestCheckout()}
              onReserve={() => void onReserve()}
              onCancelReservation={() => setConfirmCancel(true)}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        showClose={false}
      >
        <DialogHeader>
          <DialogTitle>Cancel this reservation?</DialogTitle>
          <DialogDescription>
            You will lose your place in the queue for {book.title}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmCancel(false)}
            disabled={cancelReservation.isPending}
          >
            Keep reservation
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={cancelReservation.isPending}
            loadingText="Cancelling…"
            onClick={() => void onCancel()}
          >
            Cancel reservation
          </Button>
        </DialogFooter>
      </Dialog>
    </MemberContent>
  );
}

function BookDetailCta({
  available,
  ownLoan,
  loanStatus,
  pendingRequest,
  ownReservation,
  atBorrowLimit,
  busy,
  requesting,
  reserving,
  cancelling,
  onRequestCheckout,
  onReserve,
  onCancelReservation,
}: Readonly<{
  available: boolean;
  ownLoan?: { dueDate: string };
  loanStatus: ReturnType<typeof getLoanDueStatus> | null;
  pendingRequest: boolean;
  ownReservation?: { queuePosition: number | null };
  atBorrowLimit: boolean;
  busy: boolean;
  requesting: boolean;
  reserving: boolean;
  cancelling: boolean;
  onRequestCheckout: () => void;
  onReserve: () => void;
  onCancelReservation: () => void;
}>) {
  if (ownLoan) {
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">You&apos;re currently borrowing this book</p>
        <p className="member-book-cta-copy">
          Due {formatDueDate(ownLoan.dueDate)} · {loanStatus?.label}
        </p>
        <p className="member-book-cta-copy">Returns are handled at the library desk.</p>
      </div>
    );
  }

  if (pendingRequest) {
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">Request pending</p>
        <p className="member-book-cta-copy">
          A librarian will prepare your copy. Collect it from the library once it is
          issued.
        </p>
        <div className="member-book-cta-action">
          <Button type="button" variant="secondary" disabled>
            Request pending
          </Button>
        </div>
      </div>
    );
  }

  if (ownReservation) {
    return (
      <div className="member-book-cta">
        <p className="member-queue m-0 text-xl">
          #{ownReservation.queuePosition ?? '—'} in queue
        </p>
        <p className="member-book-cta-copy">
          We&apos;ll hold your place until a copy is returned.
        </p>
        <div className="member-book-cta-action">
          <Button
            type="button"
            variant="secondary"
            loading={cancelling}
            disabled={busy}
            onClick={onCancelReservation}
          >
            Cancel reservation
          </Button>
        </div>
      </div>
    );
  }

  if (available) {
    if (atBorrowLimit) {
      return (
        <div className="member-book-cta">
          <p className="member-book-cta-title">Borrowing limit reached</p>
          <p className="member-book-cta-copy">{MEMBER_BORROW_LIMIT_MESSAGE}</p>
          <p className="member-book-cta-copy">
            This title is available at the library. Return a book at the desk before
            requesting another checkout.
          </p>
          <div className="member-book-cta-action">
            <Button type="button" variant="secondary" disabled>
              Request Checkout
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">Available now</p>
        <p className="member-book-cta-copy">
          Request this title. A librarian will choose a physical copy and issue it at the
          desk.
        </p>
        <div className="member-book-cta-action">
          <Button type="button" loading={requesting} disabled={busy} onClick={onRequestCheckout}>
            Request Checkout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="member-book-cta">
      <p className="member-book-cta-title">All copies are on loan</p>
      <p className="member-book-cta-copy">Reserve this title to join the queue.</p>
      <div className="member-book-cta-action">
        <Button type="button" loading={reserving} disabled={busy} onClick={onReserve}>
          Reserve Book
        </Button>
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
