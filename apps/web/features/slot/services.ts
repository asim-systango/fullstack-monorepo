import { apiClient } from '@/lib/api';
import type { Slot, SlotStatus, CreateSlotInput, BulkCreateSlotInput } from './types';

export const MOCK_SLOTS: Slot[] = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    doctorId: 'd1111111-1111-1111-1111-111111111111',
    startsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
    status: 'BOOKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's1111111-1111-1111-1111-111111111112',
    doctorId: 'd1111111-1111-1111-1111-111111111111',
    startsAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's1111111-1111-1111-1111-111111111113',
    doctorId: 'd1111111-1111-1111-1111-111111111111',
    startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 4.5 * 3600 * 1000).toISOString(),
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's1111111-1111-1111-1111-111111111114',
    doctorId: 'd1111111-1111-1111-1111-111111111111',
    startsAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 5.5 * 3600 * 1000).toISOString(),
    status: 'BLOCKED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const slotApi = {
  /** Fetch slots for a doctor with optional status filter. */
  async getByDoctor(doctorId: string, status?: SlotStatus): Promise<Slot[]> {
    try {
      const { data } = await apiClient.get<{ data: Slot[] }>('/slots', {
        params: { doctorId, status },
      });
      return data.data ?? data;
    } catch {
      let filtered = MOCK_SLOTS.filter((s) => s.doctorId === doctorId);
      if (filtered.length === 0) {
        // Generate default mock slots for any doctor ID
        filtered = [
          {
            id: `mock-slot-1-${doctorId.slice(0, 4)}`,
            doctorId,
            startsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            endsAt: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(),
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `mock-slot-2-${doctorId.slice(0, 4)}`,
            doctorId,
            startsAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
            endsAt: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
            status: 'AVAILABLE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `mock-slot-3-${doctorId.slice(0, 4)}`,
            doctorId,
            startsAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            endsAt: new Date(Date.now() + 4.5 * 3600 * 1000).toISOString(),
            status: 'BOOKED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
      if (status) {
        filtered = filtered.filter((s) => s.status === status);
      }
      return filtered;
    }
  },

  /** Fetch available slots for a doctor. */
  async getAvailableByDoctor(doctorId: string): Promise<Slot[]> {
    return this.getByDoctor(doctorId, 'AVAILABLE');
  },

  /** Create a single consultation slot. */
  async create(payload: CreateSlotInput): Promise<Slot> {
    const { data } = await apiClient.post<{ data: Slot }>('/slots', payload);
    return data.data ?? data;
  },

  /** Bulk generate consultation slots for a doctor. */
  async createBulk(payload: BulkCreateSlotInput): Promise<Slot[]> {
    const { data } = await apiClient.post<{ data: Slot[] }>('/slots/bulk', payload);
    return data.data ?? data;
  },

  /** Update slot status (e.g. Block / Unblock). */
  async updateStatus(id: string, status: SlotStatus): Promise<Slot> {
    const { data } = await apiClient.patch<{ data: Slot }>(`/slots/${id}`, { status });
    return data.data ?? data;
  },

  /** Delete an unbooked consultation slot. */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/slots/${id}`);
  },
};
