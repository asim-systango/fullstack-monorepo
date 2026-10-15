'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShellHeader } from '@/components/auth';
import { useAuth } from '@/components/auth';
import { useHotel } from '@/lib/hooks/use-hotels';
import Link from 'next/link';
import type { Room, Review } from '@/lib/api';
import {
  useRooms,
  useAvailability,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from '@/lib/hooks/use-rooms';
import { useCreateBooking } from '@/lib/hooks/use-bookings';
import { useReviews, useCreateReview } from '@/lib/hooks/use-reviews';
import {
  Page,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  LoadingState,
  EmptyState,
  Alert,
  TextInput,
  Select,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Field,
  TextArea,
  Badge,
} from '@shared/ui/components';

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

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const hotelId = params.id as string;

  // Queries
  const { data: hotel, isLoading: isLoadingHotel, error: hotelError } = useHotel(hotelId);
  const { data: rooms, isLoading: isLoadingRooms } = useRooms(hotelId);
  const { data: reviews, isLoading: isLoadingReviews } = useReviews(hotelId);

  // Availability state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Availability Query Hook
  const {
    data: availableRooms,
    isLoading: isLoadingAvailability,
    refetch: checkAvailability,
  } = useAvailability({
    hotelId,
    checkIn,
    checkOut,
  });

  // Mutations
  const createBookingMutation = useCreateBooking();
  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const deleteRoomMutation = useDeleteRoom();
  const createReviewMutation = useCreateReview();

  // Dialog State - Room CRUD
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{
    id?: string;
    name: string;
    type: 'single' | 'double' | 'suite';
    pricePerNight: number; // in normal decimal units for input
    capacity: number;
    amenities: string;
    isActive: boolean;
  } | null>(null);

  // Dialog State - Booking Confirmation
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Review Form State
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleCheckAvailability = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    startTransition(async () => {
      await checkAvailability();
      setHasCheckedAvailability(true);
    });
  };

  // Booking Actions
  const handleOpenBookingModal = (room: Room) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedRoom(room);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom || !checkIn || !checkOut) return;

    try {
      await createBookingMutation.mutateAsync({
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
      });
      setIsBookingModalOpen(false);
      router.push('/bookings');
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Overlap detected or booking failed. Please try other dates.';
      setBookingError(errMsg);
    }
  };

  // Room CRUD Actions
  const handleOpenCreateRoom = () => {
    setEditingRoom({
      name: '',
      type: 'double',
      pricePerNight: 50,
      capacity: 2,
      amenities: 'WiFi, AC, TV',
      isActive: true,
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom({
      id: room.id,
      name: room.name,
      type: room.type,
      pricePerNight: room.pricePerNight / 100, // Cents to decimal
      capacity: room.capacity,
      amenities: room.amenities,
      isActive: room.isActive,
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const priceInCents = Math.round(editingRoom.pricePerNight * 100);
      if (editingRoom.id) {
        await updateRoomMutation.mutateAsync({
          id: editingRoom.id,
          hotelId,
          dto: {
            name: editingRoom.name,
            type: editingRoom.type,
            pricePerNight: priceInCents,
            capacity: editingRoom.capacity,
            amenities: editingRoom.amenities,
            isActive: editingRoom.isActive,
          },
        });
      } else {
        await createRoomMutation.mutateAsync({
          hotelId,
          dto: {
            name: editingRoom.name,
            type: editingRoom.type,
            pricePerNight: priceInCents,
            capacity: editingRoom.capacity,
            amenities: editingRoom.amenities,
            isActive: editingRoom.isActive,
          },
        });
      }
      setIsRoomModalOpen(false);
      setEditingRoom(null);
    } catch (err) {
      console.error('Failed to save room', err);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoomMutation.mutateAsync({ id, hotelId });
      } catch (err) {
        console.error('Failed to delete room', err);
      }
    }
  };

  // Review Actions
  const handleCreateReview = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setReviewError(null);

    if (!newReviewComment.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        hotelId,
        rating: Number(newReviewRating),
        comment: newReviewComment,
      });
      setNewReviewComment('');
      setNewReviewRating(5);
    } catch (err) {
      const errMsg =
        err instanceof Error
          ? err.message
          : 'Failed to submit review. Must complete stay first.';
      setReviewError(errMsg);
    }
  };

  if (isLoadingHotel) {
    return (
      <LoadingState label="Loading hotel details..." variant="block" className="py-24" />
    );
  }

  if (hotelError || !hotel) {
    return (
      <Page>
        <ShellHeader title="Hotel Booking" />
        <Alert tone="danger" className="my-8">
          Hotel not found or error loading data. Please verify the ID.
        </Alert>
      </Page>
    );
  }

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';
  const displayedRooms = hasCheckedAvailability ? availableRooms : rooms;

  const getReviewTone = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'neutral';
    return 'danger';
  };

  // Separate conditional rendering for Rooms list to avoid nested ternary in JSX
  let roomsContent;
  if (isLoadingRooms) {
    roomsContent = (
      <LoadingState label="Loading rooms..." variant="block" className="py-8" />
    );
  } else if (!displayedRooms || displayedRooms.length === 0) {
    roomsContent = (
      <EmptyState
        title="No rooms available"
        description={
          hasCheckedAvailability
            ? 'No rooms fit these dates. Try other check-in dates.'
            : 'No rooms added to this hotel yet.'
        }
      />
    );
  } else {
    roomsContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedRooms.map((room) => (
          <Card
            key={room.id}
            className="border border-border bg-card shadow-sm flex flex-col justify-between"
          >
            <CardBody className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 px-2 py-0.5 rounded">
                    {room.type}
                  </span>
                  <CardTitle className="text-xl font-bold text-foreground mt-2">
                    {room.name}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-foreground">
                    ₹{(room.pricePerNight / 100).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground block">per night</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Capacity:</strong> {room.capacity} Guest(s)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Amenities:</strong>{' '}
                  {room.amenities.split(',').map((a, i) => (
                    <span
                      key={i}
                      className="inline-block bg-muted text-foreground text-xs px-2 py-1 rounded mr-1 mb-1"
                    >
                      {a.trim()}
                    </span>
                  ))}
                </p>
              </div>
            </CardBody>
            <CardFooter className="px-6 pb-6 pt-0 flex justify-between gap-2 border-t border-border/10 pt-4">
              {hasCheckedAvailability ? (
                <Button
                  onClick={() => handleOpenBookingModal(room)}
                  className="w-full ui-button-primary"
                >
                  Book Now
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic flex items-center">
                  Enter check-in/out dates above to book
                </span>
              )}
              {isStaffOrAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEditRoom(room)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger/10"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Separate conditional rendering for Reviews list to avoid nested ternary in JSX
  let reviewsContent;
  if (isLoadingReviews) {
    reviewsContent = <LoadingState label="Loading reviews..." />;
  } else if (!reviews || reviews.length === 0) {
    reviewsContent = (
      <EmptyState
        title="No reviews yet"
        description="Be the first to review your stay here!"
      />
    );
  } else {
    reviewsContent = (
      <div className="space-y-4">
        {reviews.map((review: Review) => (
          <div key={review.id} className="p-5 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Guest</span>
                <span className="text-xs text-muted-foreground font-mono">
                  · {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Badge tone={getReviewTone(review.rating)}>⭐ {review.rating} / 5</Badge>
            </div>
            <p className="mt-3 text-sm text-foreground leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Page>
      <ShellHeader title={hotel.name} subtitle={`${hotel.city} — ${hotel.address}`} />

      {/* Hotel Description Header */}
      <div className="mb-12 bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 h-64 bg-muted rounded-xl flex items-center justify-center text-muted-foreground overflow-hidden relative">
          <img
            src={hotel.imageUrl || getHotelPlaceholderImage(hotel.name)}
            alt={hotel.name}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <span className="bg-accent/15 text-accent text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full">
              {hotel.city}
            </span>
            <h2 className="text-3xl font-extrabold text-foreground mt-3">{hotel.name}</h2>
            <p className="text-sm font-mono text-muted-foreground mt-2">
              📍 {hotel.address}
            </p>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed">
              {hotel.description}
            </p>
          </div>
          {isStaffOrAdmin && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleOpenCreateRoom} className="ui-button-primary">
                + Add Room to Hotel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Availability Checker */}
      <div className="mb-12 p-6 rounded-2xl bg-card border border-border">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Check Availability & Book
        </h3>
        <form
          onSubmit={handleCheckAvailability}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <Field label="Check-in Date" required>
            <TextInput
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </Field>
          <Field label="Check-out Date" required>
            <TextInput
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              required
            />
          </Field>
          <Button type="submit" className="w-full ui-button-primary" disabled={isPending}>
            {isLoadingAvailability || isPending ? 'Checking...' : 'Check Availability'}
          </Button>
        </form>
      </div>

      {/* Rooms Section */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          {hasCheckedAvailability ? 'Available Rooms' : 'All Rooms'}
        </h3>

        {roomsContent}
      </div>

      {/* Reviews Section */}
      <div className="mb-16 border-t border-border pt-12">
        <h3 className="text-2xl font-bold text-foreground mb-6 font-sans">Reviews</h3>

        {/* Create Review Form */}
        {user ? (
          <form
            onSubmit={handleCreateReview}
            className="mb-8 p-6 rounded-2xl bg-card border border-border"
          >
            <h4 className="text-lg font-semibold text-foreground mb-4">Write a Review</h4>
            {reviewError && (
              <Alert tone="danger" className="mb-4">
                {reviewError}
              </Alert>
            )}
            <div className="grid grid-cols-1 gap-4">
              <Field label="Rating">
                <Select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                >
                  <option value="5">5 Stars — Excellent</option>
                  <option value="4">4 Stars — Good</option>
                  <option value="3">3 Stars — Average</option>
                  <option value="2">2 Stars — Poor</option>
                  <option value="1">1 Star — Terrible</option>
                </Select>
              </Field>
              <Field label="Comment">
                <TextArea
                  placeholder="Share your stay experience at this hotel..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  rows={3}
                  required
                />
              </Field>
              <Button
                type="submit"
                className="ui-button-primary self-start"
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground mb-8">
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>{' '}
            to post a review for this hotel.
          </p>
        )}

        {/* Reviews List */}
        {reviewsContent}
      </div>

      {/* Room Create / Edit Modal Dialog */}
      {isRoomModalOpen && editingRoom && (
        <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
          <form onSubmit={handleSaveRoom}>
            <DialogHeader>
              <DialogTitle>
                {editingRoom.id ? 'Edit Room Settings' : 'Create New Room Listing'}
              </DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field label="Room Name" required>
                <TextInput
                  placeholder="e.g. Executive Balcony Double"
                  value={editingRoom.name}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, name: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Room Type" required>
                <Select
                  value={editingRoom.type}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      type: e.target.value as 'single' | 'double' | 'suite',
                    })
                  }
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                </Select>
              </Field>
              <Field label="Price per Night (INR / ₹)" required>
                <TextInput
                  type="number"
                  placeholder="e.g. 5000"
                  value={editingRoom.pricePerNight}
                  onChange={(e) =>
                    setEditingRoom({
                      ...editingRoom,
                      pricePerNight: Number(e.target.value),
                    })
                  }
                  min={1}
                  required
                />
              </Field>
              <Field label="Capacity" required>
                <TextInput
                  type="number"
                  placeholder="e.g. 2"
                  value={editingRoom.capacity}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, capacity: Number(e.target.value) })
                  }
                  min={1}
                  required
                />
              </Field>
              <Field label="Amenities (comma separated)">
                <TextInput
                  placeholder="WiFi, AC, TV, Jacuzzi"
                  value={editingRoom.amenities}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, amenities: e.target.value })
                  }
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsRoomModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="ui-button-primary">
                Save Room
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}

      {/* Booking Confirmation Dialog (Atomic Transaction trigger) */}
      {isBookingModalOpen && selectedRoom && (
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogHeader>
            <DialogTitle>Confirm Your Premium Booking</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {bookingError && <Alert tone="danger">{bookingError}</Alert>}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold text-foreground">{hotel.name}</h4>
              <p className="text-xs text-muted-foreground">{hotel.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground block uppercase">
                  Room
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {selectedRoom.name}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase">
                  Type
                </span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {selectedRoom.type}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase">
                  Check-in
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {checkIn}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block uppercase">
                  Check-out
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {checkOut}
                </span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-foreground">Total Price (Inc. taxes)</span>
                <span className="text-primary">
                  ₹
                  {(
                    (selectedRoom.pricePerNight *
                      Math.ceil(
                        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground block text-right mt-1">
                Rate: ₹{(selectedRoom.pricePerNight / 100).toFixed(2)} / night
              </span>
            </div>
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded text-xs text-center">
              💳 Payment is processed atomically. Status will be marked &quot;paid&quot;
              instantly.
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBookingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              className="ui-button-primary"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </Page>
  );
}
