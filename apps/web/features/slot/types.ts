/** Slot status matching backend SlotStatus enum. */
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

/** Slot shape matching the backend Slot entity. */
export type Slot = {
  id: string;
  doctorId: string;
  startsAt: string;
  endsAt: string;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
};

export type ShiftInput = {
  name?: string;
  startTime: string;
  endTime: string;
};

export type BulkCreateSlotInput = {
  doctorId: string;
  date: string;
  endDate?: string;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  shift2StartTime?: string;
  shift2EndTime?: string;
  shifts?: ShiftInput[];
  slotDurationMinutes?: number;
};

export type UpdateSlotInput = {
  status?: SlotStatus;
};
