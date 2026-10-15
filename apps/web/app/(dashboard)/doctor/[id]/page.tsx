'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  EmptyState,
  Spinner,
  Pagination,
} from '@shared/ui/components';
import { useDoctor } from '@/features/doctor/hooks';
import { useAvailableSlots } from '@/features/slot/hooks';
import {
  useBookAppointment,
  useCreatePaymentCheckout,
} from '@/features/appointment/hooks';
import { SlotCard } from '@/components/slot/slot-card';
import { SlotBookingModal } from '@/components/slot/slot-booking-modal';
import {
  ArrowLeft,
  Stethoscope,
  Award,
  IndianRupee,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Filter,
  RotateCcw,
} from 'lucide-react';
import type { Slot } from '@/features/slot/types';

function formatLocalDate(dateInput: Date | string | number): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DoctorDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = use(params);
  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
  } = useDoctor(id);

  // Date Filter & Pagination States
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [quickDate, setQuickDate] = useState<'ALL' | 'TODAY' | 'TOMORROW'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Compute API query dates
  const todayStr = formatLocalDate(new Date());
  const tomorrowStr = formatLocalDate(new Date(Date.now() + 86400000));

  let apiStartDate: string | undefined = dateFrom || undefined;
  let apiEndDate: string | undefined = dateTo || undefined;

  if (quickDate === 'TODAY') {
    apiStartDate = todayStr;
    apiEndDate = todayStr;
  } else if (quickDate === 'TOMORROW') {
    apiStartDate = tomorrowStr;
    apiEndDate = tomorrowStr;
  }

  const { data: slots = [], isLoading: isSlotsLoading } = useAvailableSlots(
    id,
    apiStartDate ? `${apiStartDate}T00:00:00` : undefined,
    apiEndDate ? `${apiEndDate}T23:59:59` : undefined,
  );

  const bookMutation = useBookAppointment();
  const checkoutMutation = useCreatePaymentCheckout();

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<Slot | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleQuickDateSelect = (mode: 'ALL' | 'TODAY' | 'TOMORROW') => {
    setQuickDate(mode);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleCustomDateChange = (from: string, to: string) => {
    setQuickDate('ALL');
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setQuickDate('ALL');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleBookSlotClick = (slot: Slot) => {
    setBookingSuccess(null);
    setBookingError(null);
    setSelectedSlotForBooking(slot);
    setIsBookingModalOpen(true);
  };

  const handleProceedToPayment = ({
    slotId,
    reason,
  }: {
    slotId: string;
    reason: string;
  }) => {
    setBookingSuccess(null);
    setBookingError(null);

    checkoutMutation.mutate(slotId, {
      onSuccess: (res) => {
        if (
          res.url &&
          (res.url.startsWith('http://') || res.url.startsWith('https://'))
        ) {
          window.location.href = res.url;
        } else if (res.url) {
          window.location.href = res.url;
        } else {
          executeDirectBooking(slotId, reason);
        }
      },
      onError: (err) => {
        setBookingError(
          err.message || 'Failed to open Stripe payment checkout. Please try again.',
        );
      },
    });
  };

  const executeDirectBooking = (slotId: string, reason: string, redirectUrl?: string) => {
    bookMutation.mutate(
      { slotId, reason },
      {
        onSuccess: () => {
          const slot = selectedSlotForBooking;
          const timeStr = slot
            ? new Date(slot.startsAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';
          const slotInfo = timeStr ? `(${timeStr}) ` : '';
          setBookingSuccess(
            `Slot ${slotInfo}successfully booked! Your consultation has been scheduled.`,
          );
          setIsBookingModalOpen(false);
          setSelectedSlotForBooking(null);

          if (redirectUrl) {
            window.location.href = redirectUrl;
          }
        },
        onError: (err) => {
          setBookingError(err.message || 'Failed to book slot. Please try again.');
          setIsBookingModalOpen(false);
        },
      },
    );
  };

  // Filter out slots whose end time has already passed
  const futureAvailableSlots = slots.filter(
    (slot) => new Date(slot.endsAt).getTime() > Date.now(),
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(futureAvailableSlots.length / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedSlots = futureAvailableSlots.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const renderSlotsContent = () => {
    if (isSlotsLoading) {
      return (
        <div className="py-12 flex flex-col items-center gap-2">
          <Spinner size="md" className="text-primary" />
          <p className="text-xs text-muted-foreground">
            Fetching available time slots...
          </p>
        </div>
      );
    }

    if (futureAvailableSlots.length === 0) {
      return (
        <EmptyState
          title="No Slots Available"
          description={
            quickDate !== 'ALL' || dateFrom || dateTo
              ? 'No consultation slots match your selected date filter parameters.'
              : `Dr. ${doctor?.firstName || 'this practitioner'} ${doctor?.lastName || ''} has no open future consultation slots at this time.`
          }
          action={
            quickDate !== 'ALL' || dateFrom || dateTo ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Date Filters
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paginatedSlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onBook={handleBookSlotClick}
              isBooking={
                selectedSlotForBooking?.id === slot.id &&
                (bookMutation.isPending || checkoutMutation.isPending)
              }
            />
          ))}
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={safePage}
          totalItems={futureAvailableSlots.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  if (isDoctorLoading) {
    return (
      <Page>
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <p className="text-sm text-muted-foreground">Loading doctor details...</p>
        </div>
      </Page>
    );
  }

  if (isDoctorError || !doctor) {
    return (
      <Page>
        <div className="py-12">
          <EmptyState
            title="Doctor Profile Not Found"
            description="We could not find a medical profile associated with this ID."
            action={
              <Link href="/doctors">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Return to Doctor Directory
                </Button>
              </Link>
            }
          />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      {/* Back button link */}
      <div className="mb-4">
        <Link href="/doctors">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors Directory
          </Button>
        </Link>
      </div>

      <PageHeader
        title={`Dr. ${doctor.firstName} ${doctor.lastName}`}
        description={`${doctor.qualification} • ${doctor.specialization}`}
      />

      {/* Booking Alert feedback */}
      {bookingSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {bookingError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Doctor Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border bg-card overflow-hidden shadow-sm p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border-2 border-primary/20">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={`Dr. ${doctor.firstName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-sm text-primary font-medium mt-1">
              <Stethoscope className="w-4 h-4" />
              <span>{doctor.specialization}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{doctor.qualification}</p>

            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-border/50">
              <Badge tone="accent" className="gap-1">
                <Award className="w-3.5 h-3.5" /> {doctor.experienceYears} Yrs Exp.
              </Badge>
              <Badge tone="success" className="gap-1">
                <IndianRupee className="w-3.5 h-3.5" /> ₹{doctor.consultationFee}
              </Badge>
            </div>
          </Card>

          <Card className="border border-border bg-card p-4">
            <CardHeader className="mb-2 pb-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Professional Background
              </CardTitle>
            </CardHeader>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              {doctor.biography || 'No additional biography information available.'}
            </p>
          </Card>
        </div>

        {/* Right Column: Slot Schedule Grid & Date Filter */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border bg-card p-6">
            <CardHeader className="mb-4 pb-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" /> Available Consultation
                  Schedule
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select an open time slot below to reserve your appointment.
                </p>
              </div>
              <Badge tone="accent" className="text-xs shrink-0">
                {futureAvailableSlots.length} Slots Open
              </Badge>
            </CardHeader>

            {/* Backend-Driven Date Filter Bar */}
            <div className="mb-6 bg-muted/30 p-3 rounded-xl border border-border/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Filter className="w-3.5 h-3.5" /> Filter Date:
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    quickDate === 'ALL' && !dateFrom && !dateTo
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Dates
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect('TODAY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    quickDate === 'TODAY'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDateSelect('TOMORROW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    quickDate === 'TOMORROW'
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium text-[11px]">
                    From:
                  </span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => handleCustomDateChange(e.target.value, dateTo)}
                    className="px-2 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground font-medium text-[11px]">
                    To:
                  </span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => handleCustomDateChange(dateFrom, e.target.value)}
                    className="px-2 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {(quickDate !== 'ALL' || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                    title="Clear Date Filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {renderSlotsContent()}
          </Card>
        </div>
      </div>

      {/* Slot Booking Confirmation & Payment Modal */}
      <SlotBookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        slot={selectedSlotForBooking}
        doctor={doctor}
        onProceedToPayment={handleProceedToPayment}
        isProcessing={checkoutMutation.isPending || bookMutation.isPending}
        error={bookingError}
      />
    </Page>
  );
}
