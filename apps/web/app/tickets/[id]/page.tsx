'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShellHeader, useAuth } from '@/components/auth';
import { TicketThread } from '@/components/support-desk/ticket-thread';
import { useTicketDetail, useTicketMessages } from '@/lib/hooks/use-ticket-detail';
import { Alert, Badge, Button, Card, Page, Spinner } from '@shared/ui/components';

function getStatusTone(status: string) {
  switch (status) {
    case 'open':
      return 'accent';
    case 'pending':
      return 'neutral';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'danger';
    default:
      return 'neutral';
  }
}

function getPriorityTone(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'danger';
    case 'high':
      return 'accent';
    default:
      return 'neutral';
  }
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = (params?.id as string) ?? '';
  const { user, loading: isAuthLoading } = useAuth();

  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
    error: ticketError,
    refetch: refetchTicket,
  } = useTicketDetail(ticketId);

  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(ticketId);

  if (isAuthLoading || !user) {
    return (
      <Page>
        <ShellHeader title="Ticket Detail" />
        <div className="flex items-center justify-center p-12">
          <Spinner label="Checking authentication..." />
        </div>
      </Page>
    );
  }

  let content;
  if (isTicketLoading) {
    content = (
      <Card className="flex items-center justify-center p-12">
        <Spinner label="Loading ticket details..." />
      </Card>
    );
  } else if (isTicketError || !ticket) {
    content = (
      <Alert tone="danger" title="Ticket Not Found">
        <p>
          {ticketError instanceof Error
            ? ticketError.message
            : 'The requested support ticket could not be loaded or does not exist.'}
        </p>
        <div className="mt-4 flex space-x-3">
          <Button variant="secondary" size="sm" onClick={() => void refetchTicket()}>
            Retry
          </Button>
          <Link href="/tickets">
            <Button variant="ghost" size="sm">
              Back to My Tickets
            </Button>
          </Link>
        </div>
      </Alert>
    );
  } else {
    content = (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm font-mono font-bold text-muted-foreground">
                  #{ticket.ticketNumber}
                </span>
                <Badge tone={getStatusTone(ticket.status)}>
                  {ticket.status.toUpperCase()}
                </Badge>
                <Badge tone={getPriorityTone(ticket.priority)}>
                  {ticket.priority.toUpperCase()} PRIORITY
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {ticket.subject}
              </h1>
              <p className="text-sm text-muted-foreground">
                Category:{' '}
                <strong className="text-foreground">
                  {ticket.categoryName ?? ticket.category?.name ?? 'General'}
                </strong>
                {' • '}Created on {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
          </div>
        </Card>

        <TicketThread
          ticket={ticket}
          messages={messages ?? []}
          isLoadingMessages={isMessagesLoading}
        />
      </div>
    );
  }

  return (
    <Page>
      <ShellHeader
        title={`Ticket #${ticket?.ticketNumber ?? ''}`}
        subtitle="Conversation and resolution updates"
      />
      <div className="mt-6">{content}</div>
    </Page>
  );
}
