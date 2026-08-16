'use client';

import { useMemo, useState } from 'react';
import { StatusMessage } from '@shared/ui/components';
import {
  CheckoutRequestCard,
  MemberContent,
  MemberEmpty,
  MemberError,
  MemberLoadingList,
  MemberPageHeader,
  RequireMember,
} from '@/components/member';
import { toUserMessage } from '@/lib/auth/errors';
import { ROUTES } from '@/lib/auth/routes';
import { useCancelCheckoutRequest, useMyCheckoutRequests } from '@/lib/bookly';

function visibleCheckoutRequests<
  T extends { id: string; bookId: string; status: string },
>(items: T[]): T[] {
  const pending = items.filter((item) => item.status === 'pending');
  const seenBooks = new Set(pending.map((item) => item.bookId));
  const issued: T[] = [];
  for (const item of items) {
    if (item.status !== 'fulfilled') continue;
    if (seenBooks.has(item.bookId)) continue;
    seenBooks.add(item.bookId);
    issued.push(item);
  }
  return [...pending, ...issued];
}

function MyCheckoutRequestsContent() {
  const requests = useMyCheckoutRequests({ limit: 50 });
  const cancelRequest = useCancelCheckoutRequest();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const items = useMemo(
    () => visibleCheckoutRequests(requests.data?.items ?? []),
    [requests.data?.items],
  );

  async function onCancel(request: { id: string; bookId: string }) {
    setError(null);
    setSuccess(null);
    setCancellingId(request.id);
    try {
      await cancelRequest.mutateAsync({ id: request.id, bookId: request.bookId });
      setSuccess('Checkout request cancelled.');
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <MemberContent className="space-y-6">
      <MemberPageHeader
        title="Checkout Requests"
        description="Track requests waiting for a librarian, and books that have already been issued."
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {success ? <StatusMessage tone="success">{success}</StatusMessage> : null}

      {requests.isPending ? <MemberLoadingList count={3} /> : null}
      {requests.isError ? (
        <MemberError title="Could not load checkout requests" error={requests.error} />
      ) : null}

      {!requests.isPending && !requests.isError && items.length === 0 ? (
        <MemberEmpty
          title="No checkout requests"
          description="Request a title from the catalog when a copy is available."
          href={ROUTES.books}
          actionLabel="Browse Books"
        />
      ) : null}

      {items.length > 0 ? (
        <div className="member-list-stack">
          {items.map((request) => (
            <CheckoutRequestCard
              key={request.id}
              request={request}
              cancelPending={cancellingId === request.id}
              onCancel={(item) => void onCancel(item)}
            />
          ))}
        </div>
      ) : null}
    </MemberContent>
  );
}

export default function MyCheckoutRequestsPage() {
  return (
    <RequireMember>
      <MyCheckoutRequestsContent />
    </RequireMember>
  );
}
