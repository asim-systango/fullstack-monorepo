'use client';

import Link from 'next/link';
import { FileText, Ban, Flag } from 'lucide-react';
import { Badge, Button, Card, CardBody, CardHeader, CardTitle } from '@shared/ui/components';
import { CapacityProgress } from './CapacityProgress';
import type { EventItem } from '@/hooks/useEvents';

interface EventCardProps {
  event: EventItem;
  onDelete?: (id: string) => void;
  isOrganizer?: boolean;
}

export function EventCard({ event, onDelete, isOrganizer = false }: EventCardProps) {
  const startDate = event.startDate ? new Date(event.startDate) : null;
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
    <Card className="group relative flex flex-col justify-between overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge tone="accent" className="text-xs font-semibold">
            {event.category || 'General'}
          </Badge>
          
          {event.status === 'DRAFT' ? (
            <Badge tone="neutral" className="text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Draft</span>
            </Badge>
          ) : event.status === 'CANCELLED' ? (
            <Badge tone="danger" className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
              <Ban className="h-3 w-3" />
              <span>Cancelled</span>
            </Badge>
          ) : event.isCompleted ? (
            <Badge tone="neutral" className="text-[10px] font-bold tracking-wider uppercase bg-slate-500/10 text-slate-500 border-slate-500/30 flex items-center gap-1">
              <Flag className="h-3 w-3" />
              <span>Completed</span>
            </Badge>
          ) : event.isFull ? (
            <Badge tone="danger" className="text-[10px] font-bold tracking-wider uppercase">
              Waitlist Active
            </Badge>
          ) : (
            <Badge tone="success" className="text-[10px] font-medium">
              Open ({event.spotsLeft} left)
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
          <Link href={`/events/${event.id}`}>{event.title}</Link>
        </CardTitle>
      </CardHeader>

      <CardBody className="space-y-4 pt-0">
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {event.description || 'No description provided.'}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium text-foreground/90">
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate} {startDate ? `• ${formattedTime}` : ''}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location || 'Location TBD'}</span>
          </div>
        </div>

        <CapacityProgress capacity={event.capacity} yesCount={event.yesCount} />

        <div className="flex items-center justify-between gap-2 pt-2">
          <Link href={`/events/${event.id}`} className="w-full">
            <Button
              variant={event.status === 'CANCELLED' ? 'ghost' : 'primary'}
              className="w-full text-xs font-semibold"
            >
              {event.status === 'DRAFT' ? (
                <>
                  <FileText className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span>View / Edit Draft</span>
                </>
              ) : event.status === 'CANCELLED' ? (
                <>
                  <Ban className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span>View Cancelled Event</span>
                </>
              ) : event.isCompleted ? (
                <>
                  <Flag className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span>View Event Summary</span>
                </>
              ) : (
                'View Details & RSVP'
              )}
            </Button>
          </Link>

          {isOrganizer && onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onDelete(event.id);
              }}
              className="text-xs shrink-0"
            >
              Delete
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
