import { apiClient } from '@/lib/api';
import type { DoctorProfile } from './types';

const BASE = '/doctors';

/**
 * Doctor API service — placeholder methods.
 * Will be connected to real endpoints on Day 2.
 */
export const doctorApi = {
  /** Fetch all active doctors. */
  async getAll(): Promise<DoctorProfile[]> {
    const { data } = await apiClient.get<{ data: DoctorProfile[] }>(BASE);
    return data.data;
  },

  /** Fetch a single doctor by ID. */
  async getById(id: string): Promise<DoctorProfile> {
    const { data } = await apiClient.get<{ data: DoctorProfile }>(`${BASE}/${id}`);
    return data.data;
  },
};
