/** Appointment status matching backend AppointmentStatus enum. */
export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

/** Appointment shape matching the backend Appointment entity. */
export type Appointment = {
  id: string;
  patientId: string;
  slotId: string;
  status: AppointmentStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

/** Filters for the appointment list. */
export type AppointmentFilters = {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  page?: number;
  limit?: number;
};
