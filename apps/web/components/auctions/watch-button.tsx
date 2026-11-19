'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import { Button, StatusMessage } from '@shared/ui/components';
import { useAuth } from '@/components/auth';
import { watchlistApi, watchlistQueryKeys } from '@/lib/api';
import { useState } from 'react';

export function WatchButton({ auctionId }: Readonly<{ auctionId: string }>) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const canWatch = user?.role === 'user' || user?.role === 'staff';

  const watchlistQuery = useQuery({
    queryKey: watchlistQueryKeys.me(),
    queryFn: () => watchlistApi.list(),
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

  if (!canWatch) {
    return null;
  }

  const pending = addMutation.isPending || removeMutation.isPending;

  return (
    <div className="space-y-2">
      {watching ? (
        <Button
          variant="secondary"
          loading={pending}
          onClick={() => removeMutation.mutate()}
        >
          Remove from watchlist
        </Button>
      ) : (
        <Button
          variant="secondary"
          loading={pending}
          onClick={() => addMutation.mutate()}
        >
          Add to watchlist
        </Button>
      )}
      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
    </div>
  );
}
