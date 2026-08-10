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
} from '@shared/ui/components';
import { useDoctor } from '@/features/doctor/hooks';
import { useAvailableSlots } from '@/features/slot/hooks';
import { useBookAppointment } from '@/features/appointment/hooks';
import { SlotCard } from '@/components/slot/slot-card';
import {
  ArrowLeft,
  Stethoscope,
  Award,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import type { Slot } from '@/features/slot/types';

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
  const { data: slots = [], isLoading: isSlotsLoading } = useAvailableSlots(id);
  const bookMutation = useBookAppointment();

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookSlot = (slot: Slot) => {
    setBookingSuccess(null);
    setBookingError(null);

    bookMutation.mutate(
      { slotId: slot.id, reason: 'Consultation with Specialist' },
      {
        onSuccess: () => {
          setBookingSuccess(
            `Slot (${new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) successfully booked! Check your Appointments tab.`,
          );
        },
        onError: (err) => {
          setBookingError(err.message || 'Failed to book slot. Please try again.');
        },
      },
    );
  };

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

    if (slots.length === 0) {
      return (
        <EmptyState
          title="No Slots Available"
          description="Dr. Sharma has no open consultation slots at this time. Please check back later."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            onBook={handleBookSlot}
            isBooking={bookMutation.isPending}
          />
        ))}
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

        {/* Right Column: Slot Schedule Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border bg-card p-6">
            <CardHeader className="mb-4 pb-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Available Consultation
                  Schedule
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select an open time slot below to reserve your appointment.
                </p>
              </div>
              <Badge tone="accent" className="text-xs">
                {slots.length} Slots Open
              </Badge>
            </CardHeader>

            {renderSlotsContent()}
          </Card>
        </div>
      </div>
    </Page>
  );
}
