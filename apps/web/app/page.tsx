'use client';

import { ShellHeader } from '@/components/auth';
import { useHotels } from '@/lib/hooks/use-hotels';
import { useAuth } from '@/components/auth';
import {
  Page,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
  LoadingState,
  EmptyState,
  Alert,
} from '@shared/ui/components';
import Link from 'next/link';

function getHotelPlaceholderImage(hotelName: string): string {
  const name = hotelName.toLowerCase();
  if (name.includes('grand') || name.includes('residency')) {
    return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
  }
  if (name.includes('coastal') || name.includes('breeze') || name.includes('resort')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80';
}

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useHotels({ limit: 3 });

  // Handle hotel display logic as a separate block to avoid nested ternaries
  let hotelsContent;
  if (isLoading) {
    hotelsContent = (
      <LoadingState
        label="Loading featured hotels..."
        variant="block"
        className="py-12"
      />
    );
  } else if (error) {
    hotelsContent = (
      <Alert tone="danger" className="my-4">
        Failed to load hotels. Please make sure the backend services are running.
      </Alert>
    );
  } else if (!data || data.items.length === 0) {
    hotelsContent = (
      <EmptyState
        title="No Hotels Available"
        description="Check back soon for new premium destinations."
      />
    );
  } else {
    hotelsContent = (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.items.map((hotel) => (
          <Card
            key={hotel.id}
            className="flex flex-col h-full bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-48 w-full bg-muted flex items-center justify-center text-muted-foreground rounded-t-2xl overflow-hidden relative border-b border-border">
              <img
                src={hotel.imageUrl || getHotelPlaceholderImage(hotel.name)}
                alt={hotel.name}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardBody className="flex-grow p-5">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                {hotel.city}
              </span>
              <CardTitle className="mt-2 text-lg font-bold text-foreground line-clamp-1">
                {hotel.name}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {hotel.description}
              </CardDescription>
              <p className="mt-4 text-xs font-mono text-muted-foreground line-clamp-1 flex items-center gap-1">
                <span>📍</span> {hotel.address}
              </p>
            </CardBody>
            <CardFooter className="px-5 pb-5 pt-0 mt-auto border-t-0">
              <Link
                href={`/hotels/${hotel.id}`}
                className="w-full"
                passHref
                legacyBehavior
              >
                <Button className="w-full ui-button-primary">View Details & Rooms</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Page>
      <ShellHeader title="LuxeStay" subtitle="Find and book your next premium getaway" />

      {/* Hero section */}
      <div className="my-8 rounded-3xl bg-card border border-border p-10 md:p-16 text-center shadow-md relative overflow-hidden">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Premium Stays. <span className="text-accent">Effortless Booking.</span>
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore curated hotels from bustling cities to serene beaches. Plan your stay
          with instant availability checks and secure booking management.
        </p>
        <div className="mt-8 flex justify-center gap-4 relative z-10">
          <Link href="/hotels" passHref legacyBehavior>
            <Button className="ui-button-primary px-6">Browse All Hotels</Button>
          </Link>
          {!user && (
            <Link href="/login" passHref legacyBehavior>
              <Button className="ui-button-ghost px-6">Sign In to Book</Button>
            </Link>
          )}
        </div>
      </div>

      {/* User greeting */}
      {user && (
        <div className="mb-8 p-4 rounded-xl bg-card border border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Welcome back, {user.name}!
            </h3>
            <p className="text-sm text-muted-foreground">
              Logged in as{' '}
              <span className="capitalize font-mono font-semibold text-primary">
                {user.role}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/bookings" passHref legacyBehavior>
              <Button variant="ghost" size="sm">
                My Bookings
              </Button>
            </Link>
            {(user.role === 'admin' || user.role === 'staff') && (
              <Link href="/manager" passHref legacyBehavior>
                <Button variant="secondary" size="sm">
                  Manager Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Featured Hotels */}
      <div className="my-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Featured Destinations
          </h2>
          <Link
            href="/hotels"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all destinations &rarr;
          </Link>
        </div>

        {hotelsContent}
      </div>
    </Page>
  );
}
