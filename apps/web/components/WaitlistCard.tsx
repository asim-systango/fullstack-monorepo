'use client';

import Link from 'next/link';
import { Hourglass, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@shared/ui/components';
import type { WaitlistEntryItem } from '@/hooks/useTickets';

interface WaitlistCardProps {
  entry: WaitlistEntryItem;
}

export function WaitlistCard({ entry }: WaitlistCardProps) {
  const event = entry.event;
  const startDate = event?.startDate ? new Date(event.startDate) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Date TBD';
  const formattedTime = startDate
    ? startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Time TBD';

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-amber-500/30 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-lg">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge tone="accent" className="text-xs font-semibold">
            {event?.category || 'General'}
          </Badge>
          <Badge tone="accent" className="text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
            <Hourglass className="h-3 w-3" />
            <span>Position #{entry.position} in Queue</span>
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          <Link href={`/events/${entry.eventId}`}>{event?.title || 'Waitlisted Event'}</Link>
        </CardTitle>
      </CardHeader>

      <CardBody className="space-y-4 pt-0">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {event?.description || 'No description provided.'}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground/90">
            <CalendarIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>{formattedDate} {startDate ? `• ${formattedTime}` : ''}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{event?.location || 'Location TBD'}</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Waitlist Queue Active</span>
          </p>
          <p className="text-[11px] opacity-90 leading-relaxed">
            You are #{entry.position} in line. You will automatically receive a confirmed ticket pass if an attendee cancels!
          </p>
        </div>

        <div className="pt-1">
          <Link href={`/events/${entry.eventId}`} className="w-full">
            <Button variant="secondary" className="w-full text-xs font-semibold">
              View Event Details
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
