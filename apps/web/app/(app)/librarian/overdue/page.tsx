'use client';

import { Suspense, useState } from 'react';
import type { OverdueNoticeBulkResult } from '@shared/types';
import { Alert, Button, Field, TextInput } from '@shared/ui/components';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';
import { RequireRole } from '@/components/dashboard/require-role';
import {
  StaffListStatus,
  StaffLoanRow,
  StaffPageHeader,
  StaffPagination,
  isOverdueNoticeCoolingDown,
} from '@/components/staff';
import { toUserMessage } from '@/lib/auth/errors';
import { LIBRARIAN_ROLES } from '@/lib/auth/roles';
import {
  useOverdueLoans,
  useSendOverdueNotice,
  useSendOverdueNotices,
} from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { useDebouncedUrlQuery, useStaffListParams } from '@/lib/staff';

const PAGE_SIZE = 20;

function OverdueContent() {
  const { page, setPage, clear, hasFilters } = useStaffListParams();
  const search = useDebouncedUrlQuery('q');
  const overdue = useOverdueLoans({
    page,
    limit: PAGE_SIZE,
    q: search.committed || undefined,
  });
  const sendNotice = useSendOverdueNotice();
  const sendAll = useSendOverdueNotices();
  const [bulkSummary, setBulkSummary] = useState<OverdueNoticeBulkResult | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [confirmEmailAll, setConfirmEmailAll] = useState(false);

  async function onEmailAll() {
    setBulkSummary(null);
    setBulkError(null);
    try {
      const result = await sendAll.mutateAsync();
      setBulkSummary(result);
      setConfirmEmailAll(false);
    } catch (err) {
      setBulkError(toUserMessage(err));
    }
  }

  return (
    <div className="staff-content">
      <StaffPageHeader
        title="Overdue"
        description="Follow up on late loans and send reminder emails."
        actions={
          overdue.data && overdue.data.total > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              loading={sendAll.isPending}
              onClick={() => setConfirmEmailAll(true)}
            >
              Email all overdue
            </Button>
          ) : null
        }
      />

      <section className="staff-card staff-card-warn">
        <div className="staff-panel-body">
          {bulkSummary ? (
            <div className="mb-3">
              <Alert tone="success" title="Overdue reminders queued">
                Sent: {bulkSummary.sent} · Skipped: {bulkSummary.skipped} · Failed:{' '}
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

          <div className="staff-filter-row mb-4">
            <Field label="Search" htmlFor="overdue-q">
              <TextInput
                id="overdue-q"
                value={search.value}
                onChange={(e) => search.setValue(e.target.value)}
                placeholder="Member, title, or barcode…"
                autoComplete="off"
              />
            </Field>
            {hasFilters ? (
              <div className="flex items-end">
                <Button type="button" size="sm" variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>

          <StaffListStatus
            isPending={overdue.isPending}
            isError={overdue.isError}
            error={overdue.error}
            isEmpty={!overdue.data || overdue.data.items.length === 0}
            hasFilters={hasFilters}
            emptyTitle="No overdue loans"
            emptyDescription="Everything is currently on schedule."
            onRetry={() => void overdue.refetch()}
            onClearFilters={clear}
          >
            <ul className="m-0 list-none p-0">
              {overdue.data?.items.map((loan) => (
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
            <StaffPagination
              page={page}
              total={overdue.data?.total ?? 0}
              limit={PAGE_SIZE}
              onPage={setPage}
            />
          </StaffListStatus>
        </div>
      </section>
      <ConfirmDialog
        open={confirmEmailAll}
        onOpenChange={setConfirmEmailAll}
        title="Email all overdue members?"
        description="This will email all currently overdue members. Members who were emailed within the last 24 hours will be skipped."
        confirmLabel="Send emails"
        pending={sendAll.isPending}
        pendingText="Sending…"
        onConfirm={() => void onEmailAll()}
      />
    </div>
  );
}

export default function LibrarianOverduePage() {
  return (
    <RequireRole allowed={LIBRARIAN_ROLES}>
      <Suspense
        fallback={
          <div className="staff-content">
            <StaffPageHeader title="Overdue" />
          </div>
        }
      >
        <OverdueContent />
      </Suspense>
    </RequireRole>
  );
}
