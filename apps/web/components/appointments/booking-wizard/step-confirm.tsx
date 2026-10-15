'use client';

import { TextArea, Button, Badge } from '@shared/ui/components';
import { CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import type { MultiStepBookingData } from '@/lib/store';

type StepConfirmProps = {
  booking: MultiStepBookingData;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

export function StepConfirm({
  booking,
  onNotesChange,
  onConfirm,
  onBack,
  isSubmitting,
}: Readonly<StepConfirmProps>) {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step 3: Final Review & Confirmation
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Doctor:</span>
          <span className="font-semibold text-foreground">
            {booking.selectedDoctorName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date:</span>
          <span className="font-semibold text-foreground">{booking.selectedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time Slot:</span>
          <span className="font-semibold text-foreground">
            {booking.selectedTimeSlot}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-muted-foreground">Lock Verification ID:</span>
          <Badge tone="outline" className="text-[10px] font-mono">
            {booking.lockId ?? 'LOCK-ACTIVE-101'}
          </Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <FileText className="size-3.5 text-primary" /> Medical Notes / Symptoms
          (Optional)
        </label>
        <TextArea
          placeholder="Briefly describe your symptoms or reason for visit..."
          value={booking.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="text-xs"
        />
      </div>

      <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        <span>Your time slot is secured with concurrency-safe database locking.</span>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onConfirm}
          loading={isSubmitting}
          loadingText="Confirming..."
          className="gap-1.5 font-semibold"
        >
          <CheckCircle2 className="size-4" /> Confirm Booking
        </Button>
      </div>
    </div>
  );
}
