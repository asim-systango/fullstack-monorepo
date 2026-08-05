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
