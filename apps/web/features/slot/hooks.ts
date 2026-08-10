import { useQuery } from '@tanstack/react-query';
import { slotApi } from './services';
import type { SlotStatus } from './types';

export const slotKeys = {
  all: ['slots'] as const,
  byDoctor: (doctorId: string, status?: SlotStatus) =>
    ['slots', doctorId, status] as const,
};

/** Fetch slots for a doctor with optional status filter. */
export function useSlots(doctorId: string, status?: SlotStatus) {
  return useQuery({
    queryKey: slotKeys.byDoctor(doctorId, status),
    queryFn: () => slotApi.getByDoctor(doctorId, status),
    enabled: Boolean(doctorId),
  });
}

/** Fetch available future slots for a doctor. */
export function useAvailableSlots(doctorId: string) {
  return useQuery({
    queryKey: slotKeys.byDoctor(doctorId, 'AVAILABLE'),
    queryFn: () => slotApi.getAvailableByDoctor(doctorId),
    enabled: Boolean(doctorId),
  });
}
