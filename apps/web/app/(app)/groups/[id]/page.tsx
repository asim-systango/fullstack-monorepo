'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Skeleton,
  StatusMessage,
} from '@shared/ui/components';
import { Avatar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => splitterApi.getGroup(groupId),
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => splitterApi.listExpenses(groupId),
    enabled: Boolean(groupId),
  });

  const balancesQuery = useQuery({
    queryKey: ['balances', groupId],
    queryFn: () => splitterApi.getBalances(groupId),
    enabled: Boolean(groupId),
  });

  if (groupQuery.isLoading) {
    return (
      <div className="space-y-4" aria-hidden>
        <Skeleton size="lg" className="h-24 rounded-lg" />
        <Skeleton size="lg" className="h-40 rounded-lg" />
      </div>
    );
  }

  if (groupQuery.isError || !groupQuery.data) {
    return <StatusMessage tone="error">Group not found or access denied.</StatusMessage>;
  }

  const group = groupQuery.data;

  function renderBalanceSummary() {
    if (balancesQuery.isLoading)
      return <Skeleton size="md" className="h-24 rounded-lg" />;
    if (!balancesQuery.data) return null;
    if (balancesQuery.data.allClear) {
      return (
        <Card className="border-success/30 bg-secondary/40 splitter-shadow">
          <p className="text-sm font-semibold text-success">All settled up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No one in this group currently owes anyone else.
          </p>
        </Card>
      );
    }
    return (
      <Card className="splitter-shadow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Who owes whom</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {balancesQuery.data.debts.slice(0, 3).map((d) => (
                <li
                  key={`${d.fromUserId}-${d.toUserId}`}
                  className="text-muted-foreground"
                >
                  <span className="font-medium text-foreground">{d.fromName}</span> owes{' '}
                  <span className="font-medium text-foreground">{d.toName}</span>{' '}
                  {formatMoney(d.amountCents, group.currency)}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/groups/${groupId}/balances`}
            className="shrink-0 text-sm font-medium"
          >
            See all
          </Link>
        </div>
      </Card>
    );
  }

  function renderExpenses() {
    if (expensesQuery.isLoading) {
      return <Skeleton size="lg" className="h-32 rounded-lg" />;
    }
    if (!expensesQuery.data?.length) {
      return (
        <EmptyState
          title="No expenses yet"
          description="When someone adds an expense, it will appear in this list with who paid."
        />
      );
    }
    return (
      <ul className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
        {expensesQuery.data.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={expense.payer.name} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium">{expense.description}</p>
                <p className="text-xs text-muted-foreground">
                  {expense.payer.name} paid ·{' '}
                  {new Date(expense.expenseDate).toLocaleDateString()}
                  {expense.category ? ` · ${expense.category}` : ''}
                </p>
              </div>
            </div>
            <p className="shrink-0 font-semibold tabular-nums">
              {formatMoney(expense.amountCents, group.currency)}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/groups" className="text-sm text-muted-foreground">
            ← Groups
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={group.name} size="lg" />
            <div>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              <p className="text-sm text-muted-foreground">
                {group.currency} · {group.members.length} members
                {group.blocked ? (
                  <>
                    {' '}
                    · <Badge tone="danger">Blocked</Badge>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/groups/${groupId}/balances`}>
          <Button variant="secondary">Settle up</Button>
        </Link>
      </div>

      {renderBalanceSummary()}

      <section>
        <h3 className="mb-3 text-lg font-semibold">Expenses</h3>
        {renderExpenses()}
      </section>

      <section>
        <h3 className="mb-3 text-lg font-semibold">Members</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {group.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Avatar name={member.name} size="sm" />
                <span className="truncate font-medium">{member.name}</span>
              </span>
              <Badge tone={member.role === 'admin' ? 'accent' : 'neutral'}>
                {member.role}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
