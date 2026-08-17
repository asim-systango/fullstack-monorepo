'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  EmptyState,
  Form,
  Select,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { Avatar, PaginationBar } from '@/components/splitter';
import { IconChevronRight } from '@/components/splitter/icons';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';

function formatAmountNumber(cents: number): string {
  return (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatSettledAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Card className="splitter-stat-card border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </Card>
  );
}

function SettlementsSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton size="lg" className="h-20 rounded-xl" />
        <Skeleton size="lg" className="h-20 rounded-xl" />
      </div>
      <Skeleton size="lg" className="h-24 rounded-xl" />
      <Skeleton size="lg" className="h-40 rounded-xl" />
    </div>
  );
}

export default function SettlementsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [draftQ, setDraftQ] = useState('');
  const [draftGroupId, setDraftGroupId] = useState('');
  const [q, setQ] = useState('');
  const [groupId, setGroupId] = useState('');

  const hasFilters = Boolean(q || groupId);

  const query = useQuery({
    queryKey: ['settlements', 'all', { page, limit, q, groupId }],
    queryFn: () =>
      splitterApi.listAllSettlements({ page, limit, q, groupId: groupId || undefined }),
  });

  function applyFilters(event?: { preventDefault(): void }) {
    event?.preventDefault();
    setQ(draftQ.trim());
    setGroupId(draftGroupId);
    setPage(1);
  }

  function resetFilters() {
    setDraftQ('');
    setDraftGroupId('');
    setQ('');
    setGroupId('');
    setPage(1);
  }

  if (query.isLoading) {
    return <SettlementsSkeleton />;
  }

  if (query.isError) {
    return (
      <StatusMessage tone="error">
        Could not load settlements.{' '}
        <button type="button" className="underline" onClick={() => void query.refetch()}>
          Retry
        </button>
      </StatusMessage>
    );
  }

  const data = query.data;
  const groupOptions = data?.groupOptions ?? [];

  return (
    <div className="splitter-page-section">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settlements</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment history across all your groups.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Total settlements"
          value={(data?.stats.totalSettlements ?? 0).toLocaleString()}
        />
        <StatCard
          label="Total settled"
          value={formatAmountNumber(data?.stats.totalAmountCents ?? 0)}
        />
      </div>

      <Form
        className="rounded-xl border border-border bg-card px-4 py-4 splitter-shadow"
        onSubmit={applyFilters}
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-[12rem] flex-1 gap-1.5 text-sm">
            <span className="font-medium text-foreground">Search</span>
            <TextInput
              aria-label="Search settlements"
              placeholder="Group, member, or note…"
              value={draftQ}
              onChange={(e) => setDraftQ(e.target.value)}
            />
          </label>
          <label className="grid w-auto shrink-0 gap-1.5 text-sm">
            <span className="font-medium text-foreground">Group</span>
            <Select
              aria-label="Filter by group"
              className="splitter-select-compact"
              value={draftGroupId}
              onChange={(e) => setDraftGroupId(e.target.value)}
            >
              <option value="">All groups</option>
              {groupOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </label>
          <div className="mb-0 w-auto shrink-0">
            <span className="ui-field-label invisible select-none" aria-hidden>
              Apply
            </span>
            <div className="flex items-stretch gap-2">
              <Button type="submit">Apply</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetFilters}
                disabled={!hasFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Form>

      {!data || data.total === 0 ? (
        <Card className="splitter-shadow px-4 py-10 text-center">
          <EmptyState
            title={hasFilters ? 'No matching settlements' : 'No settlements yet'}
            description={
              hasFilters
                ? 'Try adjusting your search or group filter.'
                : 'When someone settles up in a group, those payments will appear here.'
            }
            action={
              hasFilters ? (
                <Button type="button" variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : (
                <Link href="/groups" className="no-underline hover:no-underline">
                  <Button type="button">Go to groups</Button>
                </Link>
              )
            }
          />
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card splitter-shadow">
          <ul className="divide-y divide-border">
            {data.items.map((row) => (
              <li key={row.id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <Avatar name={row.payer.name} size="sm" className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span>{row.payer.name}</span>
                        <span className="text-muted-foreground"> paid </span>
                        <span>{row.payee.name}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.groupName} · {formatSettledAt(row.settledAt)}
                        {row.note ? ` · ${row.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-base font-bold tabular-nums text-foreground">
                      {formatMoney(row.amountCents, row.groupCurrency)}
                    </span>
                    <Link
                      href={`/groups/${row.groupId}/balances`}
                      className="splitter-open-group shrink-0"
                    >
                      View
                      <IconChevronRight />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-4 py-3">
            <PaginationBar
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              limit={data.limit}
              label={data.total === 1 ? 'settlement' : 'settlements'}
              onPageChange={setPage}
              onLimitChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
