import { useQuery } from '@tanstack/react-query';
import { doctorApi } from './services';
import type { DoctorFilters } from './types';

export const doctorKeys = {
  all: ['doctors'] as const,
  list: (filters?: DoctorFilters) => ['doctors', filters] as const,
  detail: (id: string) => ['doctors', id] as const,
};

/** Fetch all doctors with filters. */
export function useDoctors(filters?: DoctorFilters) {
  return useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => doctorApi.getAll(filters),
  });
}

/** Fetch a single doctor by ID. */
export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorApi.getById(id),
    enabled: Boolean(id),
  });
}
