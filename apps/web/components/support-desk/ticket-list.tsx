'use client';

import Link from 'next/link';
import type { Ticket, TicketPriority, TicketStatus } from '@shared/api-client';
import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import { SlaBreachBadge } from './sla-breach-badge';

function getStatusTone(status: TicketStatus) {
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

function getPriorityTone(priority: TicketPriority) {
  switch (priority) {
    case 'urgent':
      return 'danger';
    case 'high':
      return 'accent';
    case 'medium':
    case 'low':
    default:
      return 'neutral';
  }
}

export function TicketList({ tickets }: Readonly<{ tickets: Ticket[] }>) {
  if (!tickets.length) {
    return (
      <EmptyState
        title="No tickets found"
        description="You have not created any support tickets yet. Click 'Create Ticket' above to get started."
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Ticket #</TableHeaderCell>
          <TableHeaderCell>Subject</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Priority</TableHeaderCell>
          <TableHeaderCell>Created At</TableHeaderCell>
          <TableHeaderCell>Action</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell className="font-mono text-sm font-semibold">
              #{ticket.ticketNumber}
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="hover:underline text-foreground font-semibold"
                >
                  {ticket.subject}
                </Link>
                <SlaBreachBadge ticket={ticket} />
              </div>
            </TableCell>
            <TableCell>{ticket.categoryName ?? ticket.category?.name ?? '—'}</TableCell>

            <TableCell>
              <Badge tone={getStatusTone(ticket.status)}>
                {ticket.status.toUpperCase()}
              </Badge>
            </TableCell>

            <TableCell>
              <Badge tone={getPriorityTone(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(ticket.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>
              <Link
                href={`/tickets/${ticket.id}`}
                className="ui-button ui-button-xs ui-button-ghost px-2"
              >
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
