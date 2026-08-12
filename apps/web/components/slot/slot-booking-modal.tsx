'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  Button,
  Badge,
  TextArea,
} from '@shared/ui/components';
import type { Slot } from '@/features/slot/types';
import type { DoctorProfile } from '@/features/doctor/types';
import {
  Clock,
  Calendar,
  CreditCard,
  Stethoscope,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';

export interface SlotBookingModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly slot: Slot | null;
  readonly doctor: DoctorProfile | null;
  readonly onProceedToPayment: (payload: { slotId: string; reason: string }) => void;
  readonly isProcessing?: boolean;
  readonly error?: string | null;
}

export function SlotBookingModal({
  open,
  onOpenChange,
  slot,
  doctor,
  onProceedToPayment,
  isProcessing = false,
  error = null,
}: SlotBookingModalProps) {
  const [reason, setReason] = useState('General Consultation & Checkup');

  if (!slot || !doctor) return null;

  const slotDate = new Date(slot.startsAt);
  const formattedDate = slotDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const startTime = slotDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(slot.endsAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const doctorFee = Number(doctor.consultationFee) || 100;
  const hospitalFee =
    doctor.hospitalCharge !== undefined ? Number(doctor.hospitalCharge) : 10;
  const totalFee = doctorFee + hospitalFee;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onProceedToPayment({
      slotId: slot.id,
      reason: reason.trim() || 'General Consultation',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
          <CreditCard className="w-4 h-4" /> Secure Slot Booking & Payment
        </div>
        <DialogTitle className="text-xl font-bold mt-1">
          Review Consultation Details
        </DialogTitle>
        <DialogDescription>
          Verify your appointment schedule and doctor details before proceeding to
          payment.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogBody className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctor Card Summary */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {doctor.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={`Dr. ${doctor.firstName}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${doctor.firstName[0]}${doctor.lastName[0]}`
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-foreground text-sm truncate">
                Dr. {doctor.firstName} {doctor.lastName}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="truncate">{doctor.specialization}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {doctor.qualification} • {doctor.experienceYears} Yrs Experience
              </p>
            </div>
          </div>

          {/* Slot Timing Card */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
            <div className="text-xs font-semibold text-primary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Consultation Schedule
              </span>
              <Badge tone="success" className="text-[10px] px-2 py-0.5">
                Slot Available
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{formattedDate}</span>
              </div>
              <span className="font-bold text-foreground bg-background px-2.5 py-1 rounded-md border border-border shadow-xs">
                {startTime} – {endTime}
              </span>
            </div>
          </div>

          {/* Consultation Reason / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-primary" /> Reason for Visit
              (Optional)
            </label>
            <TextArea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Routine skin inspection, follow-up consultation..."
              className="text-xs"
            />
          </div>

          {/* Price Breakdown */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
            <div className="font-semibold text-foreground flex items-center justify-between border-b border-border/50 pb-1.5">
              <span>Payment Summary</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Stripe Encrypted
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Doctor Consultation Fee</span>
              <span className="font-medium text-foreground">₹{doctorFee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Hospital Platform Charge</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                ₹{hospitalFee.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-foreground text-sm pt-2 border-t border-border/60">
              <span>Total Payable</span>
              <span className="text-primary flex items-center">
                <IndianRupee className="w-4 h-4" /> {totalFee.toFixed(2)}
              </span>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isProcessing}
            className="gap-2 shadow-md hover:shadow-lg"
          >
            <CreditCard className="w-4 h-4" /> Pay ₹{totalFee.toFixed(2)} & Book Slot
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
