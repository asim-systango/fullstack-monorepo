import { apiClient } from '@/lib/api';
import type { Slot, SlotStatus, BulkCreateSlotInput } from './types';

export const slotApi = {
  /** Fetch slots for a doctor with optional status filter. */
  async getByDoctor(doctorId: string, status?: SlotStatus): Promise<Slot[]> {
    try {
      const { data } = await apiClient.get<Slot[] | { data: Slot[] }>('/slots', {
        params: { doctorId, status },
      });
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      return [];
    }
  },

  /** Fetch available slots for a doctor. */
  async getAvailableByDoctor(doctorId: string): Promise<Slot[]> {
    return this.getByDoctor(doctorId, 'AVAILABLE');
  },

  /** Bulk generate consultation slots for a doctor. */
  async createBulk(payload: BulkCreateSlotInput): Promise<Slot[]> {
    const cleanPayload: Record<string, unknown> = { ...payload };
    Object.keys(cleanPayload).forEach((key) => {
      if (cleanPayload[key] === '' || cleanPayload[key] === undefined) {
        delete cleanPayload[key];
      }
    });
    const { data } = await apiClient.post<Slot[] | { data: Slot[] }>(
      '/slots/bulk',
      cleanPayload,
    );
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  /** Update slot status (e.g. Block / Unblock). */
  async updateStatus(id: string, status: SlotStatus): Promise<Slot> {
    const { data } = await apiClient.patch<Slot | { data: Slot }>(`/slots/${id}`, {
      status,
    });
    return 'data' in data && data.data ? data.data : (data as Slot);
  },

  /** Delete an unbooked consultation slot. */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/slots/${id}`);
  },
};
