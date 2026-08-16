'use client';

import { useState } from 'react';
import type { OverdueLoan, OverdueNoticeBulkResult } from '@shared/types';
import { Alert, Button, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import {
  useOverdueLoans,
  useSendOverdueNotice,
  useSendOverdueNotices,
} from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { StaffEmptyState } from './staff-empty-state';
import { isOverdueNoticeCoolingDown, StaffLoanRow } from './staff-loan-row';

export function OverdueLoansPanel() {
  const overdue = useOverdueLoans({ limit: 12 });
  const sendNotice = useSendOverdueNotice();
  const sendAll = useSendOverdueNotices();
  const [bulkSummary, setBulkSummary] = useState<OverdueNoticeBulkResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);

  async function onEmailAll() {
    const total = overdue.data?.total ?? 0;
    const confirmed = window.confirm(
      `Send overdue reminders to all ${total} overdue loan(s)? Members emailed in the last 24 hours will be skipped. This covers every overdue loan, not only the list on this page.`,
    );
    if (!confirmed) return;
    setBulkSummary(null);
    setBulkError(null);
    try {
      const result = await sendAll.mutateAsync();
      setBulkSummary(result);
    } catch (err) {
      setBulkError(toUserMessage(err));
    }
  }

  return (
    <section id="overdue" className="staff-card staff-card-warn scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-2">
        <div>
          <h2 className="staff-section-title">Overdue loans</h2>
          <p className="staff-section-desc">Past-due items that may need follow-up.</p>
        </div>
        {overdue.data && overdue.data.total > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={sendAll.isPending}
            onClick={() => void onEmailAll()}
          >
            Email all overdue
          </Button>
        ) : null}
      </div>
      <div className="px-4 pb-4">
        {bulkSummary ? (
          <div className="mb-3">
            <Alert tone="success" title="Overdue reminders queued">
              Sent {bulkSummary.sent} · Skipped {bulkSummary.skipped} · Failed{' '}
              {bulkSummary.failed}
            </Alert>
          </div>
        ) : null}
        {bulkError ? (
          <div className="mb-3">
            <Alert tone="danger" title="Could not send overdue reminders">
              {bulkError}
            </Alert>
          </div>
        ) : null}
        {overdue.isPending ? <Skeleton size="lg" /> : null}
        {overdue.isError ? (
          <Alert tone="danger" title="Unable to load overdue loans">
            {toUserMessage(overdue.error)}
          </Alert>
        ) : null}
        {overdue.data && overdue.data.items.length === 0 ? (
          <StaffEmptyState
            title="No overdue loans"
            description="Everything is currently on schedule."
          />
        ) : null}
        {overdue.data && overdue.data.items.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {overdue.data.items.map((loan: OverdueLoan) => (
              <StaffLoanRow
                key={loan.id}
                loan={loan}
                overdueDays={loan.daysLate}
                fineLabel={
                  loan.fineAmountCents != null
                    ? formatMoneyInr(loan.fineAmountCents)
                    : null
                }
                sending={sendNotice.isPending && sendNotice.variables === loan.id}
                sendError={
                  sendNotice.isError && sendNotice.variables === loan.id
                    ? toUserMessage(sendNotice.error)
                    : null
                }
                onSendReminder={() => {
                  if (isOverdueNoticeCoolingDown(loan.overdueNotifiedAt)) return;
                  void sendNotice.mutateAsync(loan.id).catch(() => undefined);
                }}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
