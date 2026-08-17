import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from './services';
import type { DoctorFilters, DoctorProfile } from './types';

export const doctorKeys = {
  all: ['doctors'] as const,
  list: (filters?: DoctorFilters) => ['doctors', filters] as const,
  detail: (id: string) => ['doctors', id] as const,
  current: ['doctors', 'me'] as const,
};

/** Fetch all doctors with filters. */
export function useDoctors(filters?: DoctorFilters) {
  return useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorApi.getAll(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 20_000,
  });
}

/** Fetch a single doctor by ID. */
export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorApi.getById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/** Fetch profile of current logged-in doctor. */
export function useCurrentDoctor() {
  return useQuery({
    queryKey: doctorKeys.current,
    queryFn: () => doctorApi.getMe(),
  });
}

/** Create doctor mutation (Admin). */
export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<DoctorProfile>) => doctorApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
    },
  });
}

/** Update doctor mutation (Admin). */
export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<DoctorProfile> }) =>
      doctorApi.update(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      void queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
    },
  });
}

/** Delete / Deactivate doctor mutation (Admin). */
export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorKeys.all });
    },
  });
}
