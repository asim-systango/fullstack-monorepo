import { apiClient } from '@/lib/api';
import type { Slot } from './types';

/**
 * Slot API service — placeholder methods.
 * Will be connected on Day 2.
 */
export const slotApi = {
  /** Fetch available future slots for a specific doctor. */
  async getAvailableByDoctor(doctorId: string): Promise<Slot[]> {
    const { data } = await apiClient.get<{ data: Slot[] }>(`/doctors/${doctorId}/slots`);
    return data.data;
  },
};
