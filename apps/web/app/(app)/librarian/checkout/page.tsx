'use client';

import { Suspense, useEffect, useState } from 'react';
import { MEMBER_BORROW_LIMIT_MESSAGE, type MemberSearchHit } from '@shared/types';
import { Alert, Button, Field, StatusMessage, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import { StaffPageHeader } from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { hasRole, LIBRARIAN_ROLES, ROLES } from '@/lib/auth/roles';
import {
  useBookCopies,
  useBooks,
  useCheckoutLoan,
  useMember,
  useMemberLoanSummary,
  useMemberSearch,
} from '@/lib/bookly';
import { useDebouncedValue, useStaffListParams } from '@/lib/staff';
import { useLibraryStore } from '@/lib/store';

function CheckoutContent() {
  const { user } = useAuth();
  const isStaff = hasRole(user, [ROLES.staff]);
  const { get } = useStaffListParams();
  const memberIdFromUrl = get('memberId');

  const [memberQuery, setMemberQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [pickedMember, setPickedMember] = useState<MemberSearchHit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const debouncedMemberQ = useDebouncedValue(memberQuery.trim(), 250);
  const debouncedBookQ = useDebouncedValue(bookQuery.trim(), 250);

  const selectedMemberId = useLibraryStore((s) => s.selectedMemberId);
  const selectedBookId = useLibraryStore((s) => s.selectedBookId);
  const selectedCopyId = useLibraryStore((s) => s.selectedCopyId);
  const setSelectedMemberId = useLibraryStore((s) => s.setSelectedMemberId);
  const setSelectedBookId = useLibraryStore((s) => s.setSelectedBookId);
  const setSelectedCopyId = useLibraryStore((s) => s.setSelectedCopyId);
  const resetCheckoutWorkflow = useLibraryStore((s) => s.resetCheckoutWorkflow);

  useEffect(() => {
    if (memberIdFromUrl) setSelectedMemberId(memberIdFromUrl);
  }, [memberIdFromUrl, setSelectedMemberId]);

  const members = useMemberSearch(debouncedMemberQ);
  const selectedMember = useMember(selectedMemberId ?? undefined);
  const loanSummary = useMemberLoanSummary(selectedMemberId ?? undefined);
  const books = useBooks(
    { q: debouncedBookQ, limit: 8, sort: 'title' },
    { enabled: Boolean(selectedMemberId) && debouncedBookQ.length > 0 },
  );
  const copies = useBookCopies(selectedBookId ?? undefined);
  const checkout = useCheckoutLoan();

  const availableCopies =
    copies.data?.filter((copy) => copy.status === 'available' && !copy.deletedAt) ?? [];
  const otherCopies =
    copies.data?.filter((copy) => copy.status !== 'available' && !copy.deletedAt) ?? [];
  const atLimit = (loanSummary.data?.remaining ?? 1) <= 0;
  const selectedName =
    pickedMember?.fullName ?? selectedMember.data?.fullName ?? null;
  const selectedEmail = pickedMember?.email ?? selectedMember.data?.email ?? null;

  function selectMember(hit: MemberSearchHit) {
    setPickedMember(hit);
    setSelectedMemberId(hit.userId);
    setSelectedBookId(null);
    setSelectedCopyId(null);
    setMemberQuery('');
    setError(null);
    setSuccess(null);
  }

  function clearMember() {
    setPickedMember(null);
    setSelectedMemberId(null);
    setSelectedBookId(null);
    setSelectedCopyId(null);
    setMemberQuery('');
    setBookQuery('');
  }

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
      setPickedMember(null);
      resetCheckoutWorkflow();
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Checkout Book"
        description="Find a member, confirm remaining borrow slots, then issue an available copy."
      />
      {!isStaff ? (
        <div className="mb-4">
          <Alert tone="info" title="Checkout is staff-only">
            You can view this workflow. Issuing a copy is a staff desk operation.
          </Alert>
        </div>
      ) : null}

      <section className="staff-card staff-card-operational">
        <div className="staff-panel-body staff-form-stack">
          {selectedMemberId ? (
            <div className="staff-selected-card">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
                  Selected member
                </p>
                <p className="m-0 mt-1 font-medium text-[color:var(--bookly-navy)]">
                  {selectedName ??
                    (selectedMember.isPending ? 'Loading member…' : 'Selected member')}
                </p>
                {selectedEmail ? (
                  <p className="m-0 mt-1 text-sm text-[color:var(--bookly-muted)]">
                    {selectedEmail}
                  </p>
                ) : null}
                {loanSummary.isPending ? (
                  <p className="m-0 mt-2 text-sm text-[color:var(--bookly-muted)]">
                    Checking borrow slots…
                  </p>
                ) : null}
                {loanSummary.data ? (
                  <p className="m-0 mt-2 text-sm text-[color:var(--bookly-muted)]">
                    Active loans: {loanSummary.data.activeLoanCount} /{' '}
                    {loanSummary.data.maxActiveLoans}
                    {' · '}Status: {loanSummary.data.status}
                  </p>
                ) : null}
                {atLimit ? (
                  <p className="m-0 mt-2 text-sm text-[color:var(--staff-warn)]">
                    {MEMBER_BORROW_LIMIT_MESSAGE}
                  </p>
                ) : null}
              </div>
              {isStaff ? (
                <Button type="button" size="sm" variant="secondary" onClick={clearMember}>
                  Change
                </Button>
              ) : null}
            </div>
          ) : (
            <Field label="Member" htmlFor="checkout-member">
              <TextInput
                id="checkout-member"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Search name, email, or member ID…"
                autoComplete="off"
                disabled={!isStaff}
              />
            </Field>
          )}

          {members.isError ? (
            <Alert tone="danger" title="Member search failed">
              {toUserMessage(members.error)}
            </Alert>
          ) : null}

          {selectedMember.isError && selectedMemberId ? (
            <Alert tone="danger" title="Could not load member profile">
              {toUserMessage(selectedMember.error)} Checkout can still continue with this
              member if borrow slots load.
            </Alert>
          ) : null}

          {loanSummary.isError && selectedMemberId ? (
            <Alert tone="danger" title="Could not load borrow slots">
              {toUserMessage(loanSummary.error)}
            </Alert>
          ) : null}

          {!selectedMemberId && members.data && members.data.length > 0 ? (
            <ul className="staff-result-list">
              {members.data.map((hit) => (
                <li key={hit.userId}>
                  <button
                    type="button"
                    className="staff-pick-row"
                    aria-pressed={selectedMemberId === hit.userId}
                    onClick={() => selectMember(hit)}
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

          {!selectedMemberId && debouncedMemberQ && members.data?.length === 0 && !members.isPending ? (
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              No members matched that search.
            </p>
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
              disabled={!isStaff || !selectedMemberId || atLimit}
            />
          </Field>

          {books.data && books.data.items.length > 0 ? (
            <ul className="staff-result-list max-h-48 overflow-y-auto">
              {books.data.items.map((book) => (
                <li key={book.id}>
                  <button
                    type="button"
                    className={`staff-pick-row ${selectedBookId === book.id ? 'is-selected' : ''}`}
                    aria-pressed={selectedBookId === book.id}
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setSelectedCopyId(null);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-medium">{book.title}</p>
                      <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                        {book.author} · {book.isbn} · {book.availableCopies ?? 0} available
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
                <p className="m-0 text-sm text-[color:var(--bookly-muted)]">Loading copies…</p>
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
                        className={`staff-pick-row ${selectedCopyId === copy.id ? 'is-selected' : ''}`}
                        aria-pressed={selectedCopyId === copy.id}
                        onClick={() => setSelectedCopyId(copy.id)}
                      >
                        <span className="font-mono text-sm">
                          {copy.barcode} · {copy.status}
                        </span>
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
                      className="rounded-md border border-[color:var(--bookly-border)] px-3 py-2 font-mono text-sm text-[color:var(--bookly-muted)]"
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
            disabled={
              !isStaff ||
              !selectedMemberId ||
              !selectedCopyId ||
              checkout.isPending ||
              atLimit
            }
            onClick={() => void onConfirm()}
          >
            Confirm checkout
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function LibrarianCheckoutPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Checkout Book" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </RequireRole>
  );
}
