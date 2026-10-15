'use client';

import { useState } from 'react';
import { ShellHeader } from '@/components/auth';
import { useAuth } from '@/components/auth';
import {
  useHotels,
  useCreateHotel,
  useUpdateHotel,
  useDeleteHotel,
} from '@/lib/hooks/use-hotels';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  setCityDraft,
  setSearchDraft,
  applyFilters,
  resetFilters,
  setPage,
} from '@/lib/store/hotel-filters-slice';
import {
  Page,
  PageHeader,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
  LoadingState,
  EmptyState,
  Alert,
  TextInput,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Field,
  TextArea,
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

interface HotelItem {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  imageUrl?: string | null;
  deletedAt?: string | null;
}

export default function HotelsPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // Get filter state from Redux
  const { cityDraft, searchDraft, appliedCity, appliedSearch, page, limit } =
    useAppSelector((state) => state.hotelFilters);

  // Fetch hotels using TanStack Query
  const { data, isLoading, error } = useHotels({
    city: appliedCity || undefined,
    q: appliedSearch || undefined,
    page,
    limit,
    withDeleted: user?.role === 'admin' || user?.role === 'staff', // Admins/staff can see soft-deleted ones
  });

  // Local state for create/edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<{
    id?: string;
    name: string;
    description: string;
    city: string;
    address: string;
    imageUrl: string;
  } | null>(null);

  // Mutations
  const createMutation = useCreateHotel();
  const updateMutation = useUpdateHotel();
  const deleteMutation = useDeleteHotel();

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    dispatch(applyFilters());
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const handleOpenCreateModal = () => {
    setEditingHotel({
      name: '',
      description: '',
      city: '',
      address: '',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hotel: HotelItem) => {
    setEditingHotel({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      city: hotel.city,
      address: hotel.address,
      imageUrl: hotel.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveHotel = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!editingHotel) return;

    try {
      if (editingHotel.id) {
        await updateMutation.mutateAsync({
          id: editingHotel.id,
          dto: {
            name: editingHotel.name,
            description: editingHotel.description,
            city: editingHotel.city,
            address: editingHotel.address,
            imageUrl: editingHotel.imageUrl || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: editingHotel.name,
          description: editingHotel.description,
          city: editingHotel.city,
          address: editingHotel.address,
          imageUrl: editingHotel.imageUrl || null,
        });
      }
      setIsModalOpen(false);
      setEditingHotel(null);
    } catch (err) {
      console.error('Failed to save hotel', err);
    }
  };

  const handleDeleteHotel = async (id: string) => {
    if (confirm('Are you sure you want to delete this hotel? This is a soft-delete.')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete hotel', err);
      }
    }
  };

  const isStaffOrAdmin = user?.role === 'admin' || user?.role === 'staff';

  // Render main content grid or loading/error/empty state without nesting conditionals in JSX
  let hotelsContent;
  if (isLoading) {
    hotelsContent = (
      <LoadingState label="Searching hotels..." variant="block" className="py-12" />
    );
  } else if (error) {
    hotelsContent = (
      <Alert tone="danger" className="my-4">
        Error searching hotels. Please try again later.
      </Alert>
    );
  } else if (!data || data.items.length === 0) {
    hotelsContent = (
      <EmptyState
        title="No stays found"
        description="Try broadening your city filters or search query keywords."
        action={
          <Button variant="secondary" onClick={handleReset}>
            Reset Filters
          </Button>
        }
      />
    );
  } else {
    hotelsContent = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((hotel) => (
            <Card
              key={hotel.id}
              className={`flex flex-col h-full border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative ${
                hotel.deletedAt ? 'opacity-60 grayscale' : ''
              }`}
            >
              {hotel.deletedAt && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-danger/80 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                    Archived (Soft Deleted)
                  </span>
                </div>
              )}
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
                <p className="mt-3 text-xs font-mono text-muted-foreground line-clamp-1">
                  📍 {hotel.address}
                </p>
              </CardBody>
              <CardFooter className="px-5 pb-5 pt-0 mt-auto flex flex-col gap-2">
                <Link
                  href={`/hotels/${hotel.id}`}
                  className="w-full"
                  passHref
                  legacyBehavior
                >
                  <Button className="w-full ui-button-primary">
                    View Rooms & Details
                  </Button>
                </Link>
                {isStaffOrAdmin && (
                  <div className="flex gap-2 w-full mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-grow"
                      onClick={() => handleOpenEditModal(hotel)}
                    >
                      Edit
                    </Button>
                    {!hotel.deletedAt && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => handleDeleteHotel(hotel.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 border-t border-border pt-6">
            <span className="text-sm text-muted-foreground">
              Showing page {data.meta.page} of {data.meta.totalPages} ({data.meta.total}{' '}
              total stays)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={data.meta.page <= 1}
                onClick={() => dispatch(setPage(data.meta.page - 1))}
              >
                &larr; Previous
              </Button>
              <Button
                variant="secondary"
                disabled={data.meta.page >= data.meta.totalPages}
                onClick={() => dispatch(setPage(data.meta.page + 1))}
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
        title="Explore Destinations"
        subtitle="Choose from our luxurious collection of stays"
      />

      {/* Header Actions (Manager/Admin create hotel) */}
      <PageHeader
        title="Our Hotels"
        description="Filter by city or search to find your perfect match."
        actions={
          isStaffOrAdmin ? (
            <Button onClick={handleOpenCreateModal} className="ui-button-primary">
              + Add New Hotel
            </Button>
          ) : undefined
        }
      />

      {/* Filter and Search Form */}
      <form
        onSubmit={handleSearch}
        className="mb-8 p-4 rounded-xl bg-card border border-border grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
      >
        <Field label="Search Hotels">
          <TextInput
            placeholder="Search by name or details..."
            value={searchDraft}
            onChange={(e) => dispatch(setSearchDraft(e.target.value))}
          />
        </Field>
        <Field label="City">
          <TextInput
            placeholder="e.g. Mumbai, Goa..."
            value={cityDraft}
            onChange={(e) => dispatch(setCityDraft(e.target.value))}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" className="flex-grow ui-button-primary">
            Apply Filters
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>

      {/* Hotels Grid */}
      {hotelsContent}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && editingHotel && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <form onSubmit={handleSaveHotel}>
            <DialogHeader>
              <DialogTitle>
                {editingHotel.id ? 'Edit Hotel Details' : 'Add New Hotel Destination'}
              </DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <Field label="Hotel Name" required>
                <TextInput
                  placeholder="e.g. The Oberoi Grand"
                  value={editingHotel.name}
                  onChange={(e) =>
                    setEditingHotel({ ...editingHotel, name: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="City Name" required>
                <TextInput
                  placeholder="e.g. Mumbai"
                  value={editingHotel.city}
                  onChange={(e) =>
                    setEditingHotel({ ...editingHotel, city: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Street Address" required>
                <TextInput
                  placeholder="e.g. 123 Marine Drive"
                  value={editingHotel.address}
                  onChange={(e) =>
                    setEditingHotel({ ...editingHotel, address: e.target.value })
                  }
                  required
                />
              </Field>
              <Field label="Description" required>
                <TextArea
                  placeholder="Provide a detailed description of features and location highlights..."
                  value={editingHotel.description}
                  onChange={(e) =>
                    setEditingHotel({ ...editingHotel, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </Field>
              <Field label="Image URL (Optional)">
                <TextInput
                  placeholder="https://example.com/hotel-image.jpg"
                  value={editingHotel.imageUrl}
                  onChange={(e) =>
                    setEditingHotel({ ...editingHotel, imageUrl: e.target.value })
                  }
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="ui-button-primary">
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : 'Save Hotel'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      )}
    </Page>
  );
}
