'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Field, StatusMessage, TextInput } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import {
  useBookCopies,
  useBooks,
  useCheckoutLoan,
  useMemberLoanSummary,
  useMemberSearch,
} from '@/lib/bookly';
import { useLibraryStore } from '@/lib/store';

export function CheckoutPanel() {
  const [memberQuery, setMemberQuery] = useState('');
  const [debouncedMemberQ, setDebouncedMemberQ] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [debouncedBookQ, setDebouncedBookQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedMemberId = useLibraryStore((s) => s.selectedMemberId);
  const selectedBookId = useLibraryStore((s) => s.selectedBookId);
  const selectedCopyId = useLibraryStore((s) => s.selectedCopyId);
  const setSelectedMemberId = useLibraryStore((s) => s.setSelectedMemberId);
  const setSelectedBookId = useLibraryStore((s) => s.setSelectedBookId);
  const setSelectedCopyId = useLibraryStore((s) => s.setSelectedCopyId);
  const resetCheckoutWorkflow = useLibraryStore((s) => s.resetCheckoutWorkflow);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMemberQ(memberQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [memberQuery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBookQ(bookQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [bookQuery]);

  const members = useMemberSearch(debouncedMemberQ);
  const loanSummary = useMemberLoanSummary(selectedMemberId ?? undefined);
  const books = useBooks(
    debouncedBookQ
      ? { q: debouncedBookQ, limit: 8, sort: 'title' }
      : { limit: 8, sort: 'title' },
  );
  const copies = useBookCopies(selectedBookId ?? undefined);
  const checkout = useCheckoutLoan();

  const availableCopies =
    copies.data?.filter((copy) => copy.status === 'available' && !copy.deletedAt) ?? [];
  const otherCopies =
    copies.data?.filter((copy) => copy.status !== 'available' && !copy.deletedAt) ?? [];

  async function onConfirm() {
    setError(null);
    setSuccess(null);
    if (!selectedMemberId || !selectedCopyId) {
      setError('Select a member and an available copy before checkout.');
      return;
    }
    try {
      await checkout.mutateAsync({
        userId: selectedMemberId,
        bookCopyId: selectedCopyId,
      });
      setSuccess('Checkout confirmed.');
      setMemberQuery('');
      setBookQuery('');
      resetCheckoutWorkflow();
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <section id="checkout" className="staff-card staff-card-operational scroll-mt-24">
      <div className="p-4 pb-2">
        <h2 className="staff-section-title">Checkout a book</h2>
        <p className="staff-section-desc">Assign an available copy to a member.</p>
      </div>
      <div className="staff-panel-body staff-form-stack">
        <Field label="Member" htmlFor="checkout-member">
          <TextInput
            id="checkout-member"
            value={memberQuery}
            onChange={(e) => setMemberQuery(e.target.value)}
            placeholder="Search name, email, or member ID…"
            autoComplete="off"
          />
        </Field>

        {members.isError ? (
          <Alert tone="danger" title="Member search failed">
            {toUserMessage(members.error)}
          </Alert>
        ) : null}

        {members.data && members.data.length > 0 ? (
          <ul className="staff-result-list">
            {members.data.map((hit) => (
              <li key={hit.userId}>
                <button
                  type="button"
                  className={`staff-pick-row ${
                    selectedMemberId === hit.userId ? 'is-selected' : ''
                  }`}
                  onClick={() => setSelectedMemberId(hit.userId)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-medium">{hit.fullName}</p>
                    <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                      {hit.email} · {hit.activeLoanCount} active loan(s)
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {selectedMemberId && loanSummary.data ? (
          <div className="rounded-md border border-[color:var(--bookly-border)] bg-[color:var(--bookly-paper)] p-3 text-sm">
            <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
              Member details
            </p>
            <p className="m-0 mt-1 text-[color:var(--bookly-muted)]">
              Active loans: {loanSummary.data.activeLoanCount} /{' '}
              {loanSummary.data.maxActiveLoans}
              {' · '}Status: {loanSummary.data.status}
              {' · '}Remaining: {loanSummary.data.remaining}
            </p>
          </div>
        ) : null}

        <Field label="Book" htmlFor="checkout-book">
          <TextInput
            id="checkout-book"
            value={bookQuery}
            onChange={(e) => {
              setBookQuery(e.target.value);
              setSelectedBookId(null);
              setSelectedCopyId(null);
            }}
            placeholder="Search title, author, or ISBN…"
            autoComplete="off"
          />
        </Field>

        {books.data && books.data.items.length > 0 ? (
          <ul className="staff-result-list max-h-48 overflow-y-auto">
            {books.data.items.map((book) => (
              <li key={book.id}>
                <button
                  type="button"
                  className={`staff-pick-row ${selectedBookId === book.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedBookId(book.id);
                    setSelectedCopyId(null);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 font-medium">{book.title}</p>
                    <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                      {book.author} · {book.isbn}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {selectedBookId ? (
          <div>
            <p className="mb-2 m-0 text-sm font-medium">Available copies</p>
            {copies.isPending ? (
              <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                Loading copies…
              </p>
            ) : null}
            {availableCopies.length === 0 && !copies.isPending ? (
              <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                No available copies for this title.
              </p>
            ) : (
              <ul className="staff-result-list">
                {availableCopies.map((copy) => (
                  <li key={copy.id}>
                    <button
                      type="button"
                      className={`mb-1 w-full rounded-md border px-3 py-2 text-left text-sm ${
                        selectedCopyId === copy.id
                          ? 'border-[color:var(--bookly-teal-muted,#00a88e)] bg-[color-mix(in_srgb,var(--bookly-teal-muted,#00a88e)_10%,#fff)]'
                          : 'border-[color:var(--bookly-border)] bg-white'
                      }`}
                      onClick={() => setSelectedCopyId(copy.id)}
                    >
                      {copy.barcode} · {copy.status}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {otherCopies.length > 0 ? (
              <ul className="staff-result-list mt-2">
                {otherCopies.map((copy) => (
                  <li
                    key={copy.id}
                    className="mb-1 rounded-md border border-[color:var(--bookly-border)] px-3 py-2 font-mono text-sm text-[color:var(--bookly-muted)]"
                  >
                    {copy.barcode} · {copy.status}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

        <Button
          type="button"
          loading={checkout.isPending}
          loadingText="Checking out…"
          disabled={!selectedMemberId || !selectedCopyId || checkout.isPending}
          onClick={() => void onConfirm()}
        >
          Confirm checkout
        </Button>
      </div>
    </section>
  );
}
