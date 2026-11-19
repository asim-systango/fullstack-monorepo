'use client';

import { useState, type SyntheticEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Field,
  Form,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { auctionQueryKeys, bidQueryKeys, bidsApi } from '@/lib/api';
import type { Auction } from '@/lib/schemas/auction';
import { formatMoney, minNextBid } from '@/lib/auction-utils';

export function BidForm({
  auction,
  hasBids,
}: Readonly<{
  auction: Auction;
  hasBids: boolean;
}>) {
  const queryClient = useQueryClient();
  const minimum = minNextBid(auction, hasBids);
  const [amount, setAmount] = useState(String(minimum));
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (bidAmount: number) => bidsApi.place(auction.id, bidAmount),
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.detail(auction.id) }),
        queryClient.invalidateQueries({ queryKey: bidQueryKeys.forAuction(auction.id) }),
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: bidQueryKeys.me() }),
      ]);
      setAmount(String(minNextBid(auction, true)));
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not place bid');
    },
  });

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const bidAmount = Number(amount);
    if (!Number.isFinite(bidAmount) || bidAmount < minimum) {
      setError(`Bid must be at least ${formatMoney(minimum)}`);
      return;
    }
    mutation.mutate(bidAmount);
  }

  return (
    <div className="space-y-3">
      <Alert tone="info" title="Place a bid">
        Current: {formatMoney(auction.currentPrice)} · Next bid at least{' '}
        {formatMoney(minimum)}
      </Alert>
      <Form pending={mutation.isPending} onSubmit={onSubmit}>
        <Field
          label="Your bid (₹)"
          htmlFor="bid-amount"
          required
          disabled={mutation.isPending}
        >
          <TextInput
            id="bid-amount"
            name="bidAmount"
            type="number"
            min={minimum}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {mutation.isSuccess ? (
          <StatusMessage tone="success">Bid placed successfully.</StatusMessage>
        ) : null}
        <Button type="submit" loading={mutation.isPending} loadingText="Placing…">
          Place bid
        </Button>
      </Form>
    </div>
  );
}
