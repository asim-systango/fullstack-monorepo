'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShellHeader, useAuth } from '@/components/auth';
import { TicketThread } from '@/components/support-desk/ticket-thread';
import { SlaBreachBadge } from '@/components/support-desk/sla-breach-badge';
import { TicketAssignSelect } from '@/components/support-desk/ticket-assign-select';
import { TicketStatusActions } from '@/components/support-desk/ticket-status-actions';
import { TicketEventsTimeline } from '@/components/support-desk/ticket-events-timeline';
import {
  useTicketDetail,
  useTicketMessages,
  useDeleteTicket,
} from '@/lib/hooks/use-ticket-detail';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Page,
  Spinner,
  StatusMessage,
} from '@shared/ui/components';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const {
    data: ticket,
    isLoading: isTicketLoading,
    isError: isTicketError,
    error: ticketError,
    refetch: refetchTicket,
  } = useTicketDetail(ticketId);

  const { data: messages, isLoading: isMessagesLoading } = useTicketMessages(ticketId);
  const deleteTicketMutation = useDeleteTicket(ticketId);

  const handleDeleteConfirm = async () => {
    setDeleteError(null);
    try {
      await deleteTicketMutation.mutateAsync();
      setDeleteDialogOpen(false);
      router.push(user?.role === 'user' ? '/tickets' : '/agent');
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete ticket.');
    }
  };

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

  const isStaffOrAdmin = user.role === 'staff' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

  let content;
  if (isTicketLoading) {
    content = (
      <Card className="flex items-center justify-center p-12">
        <Spinner label="Loading ticket details..." />
      </Card>
    );
  } else if (isTicketError || !ticket) {
    content = (
      <Alert tone="danger" title="Ticket Not Found or Unavailable">
        <p>
          {ticketError instanceof Error
            ? ticketError.message
            : 'This support ticket does not exist or is no longer available.'}
        </p>
        <div className="mt-4 flex space-x-3">
          <Button variant="secondary" size="sm" onClick={() => void refetchTicket()}>
            Retry
          </Button>
          <Link href={isStaffOrAdmin ? '/agent' : '/tickets'}>
            <Button variant="ghost" size="sm">
              {isStaffOrAdmin ? 'Back to Agent Inbox' : 'Back to My Tickets'}
            </Button>
          </Link>
        </div>
      </Alert>
    );
  } else {
    content = (
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-mono font-bold text-muted-foreground">
                  #{ticket.ticketNumber}
                </span>
                <Badge tone={getStatusTone(ticket.status)}>
                  {ticket.status.toUpperCase()}
                </Badge>
                <Badge tone={getPriorityTone(ticket.priority)}>
                  {ticket.priority.toUpperCase()} PRIORITY
                </Badge>
                <SlaBreachBadge ticket={ticket} />
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

            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Ticket
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => router.back()}>
                ← Back
              </Button>
            </div>
          </div>

          {isStaffOrAdmin && (
            <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TicketAssignSelect ticket={ticket} />
              <TicketStatusActions ticket={ticket} />
            </div>
          )}
        </Card>

        {isStaffOrAdmin && (
          <TicketEventsTimeline ticketId={ticket.id} isStaffOrAdmin={isStaffOrAdmin} />
        )}

        <TicketThread
          ticket={ticket}
          messages={messages ?? []}
          isLoadingMessages={isMessagesLoading}
        />

        {isAdmin && (
          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(open) => setDeleteDialogOpen(open)}
          >
            <DialogHeader>
              <DialogTitle>Delete Support Ticket</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-3">
              {deleteError && <StatusMessage tone="error">{deleteError}</StatusMessage>}
              <p className="text-sm text-foreground">
                Are you sure you want to soft-delete ticket{' '}
                <strong>
                  #{ticket.ticketNumber} ({ticket.subject})
                </strong>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This ticket will be hidden from customer lists and archived.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleteTicketMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleDeleteConfirm()}
                disabled={deleteTicketMutation.isPending}
              >
                {deleteTicketMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </DialogFooter>
          </Dialog>
        )}
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
