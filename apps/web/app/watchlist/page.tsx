'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  LoadingState,
  Page,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { RequireAuth, ShellHeader } from '@/components/auth';
import { watchlistApi, watchlistQueryKeys } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';
import { useState } from 'react';

function WatchlistPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: watchlistQueryKeys.me(),
    queryFn: () => watchlistApi.list(),
  });

  const removeMutation = useMutation({
    mutationFn: (auctionId: string) => watchlistApi.remove(auctionId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: watchlistQueryKeys.me() });
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not remove item');
    },
  });

  return (
    <Page>
      <ShellHeader title="Watchlist" subtitle="Auctions you are watching" />
      <PageHeader
        title="Your watchlist"
        description="Add items from an auction detail page."
      />

      {error ? (
        <Alert tone="danger" title="Action failed">
          {error}
        </Alert>
      ) : null}
      {query.isLoading ? <LoadingState label="Loading watchlist…" /> : null}
      {query.isError ? (
        <Alert tone="danger" title="Could not load watchlist">
          {(query.error as Error).message}
        </Alert>
      ) : null}
      {query.isSuccess && query.data.length === 0 ? (
        <EmptyState
          title="Watchlist is empty"
          description="Open an auction and click Add to watchlist."
          action={<Link href="/auctions">Browse auctions</Link>}
        />
      ) : null}
      {query.isSuccess && query.data.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Auction</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link href={`/auctions/${item.auctionId}`}>{item.auction.title}</Link>
                </TableCell>
                <TableCell>
                  <Badge tone={statusBadgeTone(item.auction.status)}>
                    {item.auction.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatMoney(item.auction.currentPrice)}</TableCell>
                <TableCell>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(item.auctionId)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Page>
  );
}

export default function WatchlistRoute() {
  return (
    <RequireAuth roles={['user', 'staff']}>
      <WatchlistPage />
    </RequireAuth>
  );
}
