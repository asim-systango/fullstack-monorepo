'use client';

import { Suspense, useEffect, useState } from 'react';
import { Alert, Button, Field, StatusMessage, TextInput } from '@shared/ui/components';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  LoanPicker,
  MemberPicker,
  StaffEmptyState,
  StaffFineSettlement,
  StaffPageHeader,
  needsReturnFineSettlement,
  type FineSettlement,
} from '@/components/staff';
import { useAuth } from '@/components/auth';
import { toUserMessage } from '@/lib/auth/errors';
import { canReturn, LIBRARIAN_ROLES } from '@/lib/auth/roles';
import {
  useLoanLookup,
  useLoans,
  useMember,
  useMemberSearch,
  useReturnLoan,
} from '@/lib/bookly';
import { daysLate, formatDueDate, formatMoneyInr, formatShortDate } from '@/lib/member';
import { useDebouncedValue, useStaffListParams } from '@/lib/staff';
import { OVERDUE_RETURN_SETTLEMENT_MESSAGE, type LoanWithRelations, type MemberSearchHit } from '@shared/types';

function ReturnContent() {
  const { user } = useAuth();
  const isStaff = canReturn(user);
  const { get } = useStaffListParams();
  const memberIdFromUrl = get('memberId');

  const [barcode, setBarcode] = useState('');
  const [lookupBarcode, setLookupBarcode] = useState<string | undefined>();
  const [memberQuery, setMemberQuery] = useState('');
  const [pickedMember, setPickedMember] = useState<MemberSearchHit | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(memberIdFromUrl || null);
  const [selectedLoan, setSelectedLoan] = useState<LoanWithRelations | null>(null);
  const [fineSettlement, setFineSettlement] = useState<FineSettlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const debouncedMemberQ = useDebouncedValue(memberQuery.trim(), 250);

  useEffect(() => {
    if (memberIdFromUrl) setSelectedMemberId(memberIdFromUrl);
  }, [memberIdFromUrl]);

  const members = useMemberSearch(debouncedMemberQ);
  const selectedMember = useMember(selectedMemberId ?? undefined);
  const memberLoans = useLoans(
    { userId: selectedMemberId ?? undefined, status: 'active', limit: 20 },
    { enabled: Boolean(selectedMemberId) },
  );
  const lookup = useLoanLookup(lookupBarcode ? { barcode: lookupBarcode } : undefined);
  const returnLoan = useReturnLoan();

  useEffect(() => {
    if (lookup.data) setSelectedLoan(lookup.data);
  }, [lookup.data]);

  useEffect(() => {
    if (lookup.isError) setError(toUserMessage(lookup.error));
  }, [lookup.isError, lookup.error]);

  useEffect(() => {
    setFineSettlement(null);
  }, [selectedLoan?.id]);

  function onLookup() {
    setError(null);
    setSuccess(null);
    setSelectedLoan(null);
    const trimmed = barcode.trim();
    if (!trimmed) {
      setError('Enter a barcode to look up the active loan.');
      return;
    }
    setLookupBarcode(trimmed);
  }

  async function onConfirm() {
    if (!selectedLoan) return;
    setError(null);
    setSuccess(null);
    const late = daysLate(selectedLoan.dueDate);
    const due = needsReturnFineSettlement(selectedLoan, late);
    if (due && !fineSettlement) {
      setError(OVERDUE_RETURN_SETTLEMENT_MESSAGE);
      return;
    }
    try {
      const loan = await returnLoan.mutateAsync({
        id: selectedLoan.id,
        input: due && fineSettlement ? { fineSettlement } : undefined,
      });
      const fine = loan.fine;
      if (fine?.status === 'paid') {
        setSuccess(`Return recorded. Fine collected: ${formatMoneyInr(fine.amountCents)}.`);
      } else if (fine?.status === 'unpaid') {
        setSuccess(
          `Return recorded. Unpaid fine ${formatMoneyInr(fine.amountCents)} remains on the member account.`,
        );
      } else {
        setSuccess('Return recorded successfully.');
      }
      setBarcode('');
      setLookupBarcode(undefined);
      setSelectedLoan(null);
      setFineSettlement(null);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  const daysLateCount = selectedLoan ? daysLate(selectedLoan.dueDate) : 0;
  const dueSettlement =
    selectedLoan != null && needsReturnFineSettlement(selectedLoan, daysLateCount);

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Return Book"
        description="Look up an active loan by barcode or find the member and select the title."
      />
      {!isStaff ? (
        <div className="mb-4">
          <Alert tone="info" title="Return is staff-only">
            You can view this workflow. Recording a return is a staff desk operation.
          </Alert>
        </div>
      ) : null}

      <section className="staff-card staff-card-operational">
        <div className="staff-panel-body staff-form-stack">
          <div className="staff-inline-field">
            <Field label="Barcode" htmlFor="return-barcode">
              <TextInput
                id="return-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter barcode…"
                autoComplete="off"
                disabled={!isStaff}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onLookup();
                  }
                }}
              />
            </Field>
            <Button
              type="button"
              variant="secondary"
              onClick={onLookup}
              loading={lookup.isFetching}
              disabled={!isStaff}
            >
              Look up loan
            </Button>
          </div>

          <MemberPicker
            query={memberQuery}
            onQueryChange={setMemberQuery}
            hits={!selectedMemberId ? members.data : undefined}
            selectedId={selectedMemberId}
            selectedName={
              pickedMember?.fullName ??
              selectedMember.data?.fullName ??
              (selectedMember.isPending ? 'Loading member…' : 'Selected member')
            }
            selectedEmail={pickedMember?.email ?? selectedMember.data?.email}
            onSelect={(hit) => {
              setPickedMember(hit);
              setSelectedMemberId(hit.userId);
              setSelectedLoan(null);
              setMemberQuery('');
              setError(null);
              setSuccess(null);
            }}
            onClear={() => {
              setPickedMember(null);
              setSelectedMemberId(null);
              setSelectedLoan(null);
              setMemberQuery('');
            }}
            disabled={!isStaff}
            error={members.isError ? toUserMessage(members.error) : null}
            inputId="return-member"
            placeholder="Search name, email, or member ID…"
          />

          {selectedMember.isError && selectedMemberId ? (
            <Alert tone="danger" title="Could not load member profile">
              {toUserMessage(selectedMember.error)} Active loans can still be loaded below.
            </Alert>
          ) : null}

          {selectedMemberId ? (
            <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
              Active loans for{' '}
              {pickedMember?.fullName ?? selectedMember.data?.fullName ?? 'this member'}
            </p>
          ) : null}

          {memberLoans.data && memberLoans.data.items.length === 0 ? (
            <StaffEmptyState
              title="No active loans"
              description="This member does not currently have a book out."
            />
          ) : null}
          {memberLoans.data && memberLoans.data.items.length > 0 ? (
            <LoanPicker
              loans={memberLoans.data.items}
              selectedId={selectedLoan?.id}
              onSelect={setSelectedLoan}
              loading={memberLoans.isPending}
            />
          ) : null}
          {memberLoans.isPending && selectedMemberId && !memberLoans.data ? (
            <LoanPicker loans={[]} selectedId={null} onSelect={setSelectedLoan} loading />
          ) : null}

          {selectedLoan ? (
            <div className="rounded-md border border-[color:var(--bookly-border)] p-3 text-sm">
              <p className="m-0 font-medium">{selectedLoan.book.title}</p>
              <p className="m-0 mt-1 text-[color:var(--bookly-muted)]">
                {selectedLoan.book.author} · {selectedLoan.bookCopy.barcode}
                {selectedLoan.member ? ` · ${selectedLoan.member.fullName}` : ''}
              </p>
              <p className="m-0 mt-2 text-[color:var(--bookly-muted)]">
                Issued {formatShortDate(selectedLoan.borrowedAt)} · Due{' '}
                {formatDueDate(selectedLoan.dueDate)}
              </p>
              {daysLateCount > 0 ? (
                <p className="m-0 mt-2">
                  <span className="staff-status-chip staff-status-overdue">
                    Overdue · {daysLateCount} days
                  </span>
                </p>
              ) : (
                <p className="m-0 mt-2">
                  <span className="staff-status-chip staff-status-ok">On schedule</span>
                </p>
              )}
              {selectedLoan.fine ? (
                <p className="m-0 mt-2 text-[color:var(--bookly-navy)]">
                  Fine on file: {formatMoneyInr(selectedLoan.fine.amountCents)} (
                  {selectedLoan.fine.status})
                </p>
              ) : null}
              {dueSettlement ? (
                <div className="mt-3">
                  <StaffFineSettlement
                    daysLate={daysLateCount}
                    amountCents={selectedLoan.fine?.amountCents ?? null}
                    value={fineSettlement}
                    onChange={setFineSettlement}
                    disabled={!isStaff}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
          {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

          <Button
            type="button"
            loading={returnLoan.isPending}
            loadingText="Returning…"
            disabled={
              !isStaff ||
              !selectedLoan ||
              returnLoan.isPending ||
              (dueSettlement && !fineSettlement)
            }
            onClick={() => void onConfirm()}
          >
            Confirm return
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function LibrarianReturnsPage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Return Book" />
          </div>
        }
      >
        <ReturnContent />
      </Suspense>
    </RequireRole>
  );
}
