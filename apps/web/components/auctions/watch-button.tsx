'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import { Button, StatusMessage } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { ButtonLink } from '@/components/ui/button-link';
import { watchlistApi, watchlistQueryKeys } from '@/lib/api';
import { useState } from 'react';

export function WatchButton({
  auctionId,
  compact = false,
}: Readonly<{ auctionId: string; compact?: boolean }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const canWatch = user?.role === 'user' || user?.role === 'staff';
  const nextPath = pathname || `/auctions/${auctionId}`;
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  const watchlistQuery = useQuery({
    queryKey: watchlistQueryKeys.me(),
    queryFn: () => watchlistApi.list({ limit: 100 }),
    enabled: canWatch,
  });

  const watching =
    watchlistQuery.data?.some((item) => item.auctionId === auctionId) ?? false;

  const addMutation = useMutation({
    mutationFn: () => watchlistApi.add(auctionId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.me() });
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : 'Could not add to watchlist',
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => watchlistApi.remove(auctionId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.me() });
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : 'Could not remove from watchlist',
      );
    },
  });

  if (loading) {
    return null;
  }

  if (!user) {
    if (compact) {
      return (
        <Link
          href={loginHref}
          className="text-sm text-accent underline-offset-4 hover:underline"
        >
          Sign in to watch
        </Link>
      );
    }
    return (
      <ButtonLink href={loginHref} variant="secondary" size="sm">
        Sign in to watch
      </ButtonLink>
    );
  }

  if (!canWatch) {
    return null;
  }

  const pending = addMutation.isPending || removeMutation.isPending;

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {watching ? (
        <Button
          variant="secondary"
          size="sm"
          loading={pending}
          onClick={() => removeMutation.mutate()}
        >
          {compact ? 'Watching' : 'Remove from watchlist'}
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          loading={pending}
          onClick={() => addMutation.mutate()}
        >
          {compact ? 'Watch' : 'Add to watchlist'}
        </Button>
      )}
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
    </div>
  );
}
