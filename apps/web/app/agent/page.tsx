'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShellHeader, useAuth } from '@/components/auth';
import { AgentInboxFilters } from '@/components/support-desk/agent-inbox-filters';
import { TicketList } from '@/components/support-desk/ticket-list';
import { useTickets } from '@/lib/hooks/use-tickets';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { resetFilters } from '@/lib/store/ticket-filters-slice';
import { Alert, Button, Card, EmptyState, Page, Spinner } from '@shared/ui/components';

export default function AgentInboxPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading: isAuthLoading } = useAuth();
  const filters = useAppSelector((state) => state.ticketFilters);

  const cleanFilters = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
    page: filters.page,
    limit: filters.limit,
  };

  const {
    data: ticketsResponse,
    isLoading: isTicketsLoading,
    isError,
    error,
    refetch,
  } = useTickets(cleanFilters);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login?returnUrl=/agent');
      } else if (user.role !== 'staff' && user.role !== 'admin') {
        router.push('/tickets');
      }
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (!user && !isAuthLoading)) {
    return (
      <Page>
        <ShellHeader title="Agent Inbox" />
        <div className="flex items-center justify-center p-12">
          <Spinner label="Checking authorization..." />
        </div>
      </Page>
    );
  }

  const isFiltered =
    Boolean(filters.status) ||
    Boolean(filters.priority) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.search?.trim());

  let content;
  if (isTicketsLoading) {
    content = (
      <Card className="flex items-center justify-center p-12">
        <Spinner label="Loading agent inbox..." />
      </Card>
    );
  } else if (isError) {
    content = (
      <Alert tone="danger" title="Unable to load agent tickets">
        <p>
          {error instanceof Error
            ? error.message
            : 'An error occurred while retrieving ticket inbox.'}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => void refetch()}
        >
          Retry
        </Button>
      </Alert>
    );
  } else if (!ticketsResponse?.items.length) {
    content = (
      <Card className="p-8">
        <EmptyState
          title="No tickets found"
          description={
            isFiltered
              ? 'No support tickets match the selected filters.'
              : 'There are no active support tickets in the system.'
          }
          action={
            isFiltered ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch(resetFilters())}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      </Card>
    );
  } else {
    content = (
      <Card className="p-0 overflow-hidden">
        <TicketList tickets={ticketsResponse.items} />
      </Card>
    );
  }

  return (
    <Page>
      <ShellHeader
        title="Agent Inbox"
        subtitle="Staff management portal for customer support tickets"
      />

      <div className="mt-6 space-y-4">
        <AgentInboxFilters />
        {content}
      </div>
    </Page>
  );
}
