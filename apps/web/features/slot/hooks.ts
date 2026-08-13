import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slotApi } from './services';
import type { SlotStatus, BulkCreateSlotInput } from './types';

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
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
  });
}

/** Fetch available future slots for a doctor. */
export function useAvailableSlots(doctorId: string) {
  return useQuery({
    queryKey: slotKeys.byDoctor(doctorId, 'AVAILABLE'),
    queryFn: () => slotApi.getAvailableByDoctor(doctorId),
    enabled: Boolean(doctorId),
    placeholderData: (previousData) => previousData,
    staleTime: 10_000,
  });
}

/** Hook to bulk generate consultation slots. */
export function useCreateBulkSlots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreateSlotInput) => slotApi.createBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
    },
  });
}

/** Hook to update a slot status (e.g. Block / Unblock). */
export function useUpdateSlotStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SlotStatus }) =>
      slotApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
    },
  });
}

/** Hook to delete an unbooked consultation slot. */
export function useDeleteSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => slotApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: slotKeys.all });
    },
  });
}
