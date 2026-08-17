'use client';

import { ShellHeader } from '@/components/auth';
import { useAuth } from '@/components/auth';
import { useHotels } from '@/lib/hooks/use-hotels';
import { useBookings } from '@/lib/hooks/use-bookings';
import {
  Page,
  PageHeader,
  Card,
  CardBody,
  CardTitle,
  CardDescription,
  LoadingState,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
} from '@shared/ui/components';
import Link from 'next/link';

export default function ManagerDashboardPage() {
  const { user, loading: loadingAuth } = useAuth();

  // Fetch all hotels and bookings (limit high to aggregate client-side for stats)
  const { data: hotelsData, isLoading: isLoadingHotels } = useHotels({ limit: 100 });
  const { data: bookingsData, isLoading: isLoadingBookings } = useBookings({
    limit: 100,
  });

  if (loadingAuth) {
    return (
      <LoadingState label="Authenticating user..." variant="block" className="py-24" />
    );
  }

  if (!user) {
    return (
      <Page>
        <ShellHeader title="Manager Dashboard" />
        <Alert tone="info" className="my-8">
          Please{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            log in
          </Link>{' '}
          as a staff member or administrator to access the dashboard.
        </Alert>
      </Page>
    );
  }

  if (user.role !== 'admin' && user.role !== 'staff') {
    return (
      <Page>
        <ShellHeader title="Access Denied" />
        <Alert tone="danger" className="my-8">
          Forbidden: You must be a manager (staff) or administrator to view this page.
        </Alert>
      </Page>
    );
  }

  const isLoading = isLoadingHotels || isLoadingBookings;

  // Filter hotels and bookings based on manager ownership
  const managedHotels =
    hotelsData?.items.filter((h) => user.role === 'admin' || h.managerId === user.id) ||
    [];
  const managedHotelIds = new Set(managedHotels.map((h) => h.id));

  const managedBookings =
    bookingsData?.items.filter(
      (b) =>
        user.role === 'admin' || (b.room?.hotelId && managedHotelIds.has(b.room.hotelId)),
    ) || [];

  // Calculate stats
  const totalDestinations = managedHotels.length;
  const totalBookings = managedBookings.length;
  const totalRevenue = managedBookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  const activeBookings = managedBookings.filter((b) => b.status === 'confirmed').length;

  const getBookingTone = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'confirmed') return 'neutral';
    return 'danger';
  };

  return (
    <Page>
      <ShellHeader
        title="Manager Dashboard"
        subtitle="Overview of your hospitality portfolio stats"
      />

      <PageHeader
        title="Business Overview"
        description={
          user.role === 'admin'
            ? 'Super Admin view - aggregating all hotels and bookings in the system.'
            : 'Manager view - statistics for hotels owned and managed by your staff account.'
        }
      />

      {isLoading ? (
        <LoadingState label="Analyzing statistics..." variant="block" className="py-12" />
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card border border-border p-5">
              <CardBody className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Revenue
                </span>
                <CardTitle className="text-3xl font-extrabold text-foreground">
                  ₹{(totalRevenue / 100).toFixed(2)}
                </CardTitle>
                <CardDescription className="text-xs text-green-500">
                  from non-cancelled stays
                </CardDescription>
              </CardBody>
            </Card>

            <Card className="bg-card border border-border p-5">
              <CardBody className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Bookings
                </span>
                <CardTitle className="text-3xl font-extrabold text-foreground">
                  {totalBookings}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  all-time reservations
                </CardDescription>
              </CardBody>
            </Card>

            <Card className="bg-card border border-border p-5">
              <CardBody className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Managed Stays
                </span>
                <CardTitle className="text-3xl font-extrabold text-foreground">
                  {totalDestinations}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  hotels active or soft-deleted
                </CardDescription>
              </CardBody>
            </Card>

            <Card className="bg-card border border-border p-5">
              <CardBody className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Active Bookings
                </span>
                <CardTitle className="text-3xl font-extrabold text-foreground">
                  {activeBookings}
                </CardTitle>
                <CardDescription className="text-xs text-blue-500">
                  currently confirmed stays
                </CardDescription>
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Managed Hotels List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xl font-bold text-foreground">My Properties</h3>
              {managedHotels.length === 0 ? (
                <div className="p-4 border border-border rounded-xl bg-card text-center text-sm text-muted-foreground">
                  No properties assigned. Add a hotel first from the Explore Stays page.
                </div>
              ) : (
                <div className="space-y-3">
                  {managedHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="p-4 border border-border rounded-xl bg-card flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-semibold text-foreground">{hotel.name}</h4>
                        <p className="text-xs text-muted-foreground">{hotel.city}</p>
                      </div>
                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-foreground">Recent Reservations</h3>
              {managedBookings.length === 0 ? (
                <div className="p-4 border border-border rounded-xl bg-card text-center text-sm text-muted-foreground">
                  No bookings found for your properties yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl bg-card">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Hotel / Room</TableHeaderCell>
                        <TableHeaderCell>Dates</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Revenue</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {managedBookings.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="font-semibold text-foreground">
                              {booking.room?.hotel?.name || 'Hotel'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {booking.room?.name || 'Room'}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {booking.checkIn} to {booking.checkOut}
                          </TableCell>
                          <TableCell>
                            <Badge
                              tone={getBookingTone(booking.status)}
                              className="capitalize font-mono text-[10px]"
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            ₹{(booking.totalPrice / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
}
