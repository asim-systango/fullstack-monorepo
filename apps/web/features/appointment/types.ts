import type { DoctorProfile } from '../doctor/types';
import type { Slot } from '../slot/types';

export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type PrescriptionItem = {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
};

export type Prescription = {
  id: string;
  appointmentId: string;
  medicines: PrescriptionItem[];
  instructions: string | null;
  createdAt: string;
};

export type MedicalNote = {
  id: string;
  appointmentId: string;
  doctorId: string;
  notes: string;
  createdAt: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  slotId: string;
  status: AppointmentStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  slot?: Slot & { doctor?: DoctorProfile };
  prescription?: Prescription;
  medicalNotes?: MedicalNote[];
};

export type AppointmentFilters = {
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
  patientId?: string;
  page?: number;
  limit?: number;
};
