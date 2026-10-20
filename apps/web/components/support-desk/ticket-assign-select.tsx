'use client';

import { useState } from 'react';
import { Button, StatusMessage } from '@shared/ui/components';
import type { Ticket } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import { useAssignTicket } from '@/lib/hooks/use-ticket-detail';

export function TicketAssignSelect({ ticket }: Readonly<{ ticket: Ticket }>) {
  const { user } = useAuth();
  const assignMutation = useAssignTicket(ticket.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return null;
  }

  const isAssignedToMe = ticket.assigneeId === user.id;

  const handleAssignToMe = async () => {
    setErrorMsg(null);
    try {
      await assignMutation.mutateAsync({
        assigneeId: user.id,
        expectedVersion: ticket.version,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reassign ticket.');
    }
  };

  const handleUnassign = async () => {
    setErrorMsg(null);
    try {
      await assignMutation.mutateAsync({
        assigneeId: null,
        expectedVersion: ticket.version,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to unassign ticket.');
    }
  };

  let assigneeLabel;
  if (!ticket.assigneeId) {
    assigneeLabel = <span className="text-muted-foreground italic">Unassigned</span>;
  } else if (isAssignedToMe) {
    assigneeLabel = <span className="text-accent font-bold">Assigned to You</span>;
  } else {
    assigneeLabel = ticket.assigneeId;
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-muted-foreground font-medium">Assignee:</span>
        <span className="font-mono text-xs font-semibold text-foreground">
          {assigneeLabel}
        </span>

        {!isAssignedToMe && (
          <Button
            variant="secondary"
            size="sm"
            disabled={assignMutation.isPending}
            onClick={() => void handleAssignToMe()}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign to Me'}
          </Button>
        )}

        {ticket.assigneeId && (
          <Button
            variant="ghost"
            size="sm"
            disabled={assignMutation.isPending}
            onClick={() => void handleUnassign()}
          >
            Unassign
          </Button>
        )}
      </div>

      {errorMsg && <StatusMessage tone="error">{errorMsg}</StatusMessage>}
    </div>
  );
}
