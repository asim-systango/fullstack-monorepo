'use client';

import { ShellHeader } from '@/components/auth';
import { useAuth } from '@/components/auth';
import { useBookings, useCancelBooking } from '@/lib/hooks/use-bookings';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setStatusFilter, setBookingPage } from '@/lib/store/booking-filters-slice';
import type { BookingStatus } from '@/lib/api';
import {
  Page,
  PageHeader,
  Card,
  Button,
  LoadingState,
  EmptyState,
  Alert,
  Badge,
  Select,
  Field,
} from '@shared/ui/components';
import Link from 'next/link';

export default function BookingsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Get filter state from Redux
  const { statusFilter, page, limit } = useAppSelector((state) => state.bookingFilters);

  // Fetch bookings using TanStack Query
  const { data, isLoading, error } = useBookings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    limit,
  });

  const cancelMutation = useCancelBooking();

  const handleCancelBooking = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to cancel this booking? This will refund your mock payment.',
      )
    ) {
      try {
        await cancelMutation.mutateAsync(id);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Failed to cancel booking.';
        alert(errMsg);
      }
    }
  };

  if (!user) {
    return (
      <Page>
        <ShellHeader title="My Bookings" />
        <Alert tone="info" className="my-8">
          Please{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            log in
          </Link>{' '}
          to view and manage your hotel bookings.
        </Alert>
      </Page>
    );
  }

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'neutral';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getPaymentStatusTone = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'refunded':
        return 'danger';
      case 'pending':
      default:
        return 'neutral';
    }
  };

  // Render bookings content or state without nested conditional in JSX
  let bookingsContent;
  if (isLoading) {
    bookingsContent = (
      <LoadingState label="Fetching your bookings..." variant="block" className="py-12" />
    );
  } else if (error) {
    bookingsContent = (
      <Alert tone="danger" className="my-4">
        Error retrieving bookings list. Please try again.
      </Alert>
    );
  } else if (!data || data.items.length === 0) {
    bookingsContent = (
      <EmptyState
        title="No bookings found"
        description={
          statusFilter !== 'all'
            ? `You have no bookings matching the status "${statusFilter}".`
            : 'You have not booked any rooms yet. Plan your next trip now!'
        }
        action={
          statusFilter !== 'all' ? (
            <Button variant="secondary" onClick={() => dispatch(setStatusFilter('all'))}>
              Show All
            </Button>
          ) : (
            <Link href="/hotels" passHref legacyBehavior>
              <Button className="ui-button-primary">Browse Hotels</Button>
            </Link>
          )
        }
      />
    );
  } else {
    bookingsContent = (
      <>
        <div className="space-y-6">
          {data.items.map((booking) => {
            const room = booking.room;
            const hotel = room?.hotel;
            const payment = booking.paymentIntent;

            return (
              <Card
                key={booking.id}
                className="border border-border bg-card shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={getStatusTone(booking.status)}
                      className="capitalize font-mono"
                    >
                      {booking.status}
                    </Badge>
                    {payment && (
                      <Badge
                        tone={getPaymentStatusTone(payment.status)}
                        className="capitalize font-mono text-[10px]"
                      >
                        Payment: {payment.status}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: {booking.id.substring(0, 8)}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-foreground">
                    {hotel ? hotel.name : 'Unknown Hotel'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    📍 {hotel ? `${hotel.city}, ${hotel.address}` : 'N/A'}
                  </p>
                  <p className="text-sm text-foreground">
                    <strong>Room:</strong> {room ? room.name : 'N/A'} ({room?.type})
                  </p>

                  <div className="flex gap-4 pt-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        CHECK-IN
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {booking.checkIn}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        CHECK-OUT
                      </span>
                      <span className="font-semibold text-foreground font-mono">
                        {booking.checkOut}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-between self-stretch gap-4 md:gap-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted-foreground block uppercase">
                      Amount Paid
                    </span>
                    <span className="text-2xl font-extrabold text-foreground">
                      ₹{(booking.totalPrice / 100).toFixed(2)}
                    </span>
                  </div>

                  {booking.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger/10 w-full md:w-auto"
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel Reservation
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 border-t border-border pt-6">
            <span className="text-sm text-muted-foreground">
              Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} bookings)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={data.meta.page <= 1}
                onClick={() => dispatch(setBookingPage(data.meta.page - 1))}
              >
                &larr; Previous
              </Button>
              <Button
                variant="secondary"
                disabled={data.meta.page >= data.meta.totalPages}
                onClick={() => dispatch(setBookingPage(data.meta.page + 1))}
              >
                Next &rarr;
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Page>
      <ShellHeader
        title="My Bookings"
        subtitle="Manage your upcoming and past premium stays"
      />

      <PageHeader
        title={user.role === 'admin' ? 'All System Bookings' : 'Your Bookings'}
        description={
          user.role === 'admin'
            ? 'Monitor and manage hotel bookings across the entire application.'
            : 'Track the status of your room reservations and payment intents.'
        }
      />

      {/* Filter Toolbar */}
      <div className="mb-8 p-4 rounded-xl bg-card border border-border flex items-end max-w-md">
        <Field label="Filter by Status" className="w-full">
          <Select
            value={statusFilter}
            onChange={(e) =>
              dispatch(setStatusFilter(e.target.value as BookingStatus | 'all'))
            }
          >
            <option value="all">All Bookings</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed Stay</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>
      </div>

      {/* Bookings List */}
      {bookingsContent}
    </Page>
  );
}
