'use client';

import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  LoadingState,
} from '@shared/ui/components';
import { EventCard } from '@/components/EventCard';
import { useEvents, type EventItem } from '@/hooks/useEvents';
import { useAuth } from '@/components/auth/auth-provider';
import { ArrowRight } from 'lucide-react';

function HeroActionButton({ user }: Readonly<{ user: { role?: string } | null }>) {
  if (!user) {
    return (
      <Link href="/login">
        <Button variant="secondary" size="md" className="font-semibold text-sm">
          Log In to Register
        </Button>
      </Link>
    );
  }

  if (user.role === 'admin' || user.role === 'staff') {
    return (
      <Link href="/events/new">
        <Button variant="secondary" size="md" className="font-semibold text-sm">
          + Host New Event
        </Button>
      </Link>
    );
  }

  return (
    <Link href="/tickets">
      <Button variant="secondary" size="md" className="font-semibold text-sm">
        View My Tickets
      </Button>
    </Link>
  );
}

function HomeFeaturedEvents({
  isLoading,
  isError,
  events,
}: Readonly<{
  isLoading: boolean;
  isError: boolean;
  events?: EventItem[];
}>) {
  if (isLoading) {
    return <LoadingState label="Loading featured events..." />;
  }

  if (isError) {
    return (
      <Alert tone="danger" title="Failed to Load Events">
        Failed to load featured events. Make sure Postgres and API services are running.
      </Alert>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        title="No upcoming events"
        description="Be the first organizer to create an event on the platform!"
        action={
          <Link href="/events/new">
            <Button variant="primary" size="sm">
              + Host New Event
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { data: eventsData, isLoading, isError } = useEvents({ page: 1, limit: 6 });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader
        title="EventHub Platform"
        subtitle="Event Management & Ticketing Engine"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="flex items-center gap-2">
              <Badge tone="accent" className="text-xs font-semibold">
                Event Management Engine
              </Badge>
              <Badge tone="neutral" className="text-xs">
                Next.js 15 + NestJS Monorepo
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Discover, Organize & Experience Premium Events.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Fullstack platform featuring real-time capacity management, transactional
              waitlist promotions, visual QR code passes, and staff check-in scanner
              tools.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/events">
                <Button
                  variant="primary"
                  size="md"
                  className="font-bold text-sm inline-flex items-center gap-1.5"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <HeroActionButton user={user} />
            </div>
          </div>
        </div>

        {/* Demo Roles Note */}
        <Card className="border border-primary/20 bg-primary/5">
          <CardBody className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                💡
              </div>
              <div>
                <span className="font-bold text-foreground">
                  Demo Accounts & Quick Testing:
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Password for all:{' '}
                  <code className="font-mono bg-background px-1.5 py-0.5 rounded border border-border">
                    password123
                  </code>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral" className="font-mono">
                admin@demo.local (Admin)
              </Badge>
              <Badge tone="neutral" className="font-mono">
                staff@demo.local (Organizer)
              </Badge>
              <Badge tone="neutral" className="font-mono">
                user@demo.local (Attendee)
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* Featured Events Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Upcoming Featured Events
              </h2>
              <p className="text-xs text-muted-foreground">
                Reserve your spot before capacity runs out
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View All Events ({eventsData?.meta.total || 0})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <HomeFeaturedEvents
            isLoading={isLoading}
            isError={isError}
            events={eventsData?.items}
          />
        </section>
      </main>
    </div>
  );
}
