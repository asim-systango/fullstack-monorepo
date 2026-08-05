import { apiClient } from '@/lib/api';
import type { Appointment, AppointmentFilters } from './types';

const BASE = '/appointments';

/**
 * Appointment API service — placeholder methods.
 * Will be connected on Day 4 (booking engine).
 */
export const appointmentApi = {
  /** Fetch paginated appointments with filters. */
  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    const { data } = await apiClient.get<{ data: Appointment[] }>(BASE, {
      params: filters,
    });
    return data.data;
  },

  /** Book an appointment. */
  async book(payload: { slotId: string; reason?: string }): Promise<Appointment> {
    const { data } = await apiClient.post<{ data: Appointment }>(BASE, payload);
    return data.data;
  },

  /** Cancel an appointment. */
  async cancel(id: string): Promise<Appointment> {
    const { data } = await apiClient.delete<{ data: Appointment }>(`${BASE}/${id}`);
    return data.data;
  },
};
