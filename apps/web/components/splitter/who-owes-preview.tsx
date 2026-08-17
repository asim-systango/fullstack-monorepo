'use client';

import Link from 'next/link';
import type { Balances } from '@shared/api-client';
import { Button, Card, Skeleton } from '@shared/ui/components';
import { Avatar } from './avatar';
import { formatMoney } from '@/lib/format-money';

type WhoOwesPreviewProps = Readonly<{
  groupId: string;
  balances: Balances | undefined;
  isLoading: boolean;
  currentUserId?: string;
  currency: string;
}>;

type DebtTone = 'owe' | 'owed' | 'other';

function debtLabel(
  debt: Balances['debts'][number],
  currentUserId: string | undefined,
): { primary: string; tone: DebtTone; avatarName: string } {
  if (currentUserId && debt.fromUserId === currentUserId) {
    return { primary: `You owe ${debt.toName}`, tone: 'owe', avatarName: debt.toName };
  }
  if (currentUserId && debt.toUserId === currentUserId) {
    return {
      primary: `${debt.fromName} owes you`,
      tone: 'owed',
      avatarName: debt.fromName,
    };
  }
  return {
    primary: `${debt.fromName} owes ${debt.toName}`,
    tone: 'other',
    avatarName: debt.fromName,
  };
}

function amountToneClass(tone: DebtTone): string {
  if (tone === 'owe') return 'text-destructive';
  if (tone === 'owed') return 'text-success';
  return 'text-foreground';
}

function netClass(net: number): string {
  if (net > 0) return 'text-sm font-semibold tabular-nums text-success';
  if (net < 0) return 'text-sm font-semibold tabular-nums text-destructive';
  return 'text-sm font-semibold tabular-nums text-muted-foreground';
}

function formatSignedNet(net: number, currency: string): string {
  if (net === 0) return formatMoney(0, currency);
  const sign = net > 0 ? '+' : '−';
  return `${sign}${formatMoney(Math.abs(net), currency)}`;
}

export function personalBalanceSummary(balances: Balances, currentUserId?: string) {
  if (!currentUserId) {
    return { youOwe: 0, youAreOwed: 0, net: 0 };
  }
  let youOwe = 0;
  let youAreOwed = 0;
  for (const d of balances.debts) {
    if (d.fromUserId === currentUserId) youOwe += d.amountCents;
    if (d.toUserId === currentUserId) youAreOwed += d.amountCents;
  }
  return { youOwe, youAreOwed, net: youAreOwed - youOwe };
}

export function WhoOwesPreview({
  groupId,
  balances,
  isLoading,
  currentUserId,
  currency,
}: WhoOwesPreviewProps) {
  if (isLoading) return <Skeleton size="md" className="h-28 rounded-lg" />;
  if (!balances) return null;

  if (balances.allClear) {
    return (
      <Card className="border-success/30 bg-secondary/40 splitter-shadow">
        <p className="text-sm font-semibold text-success">All settled up</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No one in this group currently owes anyone else.
        </p>
      </Card>
    );
  }

  const summary = personalBalanceSummary(balances, currentUserId);
  const preview = balances.debts.slice(0, 3);
  const extraCount = balances.debts.length - 3;

  return (
    <Card className="splitter-shadow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">Balances</p>
            <Link
              href={`/groups/${groupId}/balances`}
              className="text-sm font-medium text-primary no-underline hover:underline"
            >
              See all
            </Link>
          </div>

          {currentUserId ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">You are owed</p>
                <p className="text-sm font-semibold tabular-nums text-success">
                  {formatMoney(summary.youAreOwed, currency)}
                </p>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">You owe</p>
                <p className="text-sm font-semibold tabular-nums text-destructive">
                  {formatMoney(summary.youOwe, currency)}
                </p>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Net</p>
                <p className={netClass(summary.net)}>
                  {formatSignedNet(summary.net, currency)}
                </p>
              </div>
            </div>
          ) : null}

          <ul className="mt-3 space-y-2">
            {preview.map((d) => {
              const label = debtLabel(d, currentUserId);
              return (
                <li
                  key={`${d.fromUserId}-${d.toUserId}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={label.avatarName} size="sm" />
                    <span className="truncate font-medium">{label.primary}</span>
                  </span>
                  <span
                    className={`shrink-0 font-semibold tabular-nums ${amountToneClass(label.tone)}`}
                  >
                    {formatMoney(d.amountCents, currency)}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-2 text-xs text-muted-foreground">
            {extraCount > 0
              ? `+${extraCount} more · simplified group balances`
              : 'Simplified so each person settles with as few people as possible.'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Link href={`/groups/${groupId}/balances`}>
          <Button size="sm" variant="secondary">
            Settle up
          </Button>
        </Link>
      </div>
    </Card>
  );
}
