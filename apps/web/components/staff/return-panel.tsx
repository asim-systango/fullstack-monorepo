'use client';

import { useEffect, useState } from 'react';
import { OVERDUE_RETURN_SETTLEMENT_MESSAGE } from '@shared/types';
import { Alert, Button, Field, StatusMessage, TextInput } from '@shared/ui/components';
import {
  StaffFineSettlement,
  needsReturnFineSettlement,
  type FineSettlement,
} from './staff-fine-settlement';
import { toUserMessage } from '@/lib/auth/errors';
import { useLoanLookup, useReturnLoan } from '@/lib/bookly';
import { formatDueDate, formatMoneyInr, formatShortDate } from '@/lib/member/format';

function calendarDaysLate(dueDate: string): number {
  const due = new Date(`${dueDate.slice(0, 10)}T00:00:00Z`);
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.max(0, Math.floor((todayUtc - due.getTime()) / 86_400_000));
}

export function ReturnPanel() {
  const [barcode, setBarcode] = useState('');
  const [lookupBarcode, setLookupBarcode] = useState<string | undefined>();
  const [fineSettlement, setFineSettlement] = useState<FineSettlement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const lookup = useLoanLookup(lookupBarcode ? { barcode: lookupBarcode } : undefined);
  const returnLoan = useReturnLoan();
  const loan = lookup.data;
  const daysLate = loan ? calendarDaysLate(loan.dueDate) : 0;
  const dueSettlement = loan != null && needsReturnFineSettlement(loan, daysLate);

  useEffect(() => {
    if (lookup.isError) setError(toUserMessage(lookup.error));
  }, [lookup.isError, lookup.error]);

  useEffect(() => {
    setFineSettlement(null);
  }, [loan?.id]);

  function onLookup() {
    setError(null);
    setSuccess(null);
    const trimmed = barcode.trim();
    if (!trimmed) {
      setError('Enter a barcode to look up the active loan.');
      return;
    }
    setLookupBarcode(trimmed);
  }

  async function onConfirm() {
    if (!loan) return;
    setError(null);
    setSuccess(null);
    if (dueSettlement && !fineSettlement) {
      setError(OVERDUE_RETURN_SETTLEMENT_MESSAGE);
      return;
    }
    try {
      const returned = await returnLoan.mutateAsync({
        id: loan.id,
        input: dueSettlement && fineSettlement ? { fineSettlement } : undefined,
      });
      const fine = returned.fine;
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
      setFineSettlement(null);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <section id="return" className="staff-card staff-card-operational scroll-mt-24">
      <div className="p-4 pb-2">
        <h2 className="staff-section-title">Return a book</h2>
        <p className="staff-section-desc">Look up an active loan by copy barcode.</p>
      </div>
      <div className="staff-panel-body staff-form-stack">
        <Field label="Barcode" htmlFor="return-barcode">
          <TextInput
            id="return-barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or enter barcode…"
            autoComplete="off"
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
        >
          Look up loan
        </Button>

        {loan ? (
          <div className="rounded-md border border-[color:var(--bookly-border)] p-3 text-sm">
            <p className="m-0 font-medium">{loan.book.title}</p>
            <p className="m-0 mt-1 text-[color:var(--bookly-muted)]">
              {loan.book.author} · {loan.bookCopy.barcode}
            </p>
            <p className="m-0 mt-2 text-[color:var(--bookly-muted)]">
              Issued {formatShortDate(loan.borrowedAt)} · Due{' '}
              {formatDueDate(loan.dueDate)}
            </p>
            {daysLate > 0 ? (
              <p className="m-0 mt-2">
                <span className="staff-status-chip staff-status-overdue">
                  Overdue · {daysLate} days
                </span>
              </p>
            ) : (
              <p className="m-0 mt-2">
                <span className="staff-status-chip staff-status-ok">On schedule</span>
              </p>
            )}
            {loan.fine ? (
              <p className="m-0 mt-2 text-[color:var(--bookly-navy)]">
                Fine on file: {formatMoneyInr(loan.fine.amountCents)} ({loan.fine.status})
              </p>
            ) : null}
            {dueSettlement ? (
              <div className="mt-3">
                <StaffFineSettlement
                  daysLate={daysLate}
                  amountCents={loan.fine?.amountCents ?? null}
                  value={fineSettlement}
                  onChange={setFineSettlement}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {lookupBarcode && lookup.isError ? (
          <Alert tone="danger" title="Lookup failed">
            {toUserMessage(lookup.error)}
          </Alert>
        ) : null}

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

        <Button
          type="button"
          loading={returnLoan.isPending}
          loadingText="Returning…"
          disabled={!loan || returnLoan.isPending || (dueSettlement && !fineSettlement)}
          onClick={() => void onConfirm()}
        >
          Confirm return
        </Button>
      </div>
    </section>
  );
}
