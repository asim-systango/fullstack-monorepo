'use client';

import type { LoanWithRelations, MemberListItem, OverdueLoan } from '@shared/types';
import { formatDueDate, formatMoneyInr } from '@/lib/member/format';

function memberLabel(
  userId: string,
  membersByUserId: Map<string, MemberListItem>,
): string {
  const member = membersByUserId.get(userId);
  return member?.fullName ?? `Member ${userId.slice(0, 8)}`;
}

export function AdminLoanRow({
  loan,
  membersByUserId,
  overdueDays,
  fineAmountCents,
}: Readonly<{
  loan: LoanWithRelations;
  membersByUserId: Map<string, MemberListItem>;
  overdueDays?: number;
  fineAmountCents?: number | null;
}>) {
  const isOverdue = typeof overdueDays === 'number' && overdueDays > 0;
  let fineLabel: string | null = null;
  if (typeof fineAmountCents === 'number') {
    fineLabel = formatMoneyInr(fineAmountCents);
  } else if (loan.fine) {
    fineLabel = `${formatMoneyInr(loan.fine.amountCents)} (${loan.fine.status})`;
  }

  return (
    <li className="admin-row">
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate font-medium text-[color:var(--bookly-navy)]">
          {loan.book.title}
        </p>
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {memberLabel(loan.userId, membersByUserId)} · {loan.bookCopy.barcode}
        </p>
        <p className="m-0 mt-1 text-xs text-[color:var(--bookly-muted)]">
          Checked out {formatDueDate(loan.borrowedAt)} · Due {formatDueDate(loan.dueDate)}
          {fineLabel ? ` · Fine ${fineLabel}` : ''}
        </p>
      </div>
      <span
        className={`admin-status-chip shrink-0 ${
          isOverdue ? 'admin-status-overdue' : 'admin-status-active'
        }`}
      >
        {isOverdue ? `Overdue · ${overdueDays}d` : 'Active'}
      </span>
    </li>
  );
}

export function AdminOverdueLoanRow({
  loan,
  membersByUserId,
}: Readonly<{
  loan: OverdueLoan;
  membersByUserId: Map<string, MemberListItem>;
}>) {
  return (
    <AdminLoanRow
      loan={loan}
      membersByUserId={membersByUserId}
      overdueDays={loan.daysLate}
      fineAmountCents={loan.fineAmountCents}
    />
  );
}
