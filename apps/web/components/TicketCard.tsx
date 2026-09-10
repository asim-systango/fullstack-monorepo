'use client';

import { useState } from 'react';
import { Badge, Button, Card, CardBody, Dialog } from '@shared/ui/components';
import { QrCodeDisplay } from './QrCodeDisplay';
import type { TicketItem } from '@/hooks/useTickets';

interface TicketCardProps {
  ticket: TicketItem;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const event = ticket.event;
  const startDate = event ? new Date(event.startDate) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';
  const formattedTime = startDate
    ? startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  let statusBadge = (
    <Badge tone="success" className="font-semibold text-xs">
      ISSUED & ACTIVE
    </Badge>
  );

  if (ticket.status === 'USED') {
    statusBadge = (
      <Badge tone="neutral" className="font-semibold text-xs">
        CHECKED IN / USED
      </Badge>
    );
  } else if (ticket.status === 'CANCELLED') {
    statusBadge = (
      <Badge tone="danger" className="font-semibold text-xs">
        CANCELLED
      </Badge>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden border border-border/80 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
        {/* Stub Notch Left & Right */}
        <div className="absolute left-0 top-1/2 -ml-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border bg-background" />
        <div className="absolute right-0 top-1/2 -mr-3 h-6 w-6 -translate-y-1/2 rounded-full border border-border bg-background" />

        <CardBody className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-2 border-b border-dashed border-border/60 pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                EVENT PASS • TICKET #{ticket.id.slice(0, 8)}
              </span>
              <h3 className="text-base font-bold text-foreground">
                {event ? event.title : 'Event Admission'}
              </h3>
            </div>
            {statusBadge}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <span className="block font-semibold text-foreground/80">Date & Time</span>
              <span>{formattedDate}</span>
              {formattedTime && <span className="block text-[11px]">{formattedTime}</span>}
            </div>
            <div>
              <span className="block font-semibold text-foreground/80">Location</span>
              <span className="truncate block">{event ? event.location : 'See Details'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-border/60 pt-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary flex items-center justify-center">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="text-[11px]">
                <span className="font-mono font-medium text-foreground">{ticket.qrPayload.slice(0, 14)}...</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-xs font-semibold"
            >
              View QR Code
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Ticket Details & QR Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onClose={() => setIsOpen(false)}
        title="Event Entry Pass"
      >
        <div className="space-y-6 text-center">
          <div>
            <h3 className="text-lg font-bold text-foreground">{event?.title}</h3>
            <p className="text-xs text-muted-foreground">{event?.location} • {formattedDate}</p>
          </div>

          <div className="flex justify-center">
            <QrCodeDisplay payload={ticket.qrPayload} size={200} />
          </div>

          <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Important Instructions:</p>
            <p className="mt-1">Present this QR code to event staff at check-in. Valid for single entry scan.</p>
          </div>

          <Button variant="secondary" onClick={() => setIsOpen(false)} className="w-full">
            Close Pass
          </Button>
        </div>
      </Dialog>
    </>
  );
}
