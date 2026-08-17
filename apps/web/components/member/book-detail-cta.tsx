import Link from 'next/link';
import { MEMBER_BORROW_LIMIT_MESSAGE } from '@shared/types';
import { Button } from '@shared/ui/components';
import { ROUTES } from '@/lib/auth/routes';
import { formatDueDate, getLoanDueStatus } from '@/lib/member';

export function BookDetailCta({
  available,
  ownLoan,
  loanStatus,
  pendingRequest,
  ownReservation,
  atBorrowLimit,
  actionsLoading,
  actionsError,
  isGuest,
  isMember,
  busy,
  requesting,
  reserving,
  cancelling,
  onRequestCheckout,
  onReserve,
  onCancelReservation,
}: Readonly<{
  available: boolean;
  ownLoan?: { dueDate: string } | null;
  loanStatus: ReturnType<typeof getLoanDueStatus> | null;
  pendingRequest: boolean;
  ownReservation?: { queuePosition: number | null } | null;
  atBorrowLimit: boolean;
  actionsLoading: boolean;
  actionsError: boolean;
  isGuest: boolean;
  isMember: boolean;
  busy: boolean;
  requesting: boolean;
  reserving: boolean;
  cancelling: boolean;
  onRequestCheckout: () => void;
  onReserve: () => void;
  onCancelReservation: () => void;
}>) {
  if (!isMember) {
    let guestCopy = 'Request and reserve are member actions.';
    if (isGuest && available) {
      guestCopy = 'Log in as a member to request this title at the desk.';
    } else if (isGuest) {
      guestCopy = 'Log in as a member to join the reservation queue.';
    }
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">
          {available ? 'Available now' : 'All copies are on loan'}
        </p>
        <p className="member-book-cta-copy">{guestCopy}</p>
        {isGuest ? (
          <div className="member-book-cta-action">
            <Link href={ROUTES.login} className="ui-button ui-button-md ui-button-primary no-underline">
              Log in
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  if (actionsLoading) {
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">Checking your account…</p>
        <p className="member-book-cta-copy">Borrowing options will appear in a moment.</p>
        <div className="member-book-cta-action">
          <Button type="button" disabled>
            {available ? 'Request Checkout' : 'Reserve Book'}
          </Button>
        </div>
      </div>
    );
  }

  if (actionsError) {
    return (
      <div className="member-book-cta">
        <p className="member-book-cta-title">Could not load borrowing options</p>
        <p className="member-book-cta-copy">Refresh the page and try again.</p>
        <div className="member-book-cta-action">
          <Button type="button" disabled>
            {available ? 'Request Checkout' : 'Reserve Book'}
          </Button>
        </div>
      </div>
    );
  }

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
