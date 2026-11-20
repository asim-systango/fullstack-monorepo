'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import {
  Button,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  StatusMessage,
} from '@shared/ui/components';
import { auctionQueryKeys, auctionsApi, bidQueryKeys } from '@/lib/api';

export function CloseAuctionDialog({
  auctionId,
  disabled = false,
}: Readonly<{
  auctionId: string;
  disabled?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => auctionsApi.close(auctionId),
    onSuccess: async () => {
      setError(null);
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.detail(auctionId) }),
        queryClient.invalidateQueries({ queryKey: bidQueryKeys.forAuction(auctionId) }),
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: auctionQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: bidQueryKeys.me() }),
      ]);
    },
    onError: (err) => {
      setError(err instanceof ApiClientError ? err.message : 'Could not close auction');
    },
  });

  return (
    <>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Close auction
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Close this auction?</DialogTitle>
          <DialogDescription>
            The highest bidder becomes the winner. Bidding will stop permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            loading={mutation.isPending}
            loadingText="Closing…"
            onClick={() => mutation.mutate()}
          >
            Confirm close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
