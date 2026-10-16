/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { BookDetailCta } from '@/components/member/book-detail-cta';

describe('BookDetailCta', () => {
  const idle = {
    ownLoan: null,
    loanStatus: null,
    pendingRequest: false,
    ownReservation: null,
    actionsLoading: false,
    actionsError: false,
    isGuest: false,
    isMember: true,
    busy: false,
    requesting: false,
    reserving: false,
    cancelling: false,
    onRequestCheckout: jest.fn(),
    onReserve: jest.fn(),
    onCancelReservation: jest.fn(),
  };

  it('disables request checkout at the borrow limit', () => {
    render(
      <BookDetailCta
        {...idle}
        available
        atBorrowLimit
      />,
    );
    expect(
      (screen.getByRole('button', { name: 'Request Checkout' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getAllByText(/Borrowing limit reached/i).length).toBeGreaterThan(0);
  });

  it('asks guests to log in', () => {
    render(
      <BookDetailCta
        {...idle}
        available
        atBorrowLimit={false}
        isGuest
        isMember={false}
      />,
    );
    expect(screen.getByRole('link', { name: 'Log in' })).toBeTruthy();
  });
});
