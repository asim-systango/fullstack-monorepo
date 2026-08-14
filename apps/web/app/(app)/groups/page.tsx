'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Form,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { Avatar } from '@/components/splitter';
import { splitterApi } from '@/lib/api';

function GroupsSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-hidden>
      <li>
        <Skeleton size="lg" className="h-32 rounded-lg" />
      </li>
      <li>
        <Skeleton size="lg" className="h-32 rounded-lg" />
      </li>
    </ul>
  );
}

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: () => splitterApi.listGroups(),
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

  const canCreate = user?.role === 'staff' || user?.role === 'admin';
  const firstName = user?.name.split(/\s+/)[0] ?? 'there';

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
    if (!groupsQuery.data?.length) {
      return (
        <Card className="splitter-shadow overflow-hidden p-0">
          <div className="splitter-brand-gradient px-6 py-8 text-white">
            <p className="text-sm font-medium text-white/80">Welcome, {firstName}</p>
            <h2 className="mt-1 text-2xl font-bold">Your groups live here</h2>
            <p className="mt-2 max-w-lg text-sm text-white/85">
              Groups are where you split dinners, trips, and rent. Once you join one,
              expenses and balances show up automatically.
            </p>
          </div>
          <div className="p-6">
            <EmptyState
              title="No groups yet"
              description={
                canCreate
                  ? 'Create a group to start tracking shared expenses with friends.'
                  : 'Ask a group admin to invite this email, or sign in with a staff account to create a group.'
              }
              action={
                canCreate ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    Create your first group
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => router.push('/account')}>
                    View account
                  </Button>
                )
              }
            />
          </div>
        </Card>
      );
    }
    return (
      <ul className="grid gap-4 sm:grid-cols-2">
        {groupsQuery.data.map((group) => (
          <li key={group.id}>
            <Link
              href={`/groups/${group.id}`}
              className="block no-underline hover:no-underline"
            >
              <Card className="splitter-shadow splitter-card-hover h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={group.name} size="lg" />
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-foreground">
                        {group.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {group.currency} · {group.myRole ?? 'viewer'}
                      </p>
                    </div>
                  </div>
                  {group.blocked ? <Badge tone="danger">Blocked</Badge> : null}
                </div>
                <p className="mt-4 text-sm font-medium text-primary">Open group →</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Hello, {firstName}</p>
          <h2 className="text-2xl font-bold tracking-tight">Your groups</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Split expenses with friends, roommates, and trips
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreateOpen(true)}>Create group</Button>
        ) : null}
      </div>

      {renderGroupsBody()}

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
