import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminAppointmentApi,
  appointmentApi,
  medicalNoteApi,
  prescriptionApi,
} from './services';
import type {
  AppointmentFilters,
  CompleteAppointmentPayload,
  PrescriptionItem,
} from './types';

export const appointmentKeys = {
  all: ['appointments'] as const,
  detail: (id: string) => ['appointments', 'detail', id] as const,
  filtered: (filters?: AppointmentFilters) =>
    ['appointments', 'filtered', filters] as const,
  adminFiltered: (filters?: AppointmentFilters) =>
    ['admin', 'appointments', filters] as const,
  prescription: (appointmentId: string) => ['prescriptions', appointmentId] as const,
  medicalNotes: (appointmentId: string) => ['medical-notes', appointmentId] as const,
};

/** Fetch appointments with filters. */
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.filtered(filters),
    queryFn: () => appointmentApi.getAll(filters),
  });
}

/** Fetch single appointment by ID. */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentApi.getById(id),
    enabled: Boolean(id),
  });
}

/** Admin hospital-wide appointment search. */
export function useAdminAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.adminFiltered(filters),
    queryFn: () => adminAppointmentApi.getAdminAppointments(filters),
  });
}

/** Book an appointment mutation. */
export function useBookAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { slotId: string; reason?: string }) =>
      appointmentApi.book(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

/** Initiate Stripe Checkout session mutation. */
export function useCreatePaymentCheckout() {
  return useMutation({
    mutationFn: (slotId: string) => appointmentApi.createPaymentCheckout(slotId),
  });
}

/** Cancel an appointment mutation. */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

/** Complete an appointment mutation. */
export function useCompleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CompleteAppointmentPayload }) =>
      appointmentApi.complete(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.id),
      });
      void queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

/** Create prescription mutation. */
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: { medicines: PrescriptionItem[]; instructions?: string };
    }) => prescriptionApi.createForAppointment(appointmentId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({
        queryKey: appointmentKeys.prescription(variables.appointmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.appointmentId),
      });
    },
  });
}

/** Fetch prescription for appointment. */
export function usePrescription(appointmentId: string) {
  return useQuery({
    queryKey: appointmentKeys.prescription(appointmentId),
    queryFn: () => prescriptionApi.getByAppointmentId(appointmentId),
    enabled: Boolean(appointmentId),
  });
}

/** Create medical note mutation. */
export function useCreateMedicalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      payload,
    }: {
      appointmentId: string;
      payload: { notes: string };
    }) => medicalNoteApi.createForAppointment(appointmentId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      void queryClient.invalidateQueries({
        queryKey: appointmentKeys.medicalNotes(variables.appointmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: appointmentKeys.detail(variables.appointmentId),
      });
    },
  });
}

/** Fetch medical notes for appointment. */
export function useMedicalNotes(appointmentId: string) {
  return useQuery({
    queryKey: appointmentKeys.medicalNotes(appointmentId),
    queryFn: () => medicalNoteApi.getByAppointmentId(appointmentId),
    enabled: Boolean(appointmentId),
  });
}
