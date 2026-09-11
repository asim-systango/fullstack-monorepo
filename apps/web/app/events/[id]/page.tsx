'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ShellHeader } from '@/components/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ConfirmModal,
  LoadingState,
  useToast,
} from '@shared/ui/components';
import { EditEventModal } from '@/components/EditEventModal';
import { CapacityProgress } from '@/components/CapacityProgress';
import { useCancelEvent, useEventDetail, usePublishEvent } from '@/hooks/useEvents';
import { useEventRsvp, useSubmitRsvp } from '@/hooks/useRsvp';
import {
  FileText,
  Rocket,
  Ban,
  Flag,
  Pencil,
  Lock,
  Check,
  Hourglass,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

function EventStatusBadge({
  status,
  isCompleted,
}: Readonly<{ status: string; isCompleted?: boolean }>) {
  if (status === 'DRAFT') {
    return (
      <Badge
        tone="neutral"
        className="text-xs font-bold uppercase flex items-center gap-1"
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
        className="text-xs font-bold uppercase flex items-center gap-1"
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
        className="text-xs font-bold uppercase flex items-center gap-1"
      >
        <Flag className="h-3 w-3" />
        <span>Completed</span>
      </Badge>
    );
  }
  return (
    <Badge tone="success" className="text-xs font-medium flex items-center gap-1">
      <Rocket className="h-3 w-3" />
      <span>Live</span>
    </Badge>
  );
}

function RsvpClosedNotice({ status }: Readonly<{ status: string }>) {
  if (status === 'DRAFT') {
    return (
      <>
        <Lock className="h-3.5 w-3.5" />
        <span>RSVPs are closed while event is in draft mode.</span>
      </>
    );
  }
  if (status === 'CANCELLED') {
    return (
      <>
        <Ban className="h-3.5 w-3.5 text-danger" />
        <span>RSVPs are closed for cancelled events.</span>
      </>
    );
  }
  return (
    <>
      <Flag className="h-3.5 w-3.5" />
      <span>Registration closed (Event ended).</span>
    </>
  );
}

function UserRsvpNotice({
  rsvp,
  waitlist,
}: Readonly<{
  rsvp?: { status: string; ticket?: unknown } | null;
  waitlist?: { position: number } | null;
}>) {
  if (rsvp?.status === 'YES' && rsvp.ticket) {
    return (
      <Alert
        tone="success"
        title={
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4" />
            <span>RSVP CONFIRMED</span>
          </span>
        }
      >
        <p className="mt-1 text-xs">You have a confirmed ticket for this event!</p>
        <Link href="/tickets">
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs mt-2 font-semibold"
          >
            View Ticket Pass
          </Button>
        </Link>
      </Alert>
    );
  }
  if (waitlist) {
    return (
      <Alert
        tone="info"
        title={
          <span className="flex items-center gap-1.5">
            <Hourglass className="h-4 w-4" />
            <span>WAITLISTED (Position #{waitlist.position})</span>
          </span>
        }
      >
        <p className="mt-1 text-xs">
          This event is full. You are on the waitlist. You will automatically receive a
          ticket if a spot opens up!
        </p>
      </Alert>
    );
  }
  return null;
}

function RegistrationSection({
  user,
  isLoading,
  isDisabled,
  status,
  userRsvp,
  userWaitlist,
  selectedGuests,
  setSelectedGuests,
  isPending,
  isFull,
  onRsvpAction,
}: Readonly<{
  user: unknown;
  isLoading: boolean;
  isDisabled: boolean;
  status: string;
  userRsvp?: { status: string; ticket?: unknown; guestCount?: number } | null;
  userWaitlist?: { position: number } | null;
  selectedGuests: number;
  setSelectedGuests: (count: number) => void;
  isPending: boolean;
  isFull: boolean;
  onRsvpAction: (status: 'YES' | 'NO' | 'MAYBE') => void;
}>) {
  if (!user) {
    return (
      <Alert tone="info" title="Login Required">
        Please{' '}
        <Link href="/login" className="font-bold underline">
          log in
        </Link>{' '}
        to RSVP for this event.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <span className="text-xs text-muted-foreground animate-pulse">
        Checking your registration status...
      </span>
    );
  }

  if (isDisabled) {
    return (
      <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <RsvpClosedNotice status={status} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserRsvpNotice rsvp={userRsvp} waitlist={userWaitlist} />

      <div className="space-y-1 bg-muted/40 p-2.5 rounded-lg border border-border/60">
        <label
          htmlFor="guestCountSelect"
          className="text-xs font-semibold text-foreground flex items-center justify-between"
        >
          <span>Bringing Guests? (+1)</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Max 5 guests
          </span>
        </label>
        <select
          id="guestCountSelect"
          value={
            userRsvp?.guestCount !== undefined && userRsvp?.status === 'YES'
              ? userRsvp.guestCount
              : selectedGuests
          }
          onChange={(e) => setSelectedGuests(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value={0}>No Guests (1 Ticket for Me)</option>
          <option value={1}>+1 Guest (2 Spots Total)</option>
          <option value={2}>+2 Guests (3 Spots Total)</option>
          <option value={3}>+3 Guests (4 Spots Total)</option>
          <option value={4}>+4 Guests (5 Spots Total)</option>
          <option value={5}>+5 Guests (6 Spots Total)</option>
        </select>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-foreground">
          Select Your RSVP Status:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={
              userRsvp?.status === 'YES' && !userWaitlist ? 'primary' : 'secondary'
            }
            size="sm"
            disabled={isPending}
            onClick={() => onRsvpAction('YES')}
            className="text-xs font-bold"
          >
            Yes {isFull && !userRsvp ? '(Waitlist)' : ''}
          </Button>
          <Button
            variant={userRsvp?.status === 'MAYBE' ? 'primary' : 'secondary'}
            size="sm"
            disabled={isPending}
            onClick={() => onRsvpAction('MAYBE')}
            className="text-xs font-semibold"
          >
            Maybe
          </Button>
          <Button
            variant={userRsvp?.status === 'NO' ? 'danger' : 'secondary'}
            size="sm"
            disabled={isPending}
            onClick={() => onRsvpAction('NO')}
            className="text-xs font-semibold"
          >
            No
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params);
  const { user } = useAuth();
  const toast = useToast();

  const { data: event, isLoading: isEventLoading, isError } = useEventDetail(id);
  const { data: rsvpData, isLoading: isRsvpLoading } = useEventRsvp(id);
  const submitRsvpMutation = useSubmitRsvp();
  const publishEventMutation = usePublishEvent();
  const cancelEventMutation = useCancelEvent();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<
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

  const [selectedGuests, setSelectedGuests] = useState<number>(0);

  const handleRsvpAction = (status: 'YES' | 'NO' | 'MAYBE') => {
    submitRsvpMutation.mutate(
      { eventId: id, status, guestCount: status === 'YES' ? selectedGuests : 0 },
      {
        onSuccess: (data) => {
          if (data.status === 'WAITLISTED') {
            toast.info(data.message, 'Waitlisted');
          } else {
            toast.success(data.message, 'RSVP Updated');
          }
        },
        onError: (err: {
          response?: { data?: { message?: string } };
          message?: string;
        }) => {
          toast.error(
            err?.response?.data?.message || err?.message || 'Failed to update RSVP.',
            'RSVP Error',
          );
        },
      },
    );
  };

  const handlePublish = () => {
    setModalDefaultStatus('PUBLISHED');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = () => {
    setModalDefaultStatus(undefined);
    setIsEditModalOpen(true);
  };

  const executeCancel = () => {
    setConfirmState((prev) => ({ ...prev, loading: true }));
    cancelEventMutation.mutate(id, {
      onSuccess: () => {
        toast.info('Event has been cancelled.', 'Cancelled');
        setConfirmState((prev) => ({ ...prev, open: false, loading: false }));
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

  const handleCancel = () => {
    setConfirmState({
      open: true,
      title: 'Cancel Event Confirmation',
      description: `Are you sure you want to cancel "${event?.title}"? All issued tickets for this event will be invalidated immediately.`,
      confirmText: 'Yes, Cancel Event',
      variant: 'danger',
      loading: false,
      action: executeCancel,
    });
  };

  if (isEventLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <LoadingState label="Loading event details..." />
        </main>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ShellHeader />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center space-y-4">
          <h2 className="text-xl font-bold">Event Not Found</h2>
          <p className="text-xs text-muted-foreground">
            This event is no longer available.
          </p>
          <Link href="/events">
            <Button variant="secondary" size="sm">
              Back to Events
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const formattedStart = startDate
    ? startDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date TBD';
  const formattedEnd = endDate
    ? endDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Time TBD';

  const isOrganizer = user && (user.role === 'admin' || user.id === event.organizerId);
  const userRsvp = rsvpData?.rsvp;
  const userWaitlist = rsvpData?.waitlist;
  const isRsvpDisabled =
    event.status === 'DRAFT' || event.status === 'CANCELLED' || event.isCompleted;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShellHeader />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to All Events</span>
        </Link>

        {/* State Banners */}
        {event.status === 'DRAFT' && (
          <Alert
            tone="info"
            title={
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Draft Event</span>
              </span>
            }
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mt-1">
              <p className="text-xs">
                This event is currently in draft mode and not published to the public
                catalog.
              </p>
              {isOrganizer && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  loading={publishEventMutation.isPending}
                  className="text-xs font-bold shrink-0"
                >
                  <Rocket className="mr-1.5 h-3.5 w-3.5" />
                  <span>Publish Event Now</span>
                </Button>
              )}
            </div>
          </Alert>
        )}

        {event.status === 'CANCELLED' && (
          <Alert
            tone="danger"
            title={
              <span className="flex items-center gap-1.5">
                <Ban className="h-4 w-4" />
                <span>Event Cancelled</span>
              </span>
            }
          >
            <p className="mt-1 text-xs">
              This event has been cancelled by the organizer. Registration and issued
              ticket passes are invalidated.
            </p>
          </Alert>
        )}

        {event.isCompleted && event.status === 'PUBLISHED' && (
          <Alert
            tone="info"
            title={
              <span className="flex items-center gap-1.5">
                <Flag className="h-4 w-4" />
                <span>Event Completed</span>
              </span>
            }
          >
            <p className="mt-1 text-xs">
              This event has already taken place. Registration is closed.
            </p>
          </Alert>
        )}

        {/* Main Event Header */}
        <div className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="accent" className="text-xs font-semibold">
                {event.category || 'General'}
              </Badge>
              <EventStatusBadge status={event.status} isCompleted={event.isCompleted} />

              {event.isFull && !event.isCompleted && event.status === 'PUBLISHED' && (
                <Badge tone="danger" className="text-xs font-bold">
                  Capacity Reached (Waitlist Active)
                </Badge>
              )}
            </div>

            {isOrganizer && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="text-xs font-semibold"
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  <span>Edit Event</span>
                </Button>
                {event.status === 'PUBLISHED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                    loading={cancelEventMutation.isPending}
                    className="text-xs"
                  >
                    <Ban className="mr-1.5 h-3.5 w-3.5" />
                    <span>Cancel Event</span>
                  </Button>
                )}
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground/90">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {formattedStart} {startDate ? `– ${formattedEnd}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{event.location || 'Location TBD'}</span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Cols: Description */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border border-border/80 bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-bold">About This Event</CardTitle>
              </CardHeader>
              <CardBody className="text-xs sm:text-sm leading-relaxed text-muted-foreground space-y-4 whitespace-pre-line">
                {event.description || 'No detailed overview provided for this event yet.'}
              </CardBody>
            </Card>
          </div>

          {/* Right Col: RSVP Card & Capacity */}
          <div className="space-y-6">
            <Card className="border border-border/80 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Registration & RSVP</CardTitle>
              </CardHeader>
              <CardBody className="space-y-5">
                <CapacityProgress capacity={event.capacity} yesCount={event.yesCount} />

                {/* RSVP Action Status */}
                <RegistrationSection
                  user={user}
                  isLoading={isRsvpLoading}
                  isDisabled={Boolean(isRsvpDisabled)}
                  status={event.status}
                  userRsvp={userRsvp}
                  userWaitlist={userWaitlist}
                  selectedGuests={selectedGuests}
                  setSelectedGuests={setSelectedGuests}
                  isPending={submitRsvpMutation.isPending}
                  isFull={Boolean(event.isFull)}
                  onRsvpAction={handleRsvpAction}
                />
              </CardBody>
            </Card>
          </div>
        </div>

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
          event={event}
          open={isEditModalOpen}
          defaultStatus={modalDefaultStatus}
          onClose={() => setIsEditModalOpen(false)}
        />
      </main>
    </div>
  );
}
