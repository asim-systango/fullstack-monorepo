export type { Appointment, AppointmentStatus, AppointmentFilters } from './types';
export { appointmentApi } from './services';
export {
  useAppointments,
  useBookAppointment,
  useCancelAppointment,
  appointmentKeys,
} from './hooks';
