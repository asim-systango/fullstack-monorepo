import { useQuery } from '@tanstack/react-query';
import { doctorApi } from './services';

/** Query key namespace for doctor queries. */
export const doctorKeys = {
  all: ['doctors'] as const,
  detail: (id: string) => ['doctors', id] as const,
};

/** Fetch all doctors. */
export function useDoctors() {
  return useQuery({
    queryKey: doctorKeys.all,
    queryFn: () => doctorApi.getAll(),
    enabled: false, // Disabled until API is connected
  });
}

/** Fetch a single doctor by ID. */
export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorApi.getById(id),
    enabled: false, // Disabled until API is connected
  });
}
