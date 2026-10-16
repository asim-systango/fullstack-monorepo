'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  ConfirmModal,
  Dialog,
  EmptyState,
  LoadingState,
  PageHeader,
  Table,
  useToast,
} from '@shared/ui/components';
import { EditEventModal } from '@/components/EditEventModal';
import { StatCard } from '@/components/StatCard';
import {
  useCancelEvent,
  useDeleteEvent,
  useEventAnalytics,
  useMyOrganizedEvents,
  usePublishEvent,
  type EventItem,
} from '@/hooks/useEvents';
import {
  Rocket,
  FileText,
  Flag,
  Ban,
  Trash2,
  User,
  Pencil,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

const INACTIVE_FILTER_TAB_CLASS =
  'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground';

function AnalyticsContent({
  isLoading,
  isError,
  analytics,
  onClose,
}: Readonly<{
  isLoading: boolean;
  isError: boolean;
  analytics?: {
    title: string;
    capacity: number;
    rsvps: { yes: number; no: number; maybe: number; total: number };
    waitlistCount: number;
    tickets: { issued: number; used: number; occupancyRate: number };
  };
  onClose: () => void;
}>) {
  if (isLoading) {
    return <LoadingState label="Calculating analytics metrics..." />;
  }

  if (isError || !analytics) {
    return (
      <div className="space-y-4">
        <Alert tone="danger" title="Error Loading Analytics">
          Failed to load analytics metrics for this event.
        </Alert>
        <Button variant="secondary" onClick={onClose} className="w-full text-xs">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">{analytics.title}</h3>
        <p className="text-xs text-muted-foreground">
          Capacity: {analytics.capacity} seats
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">YES RSVPs</span>
          <span className="text-xl font-bold text-emerald-600">
            {analytics.rsvps.yes}
          </span>
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">MAYBE RSVPs</span>
          <span className="text-xl font-bold text-blue-600">
            {analytics.rsvps.maybe ?? 0}
          </span>
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">NO RSVPs</span>
          <span className="text-xl font-bold text-destructive">
            {analytics.rsvps.no ?? 0}
          </span>
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">Waitlist Queue</span>
          <span className="text-xl font-bold text-amber-600">
            {analytics.waitlistCount}
          </span>
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">Tickets Issued</span>
          <span className="text-xl font-bold text-foreground">
            {analytics.tickets.issued}
          </span>
        </div>
        <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-xs">
          <span className="text-muted-foreground block font-medium">
            Tickets Checked-In
          </span>
          <span className="text-xl font-bold text-primary">{analytics.tickets.used}</span>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border border-border/60 bg-card p-3 text-xs">
        <div className="flex justify-between font-medium">
          <span>Occupancy Rate:</span>
          <span className="font-bold text-primary">
            {analytics.tickets.occupancyRate}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${analytics.tickets.occupancyRate}%` }}
          />
        </div>
      </div>

      <Button variant="secondary" onClick={onClose} className="w-full text-xs">
        Close Analytics
      </Button>
    </div>
  );
}

function AnalyticsModal({
  eventId,
  onClose,
}: Readonly<{ eventId: string; onClose: () => void }>) {
  const { data: analytics, isLoading, isError } = useEventAnalytics(eventId);

  return (
    <Dialog
      open={Boolean(eventId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onClose={onClose}
      title="Event Analytics Dashboard"
    >
      <AnalyticsContent
        isLoading={isLoading}
        isError={isError}
        analytics={analytics}
        onClose={onClose}
      />
    </Dialog>
  );
}

function OrganizerEventBadge({
  deletedAt,
  status,
  isCompleted,
}: Readonly<{
  deletedAt?: string | null;
  status: string;
  isCompleted?: boolean;
}>) {
  if (deletedAt) {
    return (
      <Badge
        tone="danger"
        className="text-[10px] font-bold uppercase flex items-center gap-1"
      >
        <Trash2 className="h-3 w-3" />
        <span>Deleted</span>
      </Badge>
    );
  }
  if (status === 'DRAFT') {
    return (
      <Badge
        tone="neutral"
        className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border-amber-500/30 flex items-center gap-1"
      >
        <FileText className="h-3 w-3" />
        <span>Draft</span>
      </Badge>
    );
  }
  if (status === 'CANCELLED') {
    return (
      <Badge
        tone="danger"
        className="text-[10px] font-bold uppercase flex items-center gap-1"
      >
        <Ban className="h-3 w-3" />
        <span>Cancelled</span>
      </Badge>
    );
  }
  if (isCompleted) {
    return (
      <Badge
        tone="neutral"
        className="text-[10px] font-bold uppercase bg-slate-500/10 text-slate-500 border-slate-500/30 flex items-center gap-1"
      >
        <Flag className="h-3 w-3" />
        <span>Completed</span>
      </Badge>
    );
  }
  return (
    <Badge
      tone="success"
      className="text-[10px] font-bold uppercase flex items-center gap-1"
    >
      <Rocket className="h-3 w-3" />
      <span>Published</span>
    </Badge>
  );
}

function getEventSubtitle(
  published: number,
  draft: number,
  completed: number,
  cancelled: number,
): string {
  if (published > 0 || draft > 0) {
    return `${published} Published • ${draft} Drafts`;
  }
  if (completed > 0) {
    return `${completed} Completed`;
  }
  if (cancelled > 0) {
    return `${cancelled} Cancelled`;
  }
  return '0 Published • 0 Drafts';
}

function OrganizerEventListContent({
  isLoading,
  isError,
  filteredItems,
  statusFilter,
  refetch,
  isAdmin,
  handleEdit,
  handlePublish,
  handleCancel,
  handleDelete,
  setSelectedAnalyticsId,
  isPublishPending,
  isCancelPending,
}: Readonly<{
  isLoading: boolean;
  isError: boolean;
  filteredItems: EventItem[];
  statusFilter: string;
  refetch: () => void;
  isAdmin: boolean;
  handleEdit: (event: EventItem) => void;
  handlePublish: (event: EventItem) => void;
  handleCancel: (id: string, title: string) => void;
  handleDelete: (id: string, title: string) => void;
  setSelectedAnalyticsId: (id: string) => void;
  isPublishPending: boolean;
  isCancelPending: boolean;
}>) {
  if (isLoading) {
    return <LoadingState label="Loading organizer dashboard..." />;
  }

  if (isError) {
    return (
      <Alert tone="danger" title="Error Loading Organizer Dashboard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
          <span>
            Failed to load organizer events. Please check connection and try again.
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="shrink-0"
          >
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description={`No events found under status filter "${statusFilter}".`}
        action={
          <Link href="/events/new">
            <Button variant="primary" size="sm">
              + Create New Event
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <Card className="border border-border/80 bg-card">
      <CardBody className="p-0 overflow-x-auto">
        <Table>
          <thead>
            <tr className="border-b border-border/60 text-left text-xs font-semibold text-muted-foreground">
              <th className="p-4">Event Title</th>
              {isAdmin && <th className="p-4">Organizer ID</th>}
              <th className="p-4">Status</th>
              <th className="p-4">Category</th>
              <th className="p-4">Start Date</th>
              <th className="p-4">Capacity Status</th>
              <th className="p-4 text-right">Actions & Lifecycle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {filteredItems.map((event) => (
              <tr key={event.id} className="hover:bg-secondary/30 transition-colors">
                <td className="p-4 font-bold text-foreground">
                  <Link href={`/events/${event.id}`} className="hover:text-primary">
                    {event.title}
                  </Link>
                </td>
                {isAdmin && (
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className="font-mono text-[10px] text-muted-foreground inline-flex items-center gap-1"
                      title={event.organizerId}
                    >
                      <User className="h-3 w-3" />
                      <span>{event.organizerId.substring(0, 8)}...</span>
                    </span>
                  </td>
                )}
                <td className="p-4 whitespace-nowrap">
                  <OrganizerEventBadge
                    deletedAt={event.deletedAt}
                    status={event.status}
                    isCompleted={event.isCompleted}
                  />
                </td>
                <td className="p-4">
                  <Badge tone="accent" className="text-[10px]">
                    {event.category || 'General'}
                  </Badge>
                </td>
                <td className="p-4 whitespace-nowrap">
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : 'Not set (Draft)'}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="font-semibold">{event.yesCount}</span> /{' '}
                  {event.capacity}
                  {event.isFull && !event.isCompleted && (
                    <Badge tone="danger" className="ml-2 text-[10px]">
                      FULL ({event.waitlistCount} Waitlist)
                    </Badge>
                  )}
                </td>
                <td className="p-4 text-right whitespace-nowrap space-x-2">
                  {!event.deletedAt && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="text-xs font-semibold"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Edit
                    </Button>
                  )}

                  {!event.deletedAt && event.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePublish(event)}
                      loading={isPublishPending}
                      className="text-xs font-bold"
                    >
                      <Rocket className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Publish
                    </Button>
                  )}

                  {!event.deletedAt &&
                    event.status === 'PUBLISHED' &&
                    !event.isCompleted && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(event.id, event.title)}
                        loading={isCancelPending}
                        className="text-xs"
                      >
                        <Ban className="mr-1.5 h-3.5 w-3.5 shrink-0" /> Cancel
                      </Button>
                    )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAnalyticsId(event.id)}
                    className="text-xs"
                  >
                    Analytics
                  </Button>

                  {!event.deletedAt ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.title)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  ) : (
                    <Badge tone="neutral" className="text-[10px] text-muted-foreground">
                      Archived
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
}

export default function OrganizerDashboardPage() {
  const { user, loading: isAuthLoading } = useAuth();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PUBLISHED' | 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'DELETED'
  >('ALL');

  const {
    data: eventsData,
    isLoading,
    isError,
    refetch,
  } = useMyOrganizedEvents({ page: 1, limit: 100 }, Boolean(user));

  const deleteMutation = useDeleteEvent();
  const publishMutation = usePublishEvent();
  const cancelMutation = useCancelEvent();
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingDefaultStatus, setEditingDefaultStatus] = useState<
    'DRAFT' | 'PUBLISHED' | 'CANCELLED' | undefined
  >(undefined);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'primary';
    action: () => void;
    loading: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    variant: 'danger',
    action: () => {},
    loading: false,
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <LoadingState label="Authenticating session..." />
        </main>
      </div>
    );
  }

  const isOrganizer = user?.role === 'admin' || user?.role === 'staff';

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center space-y-4">
          <Alert tone="danger" title="Access Restricted">
            Organizer dashboard is available only to Staff and Admin accounts. Please{' '}
            <Link href="/login?next=/organizer" className="font-bold underline">
              log in
            </Link>{' '}
            as staff@demo.local.
          </Alert>
        </main>
      </div>
    );
  }

  const rawItems = eventsData?.items || [];

  const filteredItems = rawItems.filter((event) => {
    if (statusFilter === 'DELETED') return Boolean(event.deletedAt);
    if (event.deletedAt && statusFilter !== 'ALL') return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'COMPLETED')
      return event.isCompleted && event.status === 'PUBLISHED';
    if (statusFilter === 'PUBLISHED')
      return event.status === 'PUBLISHED' && !event.isCompleted;
    return event.status === statusFilter;
  });

  const totalEvents = rawItems.length;
  const publishedCount = rawItems.filter(
    (e) => !e.deletedAt && e.status === 'PUBLISHED' && !e.isCompleted,
  ).length;
  const draftCount = rawItems.filter((e) => !e.deletedAt && e.status === 'DRAFT').length;
  const completedCount = rawItems.filter(
    (e) => !e.deletedAt && e.isCompleted && e.status === 'PUBLISHED',
  ).length;
  const cancelledCount = rawItems.filter(
    (e) => !e.deletedAt && e.status === 'CANCELLED',
  ).length;
  const deletedCount = rawItems.filter((e) => Boolean(e.deletedAt)).length;

  const totalYesRsvps = rawItems.reduce((acc, curr) => acc + curr.yesCount, 0);
  const totalWaitlist = rawItems.reduce((acc, curr) => acc + curr.waitlistCount, 0);
  const totalCapacity = rawItems.reduce((acc, curr) => acc + curr.capacity, 0);
  const overallOccupancy =
    totalCapacity > 0 ? Math.round((totalYesRsvps / totalCapacity) * 100) : 0;

  const handlePublish = (eventItem: EventItem) => {
    publishMutation.mutate(eventItem.id, {
      onSuccess: () => {
        toast.success(`Event "${eventItem.title}" published successfully!`, 'Published');
        refetch();
      },
      onError: (err: {
        response?: { data?: { message?: string } };
        message?: string;
      }) => {
        toast.error(
          err?.response?.data?.message || err?.message || 'Failed to publish event.',
          'Error',
        );
      },
    });
  };

  const handleEdit = (eventItem: EventItem) => {
    setEditingDefaultStatus(undefined);
    setEditingEvent(eventItem);
  };

  const executeCancel = (id: string, title: string) => {
    setConfirmState((prev) => ({ ...prev, loading: true }));
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.info(`Event "${title}" has been cancelled.`, 'Event Cancelled');
        setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
        refetch();
      },
      onError: (err: {
        response?: { data?: { message?: string } };
        message?: string;
      }) => {
        toast.error(
          err?.response?.data?.message || err?.message || 'Failed to cancel event.',
          'Error',
        );
        setConfirmState((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleCancel = (id: string, title: string) => {
    setConfirmState({
      open: true,
      title: 'Cancel Event Confirmation',
      description: `Are you sure you want to cancel "${title}"? All issued tickets for this event will be invalidated immediately.`,
      confirmText: 'Yes, Cancel Event',
      variant: 'danger',
      loading: false,
      action: () => executeCancel(id, title),
    });
  };

  const executeDelete = (id: string, title: string) => {
    setConfirmState((prev) => ({ ...prev, loading: true }));
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Event "${title}" deleted.`, 'Deleted');
        setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
        refetch();
      },
      onError: (err: {
        response?: { data?: { message?: string } };
        message?: string;
      }) => {
        toast.error(
          err?.response?.data?.message || err?.message || 'Failed to delete event.',
          'Error',
        );
        setConfirmState((prev) => ({ ...prev, loading: false }));
      },
    });
  };

  const handleDelete = (id: string, title: string) => {
    setConfirmState({
      open: true,
      title: 'Delete Event Confirmation',
      description: `Are you sure you want to delete "${title}"? This event will be archived.`,
      confirmText: 'Yes, Delete Event',
      variant: 'danger',
      loading: false,
      action: () => executeDelete(id, title),
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <PageHeader
          title={
            isAdmin ? 'Admin Event Management Console' : 'Organizer Management Dashboard'
          }
          description={
            isAdmin
              ? 'Full administrative control over all platform events, drafts, publishing, cancellations, and system-wide analytics'
              : 'Manage your event lifecycles, publish drafts, cancel events, and monitor attendee analytics'
          }
          actions={
            <Link href="/events/new">
              <Button
                variant="primary"
                size="sm"
                className="font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Event</span>
              </Button>
            </Link>
          }
        />

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={isAdmin ? 'All Platform Events' : 'My Organized Events'}
            value={totalEvents}
            subtitle={getEventSubtitle(
              publishedCount,
              draftCount,
              completedCount,
              cancelledCount,
            )}
            trend={isAdmin ? 'Global Scope' : 'My Portfolio'}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Confirmed Attendees (YES)"
            value={totalYesRsvps}
            subtitle="Total active RSVPs"
            trend="High Demand"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Active Waitlist Queue"
            value={totalWaitlist}
            subtitle="Waitlisted attendees"
            trendType={totalWaitlist > 0 ? 'negative' : 'neutral'}
            trend={totalWaitlist > 0 ? `${totalWaitlist} Waiting` : 'Clean'}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatCard
            title="Average Occupancy"
            value={`${overallOccupancy}%`}
            subtitle="Capacity utilization"
            trend="Optimal"
            icon={<BarChart3 className="h-4 w-4" />}
          />
        </div>

        {/* Managed Events Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
            <h2 className="text-xl font-bold text-foreground">
              {isAdmin ? 'All Platform Events Overview' : 'My Organized Events Overview'}
            </h2>

            {/* Lifecycle Status Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`rounded-full px-3 py-1 font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : INACTIVE_FILTER_TAB_CLASS
                }`}
              >
                All ({totalEvents})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PUBLISHED')}
                className={`rounded-full px-3 py-1 font-semibold transition-all inline-flex items-center gap-1 ${
                  statusFilter === 'PUBLISHED'
                    ? 'bg-primary text-primary-foreground'
                    : INACTIVE_FILTER_TAB_CLASS
                }`}
              >
                <Rocket className="h-3 w-3" />
                <span>Published ({publishedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('DRAFT')}
                className={`rounded-full px-3 py-1 font-semibold transition-all inline-flex items-center gap-1 ${
                  statusFilter === 'DRAFT'
                    ? 'bg-primary text-primary-foreground'
                    : INACTIVE_FILTER_TAB_CLASS
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>Drafts ({draftCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('COMPLETED')}
                className={`rounded-full px-3 py-1 font-semibold transition-all inline-flex items-center gap-1 ${
                  statusFilter === 'COMPLETED'
                    ? 'bg-primary text-primary-foreground'
                    : INACTIVE_FILTER_TAB_CLASS
                }`}
              >
                <Flag className="h-3 w-3" />
                <span>Completed ({completedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CANCELLED')}
                className={`rounded-full px-3 py-1 font-semibold transition-all inline-flex items-center gap-1 ${
                  statusFilter === 'CANCELLED'
                    ? 'bg-destructive text-destructive-foreground'
                    : INACTIVE_FILTER_TAB_CLASS
                }`}
              >
                <Ban className="h-3 w-3" />
                <span>Cancelled ({cancelledCount})</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('DELETED')}
                  className={`rounded-full px-3 py-1 font-semibold transition-all inline-flex items-center gap-1 ${
                    statusFilter === 'DELETED'
                      ? 'bg-destructive text-destructive-foreground'
                      : INACTIVE_FILTER_TAB_CLASS
                  }`}
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Deleted ({deletedCount})</span>
                </button>
              )}
            </div>
          </div>

          <OrganizerEventListContent
            isLoading={isLoading}
            isError={isError}
            filteredItems={filteredItems}
            statusFilter={statusFilter}
            refetch={refetch}
            isAdmin={isAdmin}
            handleEdit={handleEdit}
            handlePublish={handlePublish}
            handleCancel={handleCancel}
            handleDelete={handleDelete}
            setSelectedAnalyticsId={setSelectedAnalyticsId}
            isPublishPending={publishMutation.isPending}
            isCancelPending={cancelMutation.isPending}
          />
        </section>

        {selectedAnalyticsId && (
          <AnalyticsModal
            eventId={selectedAnalyticsId}
            onClose={() => setSelectedAnalyticsId(null)}
          />
        )}

        <ConfirmModal
          open={confirmState.open}
          onOpenChange={(open) => setConfirmState((prev) => ({ ...prev, open }))}
          title={confirmState.title}
          description={confirmState.description}
          confirmText={confirmState.confirmText}
          variant={confirmState.variant}
          loading={confirmState.loading}
          onConfirm={confirmState.action}
        />

        <EditEventModal
          event={editingEvent}
          open={Boolean(editingEvent)}
          defaultStatus={editingDefaultStatus}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => refetch()}
        />
      </main>
    </div>
  );
}
