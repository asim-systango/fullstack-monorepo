'use client';

import { useMemo, useState } from 'react';
import type { FineWithLoan, MemberListItem } from '@shared/types';
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  TextArea,
} from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { usePayFine, useWaiveFine } from '@/lib/bookly';
import { formatMoneyInr, formatShortDate } from '@/lib/member/format';

function memberLabel(
  userId: string,
  membersByUserId: Map<string, MemberListItem>,
): string {
  const member = membersByUserId.get(userId);
  return member?.fullName ?? `Member ${userId.slice(0, 8)}`;
}

function statusChipClass(status: FineWithLoan['status']): string {
  if (status === 'unpaid') return 'admin-status-unpaid';
  if (status === 'paid') return 'admin-status-paid';
  return 'admin-status-waived';
}

export function AdminFineRow({
  fine,
  membersByUserId,
}: Readonly<{
  fine: FineWithLoan;
  membersByUserId: Map<string, MemberListItem>;
}>) {
  const pay = usePayFine();
  const waive = useWaiveFine();
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const unpaid = fine.status === 'unpaid';
  const pending = pay.isPending || waive.isPending;
  const bookTitle = fine.loan?.book?.title;

  async function onPay() {
    setError(null);
    try {
      await pay.mutateAsync(fine.id);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  async function onWaive() {
    setError(null);
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('A reason is required to waive a fine.');
      return;
    }
    try {
      await waive.mutateAsync({ id: fine.id, input: { reason: trimmed } });
      setWaiveOpen(false);
      setReason('');
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <li className="admin-row">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
          {memberLabel(fine.userId, membersByUserId)}
        </p>
        <p className="m-0 truncate text-sm text-[color:var(--bookly-muted)]">
          {bookTitle ?? 'Loan'} · {formatMoneyInr(fine.amountCents)}
        </p>
        <p className="m-0 mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[color:var(--bookly-muted)]">
          <span className={`admin-status-chip ${statusChipClass(fine.status)}`}>
            {fine.status}
          </span>
          <span>
            {fine.daysOverdue} day{fine.daysOverdue === 1 ? '' : 's'} overdue ·{' '}
            {formatShortDate(fine.createdAt)}
          </span>
        </p>
        {error && !waiveOpen ? (
          <Alert tone="danger" title="Could not update fine" className="mt-2">
            {error}
          </Alert>
        ) : null}
      </div>
      {unpaid ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={pending}
            onClick={() => void onPay()}
          >
            {pay.isPending ? 'Marking…' : 'Mark paid'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              setReason('');
              setWaiveOpen(true);
            }}
          >
            Waive
          </Button>
        </div>
      ) : null}

      <Dialog
        open={waiveOpen}
        onOpenChange={(open) => {
          setWaiveOpen(open);
          if (!open) {
            setReason('');
            setError(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Waive fine</DialogTitle>
          <DialogDescription>
            Provide a reason for waiving {formatMoneyInr(fine.amountCents)}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor={`waive-reason-${fine.id}`}
          >
            Reason
          </label>
          <TextArea
            id={`waive-reason-${fine.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Why is this fine being waived?"
            disabled={waive.isPending}
          />
          {error ? (
            <Alert tone="danger" title="Could not waive fine" className="mt-3">
              {error}
            </Alert>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            disabled={waive.isPending}
            onClick={() => setWaiveOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={waive.isPending || !reason.trim()}
            onClick={() => void onWaive()}
          >
            {waive.isPending ? 'Waiving…' : 'Waive fine'}
          </Button>
        </DialogFooter>
      </Dialog>
    </li>
  );
}

export function useMemberNameMap(members: MemberListItem[] | undefined) {
  return useMemo(() => {
    const map = new Map<string, MemberListItem>();
    for (const member of members ?? []) {
      map.set(member.userId, member);
    }
    return map;
  }, [members]);
}
