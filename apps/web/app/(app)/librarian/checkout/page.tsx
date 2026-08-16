'use client';

import { Suspense, useEffect, useState } from 'react';
import { MEMBER_BORROW_LIMIT_MESSAGE, type MemberSearchHit } from '@shared/types';
import { Alert, Field, StatusMessage, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  CheckoutActions,
  CheckoutSummary,
  CopyPicker,
  MemberPicker,
  StaffPageHeader,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { canCheckout, LIBRARIAN_ROLES } from '@/lib/auth/roles';
import {
  useBookCopies,
  useBooks,
  useCheckoutLoan,
  useMember,
  useMemberLoanSummary,
  useMemberSearch,
} from '@/lib/bookly';
import { useDebouncedValue, useStaffListParams } from '@/lib/staff';
import { useCheckoutSelection } from '@/lib/store';

function CheckoutContent() {
  const { user } = useAuth();
  const isStaff = canCheckout(user);
  const { get } = useStaffListParams();
  const memberIdFromUrl = get('memberId');

  const [memberQuery, setMemberQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [pickedMember, setPickedMember] = useState<MemberSearchHit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const debouncedMemberQ = useDebouncedValue(memberQuery.trim(), 250);
  const debouncedBookQ = useDebouncedValue(bookQuery.trim(), 250);

  const {
    selectedMemberId,
    selectedBookId,
    selectedCopyId,
    setSelectedMemberId,
    setSelectedBookId,
    setSelectedCopyId,
    resetCheckoutWorkflow,
  } = useCheckoutSelection();

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
  const atLimit = (loanSummary.data?.remaining ?? 1) <= 0;
  const selectedName =
    pickedMember?.fullName ?? selectedMember.data?.fullName ?? null;
  const selectedDisplayName =
    selectedName ?? (selectedMember.isPending ? 'Loading member…' : 'Selected member');
  let loanMeta: string | null = null;
  if (loanSummary.isPending) {
    loanMeta = 'Checking borrow slots…';
  } else if (loanSummary.data) {
    loanMeta = `Active loans: ${loanSummary.data.activeLoanCount} / ${loanSummary.data.maxActiveLoans} · Status: ${loanSummary.data.status}`;
  }
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
          <MemberPicker
            query={memberQuery}
            onQueryChange={setMemberQuery}
            hits={!selectedMemberId ? members.data : undefined}
            selectedId={selectedMemberId}
            selectedName={selectedDisplayName}
            selectedEmail={selectedEmail}
            selectedMeta={loanMeta}
            warning={atLimit ? MEMBER_BORROW_LIMIT_MESSAGE : null}
            onSelect={selectMember}
            onClear={clearMember}
            disabled={!isStaff}
            error={members.isError ? toUserMessage(members.error) : null}
            inputId="checkout-member"
          />

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
            <CopyPicker
              copies={copies.data ?? []}
              selectedId={selectedCopyId}
              onSelect={setSelectedCopyId}
              loading={copies.isPending}
            />
          ) : null}

          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

          <CheckoutSummary
            memberName={selectedName}
            copyCount={availableCopies.length}
            atLimit={atLimit}
          />

          <CheckoutActions
            pending={checkout.isPending}
            disabled={
              !isStaff ||
              !selectedMemberId ||
              !selectedCopyId ||
              checkout.isPending ||
              atLimit
            }
            onConfirm={() => void onConfirm()}
          />
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
