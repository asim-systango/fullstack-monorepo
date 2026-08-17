'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState, Suspense, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Form,
  Select,
  Skeleton,
  Spinner,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError, type GroupSummary } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { Avatar, PaginationBar } from '@/components/splitter';
import { initialsFromName } from '@/components/splitter/avatar';
import {
  IconArrowDown,
  IconChevronRight,
  IconGroups,
  IconPerson,
  IconWallet,
} from '@/components/splitter/icons';
import { splitterApi } from '@/lib/api';
import { formatMoney } from '@/lib/format-money';

type GroupStatusFilter =
  | 'all'
  | 'outstanding'
  | 'settled'
  | 'blocked'
  | 'owed_to_me'
  | 'i_owe'
  | 'admin'
  | 'member';
type GroupSort = 'updatedAt' | 'name' | 'balance';
type QuickChip = 'all' | 'owed_to_me' | 'i_owe';

const QUICK_CHIPS: { id: QuickChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'owed_to_me', label: 'Owed to me' },
  { id: 'i_owe', label: 'I owe' },
];

function GroupsSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Skeleton size="lg" className="h-28 rounded-xl" />
        </li>
      ))}
    </ul>
  );
}

function formatUpdated(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function groupStatus(group: GroupSummary): {
  label: string;
  tone: 'accent' | 'neutral' | 'danger';
} {
  if (group.blocked) return { label: 'Blocked', tone: 'danger' };
  if (group.myNetCents !== 0) return { label: 'Active', tone: 'accent' };
  return { label: 'Settled', tone: 'neutral' };
}

function groupStatusBadgeClass(tone: 'accent' | 'neutral' | 'danger'): string {
  if (tone === 'danger') return 'bg-destructive/10 text-destructive';
  if (tone === 'accent') return 'bg-success/10 text-success';
  return 'bg-muted text-muted-foreground';
}

function owedAmounts(group: GroupSummary) {
  return {
    youAreOwed: group.myNetCents > 0 ? group.myNetCents : 0,
    youOwe: group.myNetCents < 0 ? -group.myNetCents : 0,
  };
}

function StatCard({
  label,
  value,
  tone = 'default',
  icon,
}: Readonly<{
  label: string;
  value: string;
  tone?: 'default' | 'owed' | 'owe' | 'active';
  icon: ReactNode;
}>) {
  let valueClass = 'text-foreground';
  if (tone === 'owed') valueClass = 'text-success';
  if (tone === 'owe') valueClass = 'text-destructive';

  return (
    <div className="splitter-stat-card splitter-shadow">
      <span className="splitter-stat-icon">{icon}</span>
      <span className="min-w-0">
        <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-lg font-bold tabular-nums leading-tight ${valueClass}`}
        >
          {value}
        </p>
      </span>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={<Spinner label="Loading groups" />}>
      <GroupsPageContent />
    </Suspense>
  );
}

function GroupsPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const initialQ = searchParams.get('q')?.trim() ?? '';
  const [searchDraft, setSearchDraft] = useState(initialQ);
  const [searchApplied, setSearchApplied] = useState(initialQ);
  const [status, setStatus] = useState<GroupStatusFilter>('all');
  const [sortBy, setSortBy] = useState<GroupSort>('updatedAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const q = searchParams.get('q')?.trim() ?? '';
    setSearchDraft(q);
    setSearchApplied(q);
    setPage(1);
  }, [searchParams]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      q: searchApplied,
      status,
      sortBy,
      sortDir: 'DESC' as const,
    }),
    [page, limit, searchApplied, status, sortBy],
  );

  const groupsQuery = useQuery({
    queryKey: ['groups', listParams],
    queryFn: () => splitterApi.listGroups(listParams),
  });

  const invitesQuery = useQuery({
    queryKey: ['my-invites'],
    queryFn: () => splitterApi.listMyInvites(),
  });

  const acceptInvite = useMutation({
    mutationFn: (id: string) => splitterApi.acceptInvite(id),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      void queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      router.push(`/groups/${group.id}`);
    },
  });

  const declineInvite = useMutation({
    mutationFn: (id: string) => splitterApi.declineInvite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-invites'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: () => splitterApi.createGroup({ name, currency: 'INR' }),
    onSuccess: (group) => {
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      setCreateOpen(false);
      setName('');
      router.push(`/groups/${group.id}`);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not create group');
    },
  });

  const firstName = user?.name.split(/\s+/)[0] ?? 'there';
  const pageData = groupsQuery.data;
  const stats = pageData?.stats;
  const currency = pageData?.items[0]?.currency ?? 'INR';
  const hasFilters =
    Boolean(searchApplied.trim()) || status !== 'all' || sortBy !== 'updatedAt';

  const activeChip: QuickChip =
    status === 'owed_to_me' || status === 'i_owe' ? status : 'all';

  function applySearch() {
    setSearchApplied(searchDraft.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchDraft('');
    setSearchApplied('');
    setStatus('all');
    setSortBy('updatedAt');
    setPage(1);
    setLimit(10);
  }

  function setQuickChip(chip: QuickChip) {
    setStatus(chip);
    setPage(1);
  }

  function renderGroupsBody() {
    if (groupsQuery.isLoading) return <GroupsSkeleton />;
    if (groupsQuery.isError) {
      return (
        <StatusMessage tone="error">
          Could not load groups.{' '}
          <Button variant="ghost" size="sm" onClick={() => void groupsQuery.refetch()}>
            Retry
          </Button>
        </StatusMessage>
      );
    }

    if (!pageData || (pageData.total === 0 && !hasFilters && status === 'all')) {
      return (
        <Card className="splitter-shadow overflow-hidden p-0">
          <div className="splitter-brand-gradient px-6 py-8 text-white">
            <p className="text-sm font-medium text-white/80">Welcome, {firstName}</p>
            <h2 className="mt-1 text-2xl font-bold">My groups live here</h2>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Groups stay available after everyone settles up. Settled does not delete or
              disable a group — you can keep adding expenses anytime.
            </p>
          </div>
          <div className="p-6">
            <EmptyState
              title="No groups yet"
              description="Create a group to start tracking shared expenses with friends."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  Create your first group
                </Button>
              }
            />
          </div>
        </Card>
      );
    }

    if (pageData.items.length === 0) {
      return (
        <Card className="splitter-shadow py-10 text-center">
          <p className="font-medium">No groups match these filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another search, or switch back to All.
          </p>
          <Button className="mt-4" size="sm" variant="secondary" onClick={resetFilters}>
            Reset filters
          </Button>
        </Card>
      );
    }

    return (
      <>
        <ul className="flex flex-col gap-3">
          {pageData.items.map((group) => {
            const amounts = owedAmounts(group);
            const statusMeta = groupStatus(group);
            const previews = group.memberPreviews ?? [];
            const extraMembers = Math.max(0, group.memberCount - previews.length);
            return (
              <li key={group.id}>
                <article className="rounded-xl border border-border bg-card p-4 splitter-shadow splitter-card-hover">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="splitter-group-mark">
                        {initialsFromName(group.name)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-foreground">
                          {group.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {group.currency} · {group.memberCount}{' '}
                          {group.memberCount === 1 ? 'member' : 'members'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatUpdated(group.updatedAt)}
                        </p>
                        {previews.length > 0 ? (
                          <div className="mt-2 flex items-center">
                            {previews.map((member, index) => (
                              <Avatar
                                key={`${group.id}-${member.name}-${index}`}
                                name={member.name}
                                size="sm"
                                className={`ring-2 ring-card ${index === 0 ? '' : '-ml-2'}`}
                              />
                            ))}
                            {extraMembers > 0 ? (
                              <span className="splitter-avatar splitter-avatar-sm -ml-2 bg-muted text-[0.65rem] text-muted-foreground ring-2 ring-card">
                                +{extraMembers}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-8 lg:justify-end">
                      <div className="min-w-[6.5rem]">
                        <p className="text-xs text-muted-foreground">You are owed</p>
                        <p className="text-base font-bold tabular-nums text-success">
                          {formatMoney(amounts.youAreOwed, group.currency)}
                        </p>
                      </div>
                      <div className="min-w-[6.5rem]">
                        <p className="text-xs text-muted-foreground">You owe</p>
                        <p className="text-base font-bold tabular-nums text-destructive">
                          {formatMoney(amounts.youOwe, group.currency)}
                        </p>
                      </div>
                      <div className="flex min-w-[8.5rem] flex-col items-end gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${groupStatusBadgeClass(statusMeta.tone)}`}
                        >
                          <span className="splitter-status-dot" />
                          {statusMeta.label}
                        </span>
                        <Link
                          href={`/groups/${group.id}`}
                          className="splitter-open-group"
                        >
                          Open group
                          <IconChevronRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <PaginationBar
            page={pageData.page}
            totalPages={pageData.totalPages}
            total={pageData.total}
            limit={pageData.limit}
            label={pageData.total === 1 ? 'group' : 'groups'}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div className="splitter-page">
      <header className="splitter-page-header">
        <div className="splitter-page-header-copy">
          <p className="text-sm text-muted-foreground">👋 Hello, {firstName}</p>
          <div className="splitter-page-title-row">
            <h2 className="text-2xl font-bold tracking-tight">My groups</h2>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              + Create group
            </Button>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            All of your groups in one place. Settled groups stay listed. Blocked groups
            are read-only.
          </p>
        </div>

        <div className="splitter-page-stats">
          <StatCard
            label="Total groups"
            value={String(stats?.totalGroups ?? '—')}
            icon={<IconGroups />}
          />
          <StatCard
            label="Active groups"
            value={String(stats?.activeGroups ?? '—')}
            tone="active"
            icon={<IconPerson />}
          />
          <StatCard
            label="You are owed"
            value={stats ? formatMoney(stats.youAreOwedCents, currency) : '—'}
            tone="owed"
            icon={<IconWallet />}
          />
          <StatCard
            label="You owe"
            value={stats ? formatMoney(stats.youOweCents, currency) : '—'}
            tone="owe"
            icon={<IconArrowDown />}
          />
        </div>
      </header>

      {invitesQuery.data?.length ? (
        <Alert tone="info" title="Pending invitations">
          <ul className="mt-2 space-y-2">
            {invitesQuery.data.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span>
                  Join <span className="font-medium">{invite.groupName}</span>
                </span>
                <span className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptInvite.mutate(invite.id)}
                    loading={acceptInvite.isPending}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => declineInvite.mutate(invite.id)}
                    loading={declineInvite.isPending}
                  >
                    Decline
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <Form
        className="rounded-xl border border-border bg-card px-4 py-4 splitter-shadow"
        onSubmit={(e) => {
          e.preventDefault();
          applySearch();
        }}
      >
        <p className="mb-3 text-sm font-semibold text-foreground">Find your group</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Search" htmlFor="groups-q" className="mb-0 min-w-[12rem] flex-1">
            <TextInput
              id="groups-q"
              placeholder="Search by group name…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </Field>
          <Field label="Status" htmlFor="groups-status" className="mb-0 w-auto shrink-0">
            <Select
              id="groups-status"
              className="splitter-select-compact"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as GroupStatusFilter);
                setPage(1);
              }}
            >
              <option value="all">All groups</option>
              <option value="outstanding">Outstanding balance</option>
              <option value="owed_to_me">Owed to me</option>
              <option value="i_owe">I owe</option>
              <option value="settled">Settled up</option>
              <option value="blocked">Blocked</option>
            </Select>
          </Field>
          <Field label="Sort by" htmlFor="groups-sort" className="mb-0 w-auto shrink-0">
            <Select
              id="groups-sort"
              className="splitter-select-compact"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as GroupSort);
                setPage(1);
              }}
            >
              <option value="updatedAt">Recently updated</option>
              <option value="name">Name</option>
              <option value="balance">Largest balance</option>
            </Select>
          </Field>
          <div className="mb-0 w-auto shrink-0">
            <span className="ui-field-label invisible select-none" aria-hidden>
              Apply
            </span>
            <div className="flex items-stretch gap-2">
              <Button type="submit" className="min-w-[6.25rem]">
                Apply
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-w-[6.25rem]"
                onClick={resetFilters}
                disabled={!hasFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick filters</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => {
              const active = activeChip === chip.id;
              return (
                <Button
                  key={chip.id}
                  type="button"
                  size="sm"
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => setQuickChip(chip.id)}
                >
                  {chip.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Form>

      <section className="splitter-page-section">
        {pageData && pageData.total > 0 ? (
          <p className="text-sm font-medium text-muted-foreground">
            {pageData.total} {pageData.total === 1 ? 'group' : 'groups'}
          </p>
        ) : null}
        {renderGroupsBody()}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Form
            pending={createMutation.isPending}
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createMutation.mutate();
            }}
          >
            <Field label="Group name" htmlFor="group-name" required>
              <TextInput
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Weekend trip, Apartment, etc."
              />
            </Field>
            {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
            <div className="flex gap-2">
              <Button type="submit" loading={createMutation.isPending}>
                Create
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </DialogBody>
      </Dialog>
    </div>
  );
}
