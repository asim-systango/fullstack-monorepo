'use client';

import { Badge, Card, Spinner } from '@shared/ui/components';
import { useTicketEvents } from '@/lib/hooks/use-ticket-detail';

function formatEventDetails(
  eventType: string,
  oldVal?: Record<string, unknown> | null,
  newVal?: Record<string, unknown> | null,
) {
  if (eventType === 'STATUS_CHANGED' || eventType === 'STATUS_UPDATED') {
    return `Status changed from ${String(oldVal?.status ?? 'N/A')} to ${String(newVal?.status ?? 'N/A')}`;
  }
  if (eventType === 'ASSIGNED' || eventType === 'REASSIGNED') {
    const assignee = newVal?.assigneeId ? String(newVal.assigneeId) : 'Unassigned';
    return `Ticket assigned to ${assignee}`;
  }
  if (eventType === 'TICKET_CREATED') {
    return 'Ticket created';
  }
  return `Event: ${eventType}`;
}

export function TicketEventsTimeline({
  ticketId,
  isStaffOrAdmin,
}: Readonly<{
  ticketId: string;
  isStaffOrAdmin: boolean;
}>) {
  const { data: events, isLoading, isError } = useTicketEvents(ticketId, isStaffOrAdmin);

  if (!isStaffOrAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <Spinner label="Loading audit history..." />
      </Card>
    );
  }

  if (isError || !events) {
    return null;
  }

  if (events.length === 0) {
    return (
      <Card className="p-4 text-xs text-muted-foreground italic">
        No state transition audit events recorded.
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-3 border-accent/20 bg-accent/5">
      <div className="flex items-center justify-between border-b pb-2 border-border">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>📜</span> Audit History Trail
        </h4>
        <Badge tone="accent" className="text-[10px]">
          STAFF / ADMIN ONLY
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start justify-between p-2 rounded bg-card/60 border border-border/50"
          >
            <div>
              <p className="font-semibold text-foreground">
                {formatEventDetails(event.eventType, event.oldValue, event.newValue)}
              </p>
              {event.reason && (
                <p className="text-muted-foreground mt-0.5 italic">
                  Reason: &quot;{event.reason}&quot;
                </p>
              )}
              <p className="text-[10px] font-mono text-muted-foreground mt-1">
                Actor ID: {event.actorId}
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
              {new Date(event.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
