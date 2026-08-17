'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge, Skeleton, StatusMessage } from '@shared/ui/components';
import { Avatar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string; expenseId: string }>();
  const groupId = params.id;
  const expenseId = params.expenseId;

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => splitterApi.getGroup(groupId),
  });

  const expenseQuery = useQuery({
    queryKey: ['expense', groupId, expenseId],
    queryFn: () => splitterApi.getExpense(groupId, expenseId),
  });

  if (expenseQuery.isLoading || groupQuery.isLoading) {
    return <Skeleton size="lg" className="h-40 rounded-lg" />;
  }

  if (expenseQuery.isError || !expenseQuery.data) {
    return (
      <div className="space-y-3">
        <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground">
          ← Back to group
        </Link>
        <StatusMessage tone="error">This expense is no longer available.</StatusMessage>
      </div>
    );
  }

  const expense = expenseQuery.data;
  const group = groupQuery.data;
  const currency = group?.currency ?? 'USD';
  const nameById = new Map((group?.members ?? []).map((m) => [m.userId, m.name]));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground">
          ← Back to {group?.name ?? 'group'}
        </Link>
        <h2 className="mt-2 text-2xl font-bold">{expense.description}</h2>
        <p className="text-sm text-muted-foreground">
          {expense.payer.name} paid {formatMoney(expense.amountCents, currency)} ·{' '}
          {new Date(expense.expenseDate).toLocaleDateString()}
        </p>
        {expense.category ? (
          <div className="mt-2">
            <Badge tone="neutral">{expense.category}</Badge>
          </div>
        ) : null}
      </div>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Shares</h3>
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {expense.shares.map((share) => (
            <li
              key={share.userId}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <Avatar name={nameById.get(share.userId) ?? 'Member'} size="sm" />
                {nameById.get(share.userId) ?? share.userId}
              </span>
              <span className="tabular-nums font-medium">
                {formatMoney(share.amountCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
