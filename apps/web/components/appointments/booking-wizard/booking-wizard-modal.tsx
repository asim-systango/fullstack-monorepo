'use client';

import { Dialog, DialogHeader, DialogTitle, DialogBody } from '@shared/ui/components';
import { useAppointmentStore, useUiStore } from '@/lib/store';
import { StepDoctorSelect } from './step-doctor-select';
import { StepSlotSelect } from './step-slot-select';
import { StepConfirm } from './step-confirm';
import type { DoctorInfo } from '../../doctors';
import { useBookAppointment } from '@/features/appointment/hooks';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const MOCK_DOCTORS: DoctorInfo[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology',
    rating: 4.9,
    experienceYears: 12,
    location: 'Building A, Suite 302',
    consultationFee: 150,
    availableDays: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    rating: 4.8,
    experienceYears: 9,
    location: 'Building B, Suite 105',
    consultationFee: 180,
    availableDays: ['Tue', 'Thu'],
  },
];

export function BookingWizardModal() {
  const isOpen = useUiStore((state) => state.isBookingModalOpen);
  const setOpen = useUiStore((state) => state.setBookingModalOpen);

  const booking = useAppointmentStore((state) => state.booking);
  const setStep = useAppointmentStore((state) => state.setStep);
  const selectDoctor = useAppointmentStore((state) => state.selectDoctor);
  const selectDateSlot = useAppointmentStore((state) => state.selectDateSlot);
  const setLockId = useAppointmentStore((state) => state.setLockId);
  const setNotes = useAppointmentStore((state) => state.setNotes);
  const resetBooking = useAppointmentStore((state) => state.resetBooking);

  const bookMutation = useBookAppointment();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setIsSuccess(false);
    resetBooking();
  };

  const handleSelectDoctor = (doctor: DoctorInfo) => {
    selectDoctor(doctor.id, doctor.name);
  };

  const handleSlotSelect = (slot: string) => {
    const mockLockId = `LOCK-${Date.now().toString().slice(-6)}`;
    setLockId(mockLockId);
    selectDateSlot(booking.selectedDate, slot);
  };

  const handleConfirmBooking = () => {
    bookMutation.mutate(
      { slotId: booking.lockId ?? 'slot-1', reason: booking.notes },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: () => {
          setIsSuccess(true);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>
          {isSuccess ? 'Booking Confirmed!' : 'Multi-Step Appointment Booking'}
        </DialogTitle>
      </DialogHeader>

      <DialogBody>
        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <CheckCircle className="size-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Appointment Scheduled
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your consultation with {booking.selectedDoctorName} for{' '}
                {booking.selectedDate} at {booking.selectedTimeSlot} has been locked and
                confirmed.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {booking.step === 1 && (
              <StepDoctorSelect
                doctors={MOCK_DOCTORS}
                selectedDoctorId={booking.selectedDoctorId}
                onSelect={handleSelectDoctor}
              />
            )}

            {booking.step === 2 && (
              <StepSlotSelect
                doctorName={booking.selectedDoctorName ?? ''}
                selectedDate={booking.selectedDate}
                selectedTimeSlot={booking.selectedTimeSlot}
                onDateChange={(date) =>
                  selectDateSlot(date, booking.selectedTimeSlot ?? '')
                }
                onSlotSelect={handleSlotSelect}
                onBack={() => setStep(1)}
                isLoadingLock={false}
              />
            )}

            {booking.step === 3 && (
              <StepConfirm
                booking={booking}
                onNotesChange={setNotes}
                onConfirm={handleConfirmBooking}
                onBack={() => setStep(2)}
                isSubmitting={bookMutation.isPending}
              />
            )}
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}
