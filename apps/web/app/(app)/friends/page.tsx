'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Select,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import type { FriendGroupSection, FriendPerson } from '@shared/api-client';
import { Avatar, PaginationBar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';

type FriendsView = 'groups' | 'people';

const MEMBER_PREVIEW = 6;

function FriendsSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden>
      {[0, 1, 2].map((i) => (
        <li key={i}>
          <Skeleton size="lg" className="h-32 rounded-xl" />
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Card className="border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </Card>
  );
}

function MemberRows({
  members,
}: Readonly<{
  members: FriendGroupSection['members'];
}>) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? members : members.slice(0, MEMBER_PREVIEW);
  const hasMore = members.length > MEMBER_PREVIEW;

  return (
    <div>
      <ul className="divide-y divide-border">
        {visible.map((member) => (
          <li
            key={member.userId}
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Avatar name={member.name} size="sm" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {member.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {member.email}
                </span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <div className="border-t border-border px-3 py-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show fewer' : `View all ${members.length} people`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function GroupSectionCard({ section }: Readonly<{ section: FriendGroupSection }>) {
  return (
    <Card className="splitter-shadow overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {section.group.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {section.memberCount} {section.memberCount === 1 ? 'friend' : 'friends'} ·{' '}
            {section.group.currency}
          </p>
        </div>
        <Link
          href={`/groups/${section.group.id}`}
          className="text-sm font-medium text-primary no-underline hover:underline"
        >
          Open group →
        </Link>
      </div>
      {section.members.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          No other members in this group yet.
        </p>
      ) : (
        <MemberRows members={section.members} />
      )}
    </Card>
  );
}

function PersonCard({ person }: Readonly<{ person: FriendPerson }>) {
  return (
    <Card className="splitter-shadow p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <Avatar name={person.name} size="md" />
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground">
              {person.name}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {person.email}
            </span>
          </span>
        </span>
        <Badge tone="neutral">
          {person.groups.length} {person.groups.length === 1 ? 'group' : 'groups'}
        </Badge>
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {person.groups.map((g) => (
          <li key={g.id}>
            <Link
              href={`/groups/${g.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground no-underline hover:bg-muted"
            >
              {g.name}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function FriendsPage() {
  const [draftQ, setDraftQ] = useState('');
  const [draftGroupId, setDraftGroupId] = useState('');
  const [q, setQ] = useState('');
  const [groupId, setGroupId] = useState('');
  const [view, setView] = useState<FriendsView>('groups');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const query = useQuery({
    queryKey: ['friends', { q, groupId, view, page, limit }],
    queryFn: () =>
      splitterApi.listFriends({
        q: q || undefined,
        groupId: groupId || undefined,
        view,
        page,
        limit,
      }),
  });

  const groupOptions = query.data?.groupOptions ?? [];
  const stats = query.data?.stats;

  const resultLabel = useMemo(() => {
    if (view === 'people') return 'people';
    return 'groups';
  }, [view]);

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

  function setViewMode(next: FriendsView) {
    setView(next);
    setPage(1);
  }

  return (
    <div className="splitter-page space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            People you share groups with — organized so the list stays usable as it grows.
          </p>
        </div>
        <Link href="/groups" className="no-underline hover:no-underline">
          <Button type="button" variant="secondary">
            Invite via groups
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:max-w-md">
        <StatCard label="Friends" value={stats ? String(stats.uniqueFriends) : '—'} />
        <StatCard
          label="Shared groups"
          value={stats ? String(stats.sharedGroups) : '—'}
        />
      </div>

      <Card className="splitter-shadow space-y-4 p-4">
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_auto_auto]"
          onSubmit={applyFilters}
        >
          <TextInput
            aria-label="Search friends"
            placeholder="Search by name, email, or group…"
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
          />
          <Select
            aria-label="Filter by group"
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
          <Button type="submit">Apply</Button>
          <Button type="button" variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={view === 'groups' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('groups')}
          >
            By group
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === 'people' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('people')}
          >
            All people
          </Button>
        </div>
      </Card>

      {query.isLoading ? <FriendsSkeleton /> : null}

      {query.isError ? (
        <StatusMessage tone="error">
          Could not load friends. Try again in a moment.
        </StatusMessage>
      ) : null}

      {query.data && query.data.total === 0 ? (
        <EmptyState
          title={q || groupId ? 'No matches' : 'No friends yet'}
          description={
            q || groupId
              ? 'Try a different search or clear the group filter.'
              : 'Invite people into your groups — they’ll show up here automatically.'
          }
          action={
            <Link href="/groups" className="no-underline hover:no-underline">
              <Button type="button">Go to groups</Button>
            </Link>
          }
        />
      ) : null}

      {query.data && query.data.total > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {query.data.total} {resultLabel}
            {q ? ` matching “${q}”` : ''}
          </p>

          {query.data.view === 'groups' ? (
            <ul className="space-y-3">
              {query.data.items.map((section) => (
                <li key={section.group.id}>
                  <GroupSectionCard section={section} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {query.data.items.map((person) => (
                <li key={person.userId}>
                  <PersonCard person={person} />
                </li>
              ))}
            </ul>
          )}

          <PaginationBar
            page={query.data.page}
            totalPages={query.data.totalPages}
            total={query.data.total}
            limit={query.data.limit}
            label={resultLabel}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
