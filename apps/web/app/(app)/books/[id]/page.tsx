'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton, StatusMessage } from '@shared/ui/components';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import {
  BookAvailability,
  BookDetailCta,
  BookHeader,
  MemberContent,
  MemberError,
} from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useBookDetailActions } from '@/lib/bookly';
import { getLoanDueStatus } from '@/lib/member';

function BookDetailContent() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const detail = useBookDetailActions(bookId);
  const book = detail.bookQuery.data;
  const available = (book?.availableCopies ?? 0) > 0;
  const ownLoan = detail.actions?.ownLoan ?? null;
  const loanStatus = ownLoan ? getLoanDueStatus(ownLoan.dueDate) : null;

  if (detail.bookQuery.isPending) {
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

  if (detail.bookQuery.isError || !book) {
    return (
      <MemberContent className="space-y-4">
        <MemberError title="Could not load this book" error={detail.bookQuery.error} />
        <Link href={ROUTES.books} className="member-back-link">
          ← Back to Browse Books
        </Link>
      </MemberContent>
    );
  }

  return (
    <MemberContent className="member-book-detail">
      <Link href={ROUTES.books} className="member-back-link">
        ← Back to Browse Books
      </Link>

      <div className="member-enter member-book-hero">
        <div className="flex min-w-0 flex-col gap-6">
          <BookHeader
            book={book}
            available={available}
            ownLoanDueDate={ownLoan?.dueDate}
            reserved={Boolean(detail.actions?.ownReservation)}
            requestPending={Boolean(detail.actions?.pendingRequest)}
          />

          <BookAvailability book={book} />

          {book.description ? (
            <section className="member-book-section">
              <h2 className="member-book-section-title">Description</h2>
              <p className="m-0 leading-relaxed text-[color:var(--bookly-navy)]">
                {book.description}
              </p>
            </section>
          ) : null}

          {detail.actionsError ? (
            <StatusMessage tone="error">
              {toUserMessage(detail.actionsErrorMessage)}
            </StatusMessage>
          ) : null}

          {detail.message ? (
            <StatusMessage tone={detail.message.tone}>
              <span className="whitespace-pre-line">{detail.message.text}</span>
            </StatusMessage>
          ) : null}

          <div className="member-card member-book-cta-card">
            <BookDetailCta
              available={available}
              ownLoan={ownLoan}
              loanStatus={loanStatus}
              pendingRequest={Boolean(detail.actions?.pendingRequest)}
              ownReservation={detail.actions?.ownReservation}
              atBorrowLimit={Boolean(detail.actions?.atBorrowLimit)}
              actionsLoading={detail.actionsLoading}
              actionsError={detail.actionsError}
              isGuest={detail.isGuest}
              isMember={detail.isMember}
              busy={detail.pending}
              requesting={detail.requesting}
              reserving={detail.reserving}
              cancelling={detail.cancelling}
              onRequestCheckout={() => void detail.onRequestCheckout()}
              onReserve={() => void detail.onReserve()}
              onCancelReservation={() => detail.setConfirmCancel(true)}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={detail.confirmCancel}
        onOpenChange={detail.setConfirmCancel}
        title="Cancel this reservation?"
        description={`You will lose your place in the queue for ${book.title}.`}
        confirmLabel="Cancel reservation"
        cancelLabel="Keep reservation"
        pending={detail.cancelling}
        pendingText="Cancelling…"
        danger
        onConfirm={() => void detail.onCancel()}
      />
    </MemberContent>
  );
}

export default function BookDetailPage() {
  return <BookDetailContent />;
}
