export type {
  Appointment,
  AppointmentStatus,
  AppointmentFilters,
  Prescription,
  PrescriptionItem,
  MedicalNote,
  CompleteAppointmentPayload,
} from './types';
export {
  appointmentApi,
  adminAppointmentApi,
  prescriptionApi,
  medicalNoteApi,
} from './services';
export {
  useAppointments,
  useAppointment,
  useAdminAppointments,
  useBookAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useCreatePrescription,
  usePrescription,
  useCreateMedicalNote,
  useMedicalNotes,
  appointmentKeys,
} from './hooks';
