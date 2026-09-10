'use client';

import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  LoadingState,
  PageHeader,
  Table,
} from '@shared/ui/components';
import { EventCard } from '@/components/EventCard';
import { EventFilters } from '@/components/EventFilters';
import { useDeleteEvent, useEvents } from '@/hooks/useEvents';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { resetFilters, setPage } from '@/lib/store/eventsFilterSlice';
import { useAuth } from '@/components/auth/auth-provider';

export default function EventsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const filterState = useAppSelector((state) => state.eventsFilter);

  const { data: eventsData, isLoading, isError, refetch } = useEvents({
    q: filterState.q,
    category: filterState.category,
    status: filterState.status,
    startDate: filterState.startDate,
    endDate: filterState.endDate,
    page: filterState.page,
    limit: 9,
  });

  const deleteMutation = useDeleteEvent();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const isOrganizer = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <PageHeader
          title="Browse Events"
          description="Explore upcoming conferences, workshops, masterclasses, and tech meetups"
          actions={
            isOrganizer ? (
              <Link href="/events/new">
                <Button variant="primary" size="sm" className="font-semibold text-xs">
                  + Create Event
                </Button>
              </Link>
            ) : undefined
          }
        />

        {/* Filters */}
        <EventFilters />

        {/* Content Area */}
        {isLoading ? (
          <LoadingState label="Searching events..." />
        ) : isError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-600 flex flex-col items-center gap-3">
            <span>Failed to load events. Please try again.</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : eventsData?.items.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try adjusting your search filters or category selections."
            action={
              <Button variant="secondary" size="sm" onClick={() => dispatch(resetFilters())}>
                Clear filters
              </Button>
            }
          />
        ) : filterState.viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventsData?.items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isOrganizer={isOrganizer}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <Card className="border border-border/80 bg-card">
            <CardBody className="p-0 overflow-x-auto">
              <Table>
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs font-semibold text-muted-foreground">
                    <th className="p-4">Title & Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {eventsData?.items.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <Link href={`/events/${event.id}`} className="font-bold text-foreground hover:text-primary">
                          {event.title}
                        </Link>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground mt-0.5">
                          {event.description}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge tone="accent" className="text-[10px]">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}
                      </td>
                      <td className="p-4 max-w-xs truncate">{event.location || 'TBD'}</td>
                      <td className="p-4 whitespace-nowrap">
                        {event.yesCount} / {event.capacity}
                        {event.isFull && (
                          <Badge tone="danger" className="ml-2 text-[10px]">
                            Full
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {/* Pagination Controls */}
        {eventsData && eventsData.meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="text-xs text-muted-foreground">
              Showing page {eventsData.meta.page} of {eventsData.meta.totalPages} ({eventsData.meta.total} total events)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filterState.page <= 1}
                onClick={() => dispatch(setPage(filterState.page - 1))}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={filterState.page >= eventsData.meta.totalPages}
                onClick={() => dispatch(setPage(filterState.page + 1))}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
