/**
 * Appointment lifecycle status.
 * - SCHEDULED: confirmed booking awaiting visit
 * - CANCELLED: soft-deleted by patient or admin
 * - COMPLETED: visit finished by doctor
 */
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
