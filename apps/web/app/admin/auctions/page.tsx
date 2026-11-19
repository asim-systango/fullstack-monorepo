'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { auctionQueryKeys, auctionsApi } from '@/lib/api';
import { formatMoney, statusBadgeTone } from '@/lib/auction-utils';

function AdminAuctions() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: auctionQueryKeys.list({ limit: 50, status: undefined }),
    queryFn: () => auctionsApi.list({ limit: 50 }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() });
  };

  const cancelMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.cancel(id),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Cancel failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => auctionsApi.softDelete(id),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    },
  });

  return (
    <Page>
      <ShellHeader title="Admin" subtitle="Moderate auction listings" />
      <PageHeader
        title="Auction management"
        description="Cancel open auctions or soft-delete any listing."
      />

      {error ? (
        <Alert tone="danger" title="Action failed">
          {error}
        </Alert>
      ) : null}
      {listQuery.isLoading ? <LoadingState label="Loading auctions…" /> : null}
      {listQuery.isError ? (
        <Alert tone="danger" title="Could not load auctions">
          {(listQuery.error as Error).message}
        </Alert>
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length === 0 ? (
        <EmptyState title="No auctions" description="There is nothing to moderate." />
      ) : null}
      {listQuery.isSuccess && listQuery.data.items.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Title</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listQuery.data.items.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>
                  <Link href={`/auctions/${auction.id}`}>{auction.title}</Link>
                </TableCell>
                <TableCell>
                  <Badge tone={statusBadgeTone(auction.status)}>{auction.status}</Badge>
                </TableCell>
                <TableCell>{formatMoney(auction.currentPrice)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {auction.status === 'open' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={cancelMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Cancel this open auction?')) {
                            cancelMutation.mutate(auction.id);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    ) : null}
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          window.confirm('Soft-delete this auction from public listings?')
                        ) {
                          deleteMutation.mutate(auction.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </Page>
  );
}

export default function AdminAuctionsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminAuctions />
    </RequireAuth>
  );
}
