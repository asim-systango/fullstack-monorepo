import { useQuery } from '@tanstack/react-query';
import { slotApi } from './services';

/** Query key namespace for slot queries. */
export const slotKeys = {
  available: (doctorId: string) => ['slots', 'available', doctorId] as const,
};

/** Fetch available future slots for a doctor. */
export function useAvailableSlots(doctorId: string) {
  return useQuery({
    queryKey: slotKeys.available(doctorId),
    queryFn: () => slotApi.getAvailableByDoctor(doctorId),
    enabled: false, // Disabled until API is connected
  });
}
