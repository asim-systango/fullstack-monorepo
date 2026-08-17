'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  Field,
  Form,
  Select,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError, type Balances } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { Avatar } from './avatar';
import { PaginationBar } from './pagination-bar';
import { personalBalanceSummary } from './who-owes-preview';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';
import { centsToInput, parseMoneyToCents } from '@/lib/split';

type BalanceTab = 'all' | 'you_owe' | 'owed_to_you';

const DEBT_PAGE_SIZE = 8;
const SETTLEMENT_PAGE_SIZE = 8;

function netBalanceClass(netCents: number) {
  if (netCents > 0) return 'font-semibold tabular-nums text-success';
  if (netCents < 0) return 'font-semibold tabular-nums text-destructive';
  return 'font-semibold tabular-nums text-muted-foreground';
}

function outstandingCap(payerNet: number, payeeNet: number) {
  const debtor = payerNet < 0 ? -payerNet : 0;
  const creditor = payeeNet > 0 ? payeeNet : 0;
  return Math.max(0, Math.min(debtor, creditor));
}

function formatNetBalance(netCents: number, currency: string) {
  if (netCents === 0) return 'settled';
  if (netCents > 0) return `+${formatMoney(netCents, currency)}`;
  return `−${formatMoney(-netCents, currency)}`;
}

type DebtTone = 'owe' | 'owed' | 'other';

function debtPerspective(
  debt: Balances['debts'][number],
  currentUserId?: string,
): {
  title: string;
  counterpartName: string;
  tone: DebtTone;
} {
  if (currentUserId && debt.fromUserId === currentUserId) {
    return {
      title: `You owe ${debt.toName}`,
      counterpartName: debt.toName,
      tone: 'owe',
    };
  }
  if (currentUserId && debt.toUserId === currentUserId) {
    return {
      title: `${debt.fromName} owes you`,
      counterpartName: debt.fromName,
      tone: 'owed',
    };
  }
  return {
    title: `${debt.fromName} owes ${debt.toName}`,
    counterpartName: debt.fromName,
    tone: 'other',
  };
}

function summaryNetClass(net: number): string {
  if (net > 0) return 'mt-1 text-xl font-bold tabular-nums text-success';
  if (net < 0) return 'mt-1 text-xl font-bold tabular-nums text-destructive';
  return 'mt-1 text-xl font-bold tabular-nums text-muted-foreground';
}

function formatSignedNet(net: number, currency: string): string {
  if (net === 0) return formatMoney(0, currency);
  const sign = net > 0 ? '+' : '−';
  return `${sign}${formatMoney(Math.abs(net), currency)}`;
}

function toneHintClass(tone: DebtTone): string {
  if (tone === 'owe') return 'text-xs text-destructive';
  if (tone === 'owed') return 'text-xs text-success';
  return 'text-xs text-muted-foreground';
}

function toneHint(tone: DebtTone): string {
  if (tone === 'owe') return 'You need to pay';
  if (tone === 'owed') return 'They need to pay you';
  return 'Between other members';
}

function toneAmountClass(tone: DebtTone): string {
  if (tone === 'owe') return 'text-lg font-bold tabular-nums text-destructive';
  if (tone === 'owed') return 'text-lg font-bold tabular-nums text-success';
  return 'text-lg font-bold tabular-nums text-primary';
}

function settlementEmptyCopy(hasAny: boolean): { title: string; description: string } {
  if (hasAny) {
    return {
      title: 'No matching settlements',
      description:
        'Try a different search, or clear the search box to see all settlements.',
    };
  }
  return {
    title: 'No settlements yet',
    description:
      'When someone settles up in this group, those payments will show up here.',
  };
}

export type GroupBalancesViewProps = Readonly<{
  groupId: string;
  showBackLink?: boolean;
}>;

export function GroupBalancesView({
  groupId,
  showBackLink = true,
}: GroupBalancesViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [settle, setSettle] = useState<{
    payerUserId: string;
    payeeUserId: string;
    maxCents: number;
  } | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BalanceTab>('all');
  const [memberFilter, setMemberFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debtPage, setDebtPage] = useState(1);
  const [settlementPage, setSettlementPage] = useState(1);
  const [settlementSearch, setSettlementSearch] = useState('');

  useEffect(() => {
    setSettle(null);
    setTab('all');
    setMemberFilter('');
    setSearch('');
    setDebtPage(1);
    setSettlementPage(1);
    setSettlementSearch('');
    setError(null);
  }, [groupId]);

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => splitterApi.getGroup(groupId),
    enabled: Boolean(groupId),
  });

  const balancesQuery = useQuery({
    queryKey: ['balances', groupId],
    queryFn: () => splitterApi.getBalances(groupId),
    enabled: Boolean(groupId),
  });

  const settlementsQuery = useQuery({
    queryKey: ['settlements', groupId],
    queryFn: () => splitterApi.listSettlements(groupId),
    enabled: Boolean(groupId),
  });

  const settleMutation = useMutation({
    mutationFn: () => {
      if (!settle) throw new Error('No settlement selected');
      const cents = parseMoneyToCents(amount);
      if (cents == null || cents < 1) {
        throw new Error('Amount must be at least 1 cent');
      }
      return splitterApi.createSettlement(groupId, {
        payerUserId: settle.payerUserId,
        payeeUserId: settle.payeeUserId,
        amountCents: cents,
        note: note.trim() || undefined,
      });
    },
    onSuccess: () => {
      setSettle(null);
      setNote('');
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['settlements', 'all'] });
      void queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : 'Could not record settlement',
      );
    },
  });

  const filteredDebts = useMemo(() => {
    const balances = balancesQuery.data;
    if (!balances) return [];
    const q = search.trim().toLowerCase();
    return balances.debts.filter((debt) => {
      const view = debtPerspective(debt, user?.id);
      if (tab === 'you_owe' && view.tone !== 'owe') return false;
      if (tab === 'owed_to_you' && view.tone !== 'owed') return false;
      if (memberFilter) {
        if (debt.fromUserId !== memberFilter && debt.toUserId !== memberFilter)
          return false;
      }
      if (q) {
        const hay = `${debt.fromName} ${debt.toName} ${view.title}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [balancesQuery.data, tab, memberFilter, search, user?.id]);

  const debtTotalPages = Math.max(1, Math.ceil(filteredDebts.length / DEBT_PAGE_SIZE));
  const safeDebtPage = Math.min(debtPage, debtTotalPages);
  const pagedDebts = filteredDebts.slice(
    (safeDebtPage - 1) * DEBT_PAGE_SIZE,
    safeDebtPage * DEBT_PAGE_SIZE,
  );

  const filteredSettlements = useMemo(() => {
    const rows = settlementsQuery.data ?? [];
    const q = settlementSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const hay = `${row.payer.name} ${row.payee.name} ${row.note ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [settlementsQuery.data, settlementSearch]);

  const settlementTotalPages = Math.max(
    1,
    Math.ceil(filteredSettlements.length / SETTLEMENT_PAGE_SIZE),
  );
  const safeSettlementPage = Math.min(settlementPage, settlementTotalPages);
  const pagedSettlements = filteredSettlements.slice(
    (safeSettlementPage - 1) * SETTLEMENT_PAGE_SIZE,
    safeSettlementPage * SETTLEMENT_PAGE_SIZE,
  );

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
  const group = groupQuery.data;
  const groupName = group?.name ?? 'Group';
  const blocked = group?.blocked ?? false;
  const isMember = group?.myRole != null;
  const canSettle = isMember && !blocked;
  const summary = personalBalanceSummary(balancesQuery.data, user?.id);
  const settlementEmpty = settlementEmptyCopy(Boolean(settlementsQuery.data?.length));

  function openSettle(payerUserId: string, payeeUserId: string, maxCents: number) {
    setError(null);
    setSettle({ payerUserId, payeeUserId, maxCents });
    setAmount(centsToInput(maxCents));
    setNote('');
  }

  const amountCents = parseMoneyToCents(amount);
  const overCap = settle != null && amountCents != null && amountCents > settle.maxCents;

  function resetDebtFilters() {
    setTab('all');
    setMemberFilter('');
    setSearch('');
    setDebtPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        {showBackLink ? (
          <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground">
            ← Back to {groupName}
          </Link>
        ) : null}
        <h2 className={`text-2xl font-bold ${showBackLink ? 'mt-2' : ''}`}>Balances</h2>
        <p className="text-sm text-muted-foreground">
          Who owes whom in {groupName}. Amounts are simplified so each person settles with
          as few people as possible.
        </p>
      </div>

      {user?.id ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="splitter-shadow">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              You are owed
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-success">
              {formatMoney(summary.youAreOwed, currency)}
            </p>
          </Card>
          <Card className="splitter-shadow">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              You owe
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-destructive">
              {formatMoney(summary.youOwe, currency)}
            </p>
          </Card>
          <Card className="splitter-shadow">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Net balance
            </p>
            <p className={summaryNetClass(summary.net)}>
              {formatSignedNet(summary.net, currency)}
            </p>
          </Card>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-lg font-semibold">Balances</h3>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['you_owe', 'You owe'],
                ['owed_to_you', 'Owed to you'],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={tab === value ? 'primary' : 'secondary'}
                onClick={() => {
                  setTab(value);
                  setDebtPage(1);
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            aria-label="Search balances"
            placeholder="Search member…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setDebtPage(1);
            }}
          />
          <Select
            aria-label="Filter by member"
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setDebtPage(1);
            }}
          >
            <option value="">All members</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
                {m.userId === user?.id ? ' (you)' : ''}
              </option>
            ))}
          </Select>
        </div>

        {allClear ? (
          <Card className="splitter-shadow py-10 text-center">
            <p className="text-lg font-semibold text-success">All settled up</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No outstanding balances in this group.
            </p>
          </Card>
        ) : null}

        {!allClear && filteredDebts.length === 0 ? (
          <Card className="splitter-shadow py-8 text-center">
            <p className="text-sm font-medium">No balances match these filters</p>
            <Button
              className="mt-3"
              size="sm"
              variant="secondary"
              onClick={resetDebtFilters}
            >
              Reset filters
            </Button>
          </Card>
        ) : null}

        {!allClear && filteredDebts.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
            <ul className="divide-y divide-border">
              {pagedDebts.map((debt) => {
                const view = debtPerspective(debt, user?.id);
                return (
                  <li
                    key={`${debt.fromUserId}-${debt.toUserId}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={view.counterpartName} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{view.title}</p>
                        <p className={toneHintClass(view.tone)}>{toneHint(view.tone)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={toneAmountClass(view.tone)}>
                        {formatMoney(debt.amountCents, currency)}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!canSettle}
                        title={blocked ? 'This group is blocked' : undefined}
                        onClick={() =>
                          openSettle(debt.fromUserId, debt.toUserId, debt.amountCents)
                        }
                      >
                        Settle
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="px-4 pb-3">
              <PaginationBar
                page={safeDebtPage}
                totalPages={debtTotalPages}
                total={filteredDebts.length}
                limit={DEBT_PAGE_SIZE}
                label="balances"
                onPageChange={setDebtPage}
              />
            </div>
          </div>
        ) : null}

        {!allClear && debts.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Showing simplified balances ({debts.length} open{' '}
            {debts.length === 1 ? 'relationship' : 'relationships'}).
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Net balances</h3>
        <ul className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <Avatar name={m.name} size="sm" />
                {m.name}
                {m.userId === user?.id ? (
                  <span className="text-muted-foreground">(you)</span>
                ) : null}
              </span>
              <span className={netBalanceClass(m.netCents)}>
                {formatNetBalance(m.netCents, currency)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-lg font-semibold">Settlement history</h3>
          <TextInput
            aria-label="Search settlements"
            placeholder="Search settlements…"
            value={settlementSearch}
            onChange={(e) => {
              setSettlementSearch(e.target.value);
              setSettlementPage(1);
            }}
            className="w-full max-w-xs"
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card splitter-shadow">
          {settlementsQuery.isLoading ? (
            <div className="space-y-2 p-4" aria-hidden>
              <Skeleton size="md" className="h-10 rounded-md" />
              <Skeleton size="md" className="h-10 rounded-md" />
              <Skeleton size="md" className="h-10 rounded-md" />
            </div>
          ) : null}

          {!settlementsQuery.isLoading && filteredSettlements.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-foreground">
                {settlementEmpty.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {settlementEmpty.description}
              </p>
              {settlementsQuery.data?.length ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-4"
                  onClick={() => {
                    setSettlementSearch('');
                    setSettlementPage(1);
                  }}
                >
                  Clear search
                </Button>
              ) : null}
            </div>
          ) : null}

          {!settlementsQuery.isLoading && filteredSettlements.length > 0 ? (
            <>
              <ul className="divide-y divide-border">
                {pagedSettlements.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">{row.payer.name}</span>
                      <span className="text-muted-foreground"> paid </span>
                      <span className="font-medium">{row.payee.name}</span>
                      {row.note ? (
                        <span className="text-muted-foreground"> · {row.note}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatMoney(row.amountCents, currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="px-4 pb-3">
                <PaginationBar
                  page={safeSettlementPage}
                  totalPages={settlementTotalPages}
                  total={filteredSettlements.length}
                  limit={SETTLEMENT_PAGE_SIZE}
                  label="settlements"
                  onPageChange={setSettlementPage}
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      <Dialog open={settle != null} onOpenChange={(open) => !open && setSettle(null)}>
        <DialogHeader>
          <DialogTitle>Settle up</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {settle ? (
            <Form
              pending={settleMutation.isPending}
              onSubmit={(e) => {
                e.preventDefault();
                if (overCap) return;
                settleMutation.mutate();
              }}
              className="space-y-4"
            >
              <Field label="Payer" htmlFor="settle-payer">
                <Select
                  id="settle-payer"
                  value={settle.payerUserId}
                  onChange={(e) => {
                    const payerUserId = e.target.value;
                    const payer = members.find((m) => m.userId === payerUserId);
                    const payee = members.find((m) => m.userId === settle.payeeUserId);
                    const max =
                      payer && payee ? outstandingCap(payer.netCents, payee.netCents) : 0;
                    setSettle({ ...settle, payerUserId, maxCents: max });
                    setAmount(centsToInput(max));
                  }}
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                      {m.userId === user?.id ? ' (you)' : ''}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Payee" htmlFor="settle-payee">
                <Select
                  id="settle-payee"
                  value={settle.payeeUserId}
                  onChange={(e) => {
                    const payeeUserId = e.target.value;
                    const payer = members.find((m) => m.userId === settle.payerUserId);
                    const payee = members.find((m) => m.userId === payeeUserId);
                    const max =
                      payer && payee ? outstandingCap(payer.netCents, payee.netCents) : 0;
                    setSettle({ ...settle, payeeUserId, maxCents: max });
                    setAmount(centsToInput(max));
                  }}
                >
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount" htmlFor="settle-amount" required>
                <TextInput
                  id="settle-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Field>
              <p className="text-sm text-muted-foreground">
                Outstanding between this pair: {formatMoney(settle.maxCents, currency)}
              </p>
              {overCap ? (
                <StatusMessage tone="error">
                  Amount exceeds outstanding balance.
                </StatusMessage>
              ) : null}
              <Field label="Note" htmlFor="settle-note">
                <TextInput
                  id="settle-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional"
                />
              </Field>
              {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={settleMutation.isPending}
                  disabled={overCap || amountCents == null || amountCents < 1}
                >
                  Record settlement
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSettle(null)}>
                  Cancel
                </Button>
              </div>
            </Form>
          ) : null}
        </DialogBody>
      </Dialog>
    </div>
  );
}
