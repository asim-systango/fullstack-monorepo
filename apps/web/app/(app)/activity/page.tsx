'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, EmptyState, Skeleton, StatusMessage } from '@shared/ui/components';
import { Avatar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';

export default function ActivityPage() {
  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => splitterApi.listGroups(),
  });

  if (groupsQuery.isLoading) {
    return (
      <div className="space-y-3" aria-hidden>
        <Skeleton size="lg" className="h-20 rounded-lg" />
        <Skeleton size="lg" className="h-20 rounded-lg" />
      </div>
    );
  }

  if (groupsQuery.isError) {
    return (
      <StatusMessage tone="error">
        Could not load activity.{' '}
        <button
          type="button"
          className="underline"
          onClick={() => void groupsQuery.refetch()}
        >
          Retry
        </button>
      </StatusMessage>
    );
  }

  const groups = groupsQuery.data ?? [];
  if (groups.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Join or create a group and activity from expenses and settlements will show up in this feed."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Groups you belong to — open one to see expenses and balances.
        </p>
      </div>
      <ul className="space-y-3">
        {groups.map((group) => (
          <li key={group.id}>
            <Link
              href={`/groups/${group.id}`}
              className="block no-underline hover:no-underline"
            >
              <Card className="splitter-shadow splitter-card-hover">
                <div className="flex items-center gap-3">
                  <Avatar name={group.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {group.currency} · {group.myRole ?? 'member'}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">View</span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
