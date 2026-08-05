/**
 * Slot availability status.
 * - AVAILABLE: open for patient booking
 * - BOOKED: reserved by a confirmed appointment
 * - BLOCKED: manually blocked by doctor or admin
 */
export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
}
