import { OVERDUE_NOTICE_COOLDOWN_MS, type LoanWithRelations } from '@shared/types';
import { Button } from '@shared/ui/components';
import { BookCover } from '@/components/member';
import { formatDateTime, formatDueDate } from '@/lib/member/format';

export function isOverdueNoticeCoolingDown(
  notifiedAt: string | null | undefined,
): boolean {
  if (!notifiedAt) return false;
  const at = new Date(notifiedAt).getTime();
  if (Number.isNaN(at)) return false;
  return Date.now() - at < OVERDUE_NOTICE_COOLDOWN_MS;
}

export function StaffLoanRow({
  loan,
  overdueDays,
  fineLabel,
  onSendReminder,
  sending,
  sendError,
}: Readonly<{
  loan: LoanWithRelations;
  overdueDays?: number;
  fineLabel?: string | null;
  onSendReminder?: () => void;
  sending?: boolean;
  sendError?: string | null;
}>) {
  const isOverdue = typeof overdueDays === 'number' && overdueDays > 0;
  const lastEmailedAt = loan.overdueNotifiedAt ?? null;
  const coolingDown = isOverdueNoticeCoolingDown(lastEmailedAt);

  return (
    <li className="staff-loan-row">
      <BookCover title={loan.book.title} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium text-[color:var(--bookly-navy)]">
          {loan.book.title}
        </p>
        {loan.member?.fullName ? (
          <p className="m-0 truncate text-sm text-[color:var(--bookly-navy)]">
            {loan.member.fullName}
          </p>
        ) : null}
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {loan.book.author} · {loan.bookCopy.barcode}
        </p>
        <p className="m-0 mt-1 text-xs text-[color:var(--bookly-muted)]">
          Due {formatDueDate(loan.dueDate)}
          {fineLabel ? ` · ${fineLabel}` : ''}
        </p>
        {onSendReminder ? (
          <p className="m-0 mt-1 text-xs text-[color:var(--bookly-muted)]">
            {lastEmailedAt
              ? `Last emailed ${formatDateTime(lastEmailedAt)}`
              : 'Not emailed yet'}
          </p>
        ) : null}
        {sendError ? (
          <p className="m-0 mt-1 text-xs text-[color:var(--staff-warn)]">{sendError}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          className={`staff-status-chip ${
            isOverdue ? 'staff-status-overdue' : 'staff-status-active'
          }`}
        >
          {isOverdue ? `Overdue · ${overdueDays}d` : 'Active'}
        </span>
        {onSendReminder ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            loading={sending}
            disabled={coolingDown}
            onClick={onSendReminder}
          >
            {coolingDown ? 'Sent' : 'Send reminder'}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
