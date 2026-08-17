'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  EmptyState,
  Select,
  Skeleton,
  StatusMessage,
} from '@shared/ui/components';
import type { GroupSummary } from '@shared/api-client';
import { GroupBalancesView } from '@/components/splitter';
import { splitterApi } from '@/lib/api';

function pickDefaultGroup(groups: GroupSummary[]): string | null {
  if (groups.length === 0) return null;
  const outstanding = groups.find((g) => g.myNetCents !== 0 && !g.blocked);
  if (outstanding) return outstanding.id;
  const active = groups.find((g) => !g.blocked);
  return active?.id ?? groups[0]?.id ?? null;
}

function BalancesHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get('groupId') ?? '';

  const groupsQuery = useQuery({
    queryKey: ['groups', { forBalances: true }],
    queryFn: () =>
      splitterApi.listGroups({
        limit: 50,
        page: 1,
        sortBy: 'balance',
        sortDir: 'DESC',
      }),
  });

  const groups = groupsQuery.data?.items ?? [];
  const defaultGroupId = useMemo(() => pickDefaultGroup(groups), [groups]);
  const selectedGroupId = groupIdParam || defaultGroupId || '';

  useEffect(() => {
    if (!groupsQuery.isSuccess) return;
    if (groups.length === 0) return;
    if (groupIdParam && groups.some((g) => g.id === groupIdParam)) return;
    if (!defaultGroupId) return;
    router.replace(`/balances?groupId=${defaultGroupId}`);
  }, [groupsQuery.isSuccess, groups, groupIdParam, defaultGroupId, router]);

  if (groupsQuery.isLoading) {
    return (
      <div className="space-y-3" aria-hidden>
        <Skeleton size="lg" className="h-12 rounded-lg" />
        <Skeleton size="lg" className="h-28 rounded-lg" />
        <Skeleton size="lg" className="h-40 rounded-lg" />
      </div>
    );
  }

  if (groupsQuery.isError) {
    return <StatusMessage tone="error">Could not load your groups.</StatusMessage>;
  }

  if (groups.length === 0) {
    return (
      <Card className="splitter-shadow mx-auto max-w-xl p-6">
        <EmptyState
          title="No groups yet"
          description="Join or create a group to see who owes whom and settle up."
          action={
            <Link href="/groups" className="no-underline hover:no-underline">
              <Button type="button">Go to groups</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  if (!selectedGroupId) {
    return (
      <div className="space-y-3" aria-hidden>
        <Skeleton size="lg" className="h-28 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="splitter-shadow p-4">
        <div className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">Group</span>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              aria-label="Select group for balances"
              value={selectedGroupId}
              onChange={(e) => {
                router.replace(`/balances?groupId=${e.target.value}`);
              }}
              className="min-w-[16rem] flex-1"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.blocked ? ' (blocked)' : ''}
                </option>
              ))}
            </Select>
            <Link
              href={`/groups/${selectedGroupId}`}
              className="inline-flex h-10 shrink-0 items-center text-sm font-medium text-primary no-underline hover:underline"
            >
              Open group →
            </Link>
          </div>
        </div>
      </Card>

      <GroupBalancesView groupId={selectedGroupId} showBackLink={false} />
    </div>
  );
}

export default function BalancesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3" aria-hidden>
          <Skeleton size="lg" className="h-12 rounded-lg" />
          <Skeleton size="lg" className="h-40 rounded-lg" />
        </div>
      }
    >
      <BalancesHub />
    </Suspense>
  );
}
