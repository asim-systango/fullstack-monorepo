'use client';

import { TextInput, Button } from '@shared/ui/components';
import { Calendar, Clock, Lock } from 'lucide-react';

const AVAILABLE_SLOTS = ['09:00 AM', '10:30 AM', '01:15 PM', '03:00 PM', '04:30 PM'];

type StepSlotSelectProps = {
  doctorName: string;
  selectedDate: string;
  selectedTimeSlot: string | null;
  onDateChange: (date: string) => void;
  onSlotSelect: (slot: string) => void;
  onBack: () => void;
  isLoadingLock: boolean;
};

export function StepSlotSelect({
  doctorName,
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onSlotSelect,
  onBack,
  isLoadingLock,
}: Readonly<StepSlotSelectProps>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Step 2: Select Date & Time
          </p>
          <p className="text-sm font-medium text-foreground">Doctor: {doctorName}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          Change Doctor
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Calendar className="size-3.5 text-primary" /> Select Consultation Date
        </label>
        <TextInput
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-primary" /> Available Time Slots
        </label>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_SLOTS.map((slot) => {
            const isSelected = slot === selectedTimeSlot;
            return (
              <Button
                key={slot}
                variant={isSelected ? 'primary' : 'outline'}
                size="sm"
                className="text-xs py-2 h-auto flex flex-col items-center gap-0.5"
                disabled={isLoadingLock}
                onClick={() => onSlotSelect(slot)}
              >
                <span>{slot}</span>
                {isSelected && (
                  <span className="flex items-center gap-0.5 text-[9px]">
                    <Lock className="size-2.5" /> Slot Locked
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
