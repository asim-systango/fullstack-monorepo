'use client';

import { useState } from 'react';
import { Button, StatusMessage } from '@shared/ui/components';
import type { Ticket, TicketStatus } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { useUpdateTicketStatus } from '@/lib/hooks/use-ticket-detail';

type ActionConfig = {
  label: string;
  targetStatus: TicketStatus;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
};

const ALLOWED_TRANSITIONS: Record<TicketStatus, ActionConfig[]> = {
  open: [{ label: 'Mark Pending', targetStatus: 'pending', variant: 'secondary' }],
  pending: [
    { label: 'Reopen Ticket', targetStatus: 'open', variant: 'ghost' },
    { label: 'Mark Resolved', targetStatus: 'resolved', variant: 'primary' },
  ],
  resolved: [
    { label: 'Reopen Ticket', targetStatus: 'open', variant: 'ghost' },
    { label: 'Close Ticket', targetStatus: 'closed', variant: 'danger' },
  ],
  closed: [],
};

export function TicketStatusActions({ ticket }: Readonly<{ ticket: Ticket }>) {
  const { user } = useAuth();
  const updateStatusMutation = useUpdateTicketStatus(ticket.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return null;
  }

  const actions = ALLOWED_TRANSITIONS[ticket.status] || [];

  if (actions.length === 0) {
    return null;
  }

  const handleStatusChange = async (targetStatus: TicketStatus) => {
    setErrorMsg(null);
    try {
      await updateStatusMutation.mutateAsync({
        status: targetStatus,
        expectedVersion: ticket.version,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update ticket status.');
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Workflow:
        </span>
        {actions.map((action) => (
          <Button
            key={action.targetStatus}
            variant={action.variant}
            size="sm"
            disabled={updateStatusMutation.isPending}
            onClick={() => void handleStatusChange(action.targetStatus)}
          >
            {updateStatusMutation.isPending ? 'Updating...' : action.label}
          </Button>
        ))}
      </div>

      {errorMsg && <StatusMessage tone="error">{errorMsg}</StatusMessage>}
    </div>
  );
}
