'use client';

import { Badge } from '@shared/ui/components';
import type { Ticket } from '@shared/api-client';

export function isSlaBreached(ticket: Partial<Ticket>): boolean {
  if (ticket.slaBreached) return true;
  if (
    ticket.firstResponseDueAt &&
    !ticket.firstResponseAt &&
    ticket.status !== 'closed' &&
    ticket.status !== 'resolved'
  ) {
    return new Date(ticket.firstResponseDueAt) < new Date();
  }
  return false;
}

export function SlaBreachBadge({ ticket }: Readonly<{ ticket: Partial<Ticket> }>) {
  if (!isSlaBreached(ticket)) {
    return null;
  }

  return (
    <Badge tone="danger" className="animate-pulse">
      ⚠️ SLA BREACHED
    </Badge>
  );
}
