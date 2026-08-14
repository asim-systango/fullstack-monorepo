'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Skeleton, StatusMessage } from '@shared/ui/components';
import { Avatar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';

function netBalanceClass(netCents: number) {
  if (netCents > 0) return 'font-semibold tabular-nums text-success';
  if (netCents < 0) return 'font-semibold tabular-nums text-destructive';
  return 'font-semibold tabular-nums text-muted-foreground';
}

function formatNetBalance(netCents: number, currency: string) {
  if (netCents === 0) return 'settled';
  if (netCents > 0) return `+${formatMoney(netCents, currency)}`;
  return `-${formatMoney(-netCents, currency)}`;
}

export default function BalancesPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => splitterApi.getGroup(groupId),
  });

  const balancesQuery = useQuery({
    queryKey: ['balances', groupId],
    queryFn: () => splitterApi.getBalances(groupId),
  });

  if (groupQuery.isLoading || balancesQuery.isLoading) {
    return (
      <div className="space-y-3" aria-hidden>
        <Skeleton size="lg" className="h-24 rounded-lg" />
        <Skeleton size="lg" className="h-24 rounded-lg" />
      </div>
    );
  }

  if (balancesQuery.isError || !balancesQuery.data) {
    return <StatusMessage tone="error">Could not load balances.</StatusMessage>;
  }

  const { currency, debts, members, allClear } = balancesQuery.data;
  const groupName = groupQuery.data?.name ?? 'Group';

  function renderDebts() {
    if (allClear) {
      return (
        <Card className="splitter-shadow py-10 text-center">
          <p className="text-lg font-semibold text-success">All settled up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No outstanding balances in this group.
          </p>
        </Card>
      );
    }
    return (
      <ul className="space-y-3">
        {debts.map((debt) => (
          <li key={`${debt.fromUserId}-${debt.toUserId}`}>
            <Card className="splitter-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar name={debt.fromName} size="sm" />
                  <span>
                    <span className="font-semibold">{debt.fromName}</span>
                    <span className="text-muted-foreground"> owes </span>
                    <span className="font-semibold">{debt.toName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tabular-nums text-primary">
                    {formatMoney(debt.amountCents, currency)}
                  </span>
                  <Button size="sm" variant="secondary" disabled title="Coming soon">
                    Settle
                  </Button>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground">
          ← Back to {groupName}
        </Link>
        <h2 className="mt-2 text-2xl font-bold">Balances</h2>
        <p className="text-sm text-muted-foreground">Who owes whom in {groupName}</p>
      </div>

      {renderDebts()}

      <section>
        <h3 className="mb-3 text-lg font-semibold">Net balances</h3>
        <ul className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <Avatar name={m.name} size="sm" />
                {m.name}
              </span>
              <span className={netBalanceClass(m.netCents)}>
                {formatNetBalance(m.netCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
