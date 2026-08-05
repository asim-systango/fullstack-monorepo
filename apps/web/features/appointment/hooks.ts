import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from './services';
import type { AppointmentFilters } from './types';

/** Query key namespace for appointment queries. */
export const appointmentKeys = {
  all: ['appointments'] as const,
  filtered: (filters: AppointmentFilters) => ['appointments', filters] as const,
};

/** Fetch appointments with filters. */
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.filtered(filters ?? {}),
    queryFn: () => appointmentApi.getAll(filters),
    enabled: false, // Disabled until API is connected
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
    },
  });
}

/** Cancel an appointment mutation. */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}
