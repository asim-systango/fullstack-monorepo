'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth';
import { ShellHeader } from '@/components/auth';
import { TicketCreateForm } from '@/components/support-desk/ticket-create-form';
import { TicketList } from '@/components/support-desk/ticket-list';
import { useTickets } from '@/lib/hooks/use-tickets';
import { Alert, Button, Card, Page, Spinner } from '@shared/ui/components';

export default function TicketsPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    data: ticketsResponse,
    isLoading: isTicketsLoading,
    isError,
    error,
    refetch,
  } = useTickets();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login?returnUrl=/tickets');
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (!user && !isAuthLoading)) {
    return (
      <Page>
        <ShellHeader title="My Tickets" />
        <div className="flex items-center justify-center p-12">
          <Spinner label="Checking authentication..." />
        </div>
      </Page>
    );
  }

  let content;
  if (isTicketsLoading) {
    content = (
      <Card className="flex items-center justify-center p-12">
        <Spinner label="Loading tickets..." />
      </Card>
    );
  } else if (isError) {
    content = (
      <Alert tone="danger" title="Unable to load tickets">
        <p>
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred while fetching your tickets.'}
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
  } else {
    content = (
      <Card className="p-0 overflow-hidden">
        <TicketList tickets={ticketsResponse?.items ?? []} />
      </Card>
    );
  }

  return (
    <Page>
      <ShellHeader title="My Tickets" subtitle="View and manage your support requests" />

      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Support Tickets
            </h2>
            <p className="text-sm text-muted-foreground">
              Track the status of your existing issues or open a new request.
            </p>
          </div>
          <Button
            variant={showCreateForm ? 'secondary' : 'primary'}
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? 'Close Form' : '+ Create Ticket'}
          </Button>
        </div>

        {showCreateForm && (
          <TicketCreateForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {content}
      </div>
    </Page>
  );
}
