import { apiClient } from '@/lib/api';
import type { DoctorProfile, DoctorFilters } from './types';

const BASE = '/doctors';

export const doctorApi = {
  /** Fetch all doctors with optional filter parameters. */
  async getAll(filters?: DoctorFilters): Promise<DoctorProfile[]> {
    try {
      const { data } = await apiClient.get<DoctorProfile[] | { data: DoctorProfile[] }>(
        BASE,
        { params: filters },
      );
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      return [];
    }
  },

  /** Fetch a single doctor by ID. */
  async getById(id: string): Promise<DoctorProfile> {
    const { data } = await apiClient.get<DoctorProfile | { data: DoctorProfile }>(
      `${BASE}/${id}`,
    );
    return 'data' in data && data.data ? data.data : (data as DoctorProfile);
  },

  /** Fetch profile of the currently logged-in doctor. */
  async getMe(): Promise<DoctorProfile> {
    const { data } = await apiClient.get<DoctorProfile | { data: DoctorProfile }>(
      `${BASE}/me`,
    );
    return 'data' in data && data.data ? data.data : (data as DoctorProfile);
  },

  /** Create a new doctor profile (Admin action). */
  async create(payload: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const { data } = await apiClient.post<DoctorProfile | { data: DoctorProfile }>(
      BASE,
      payload,
    );
    return 'data' in data && data.data ? data.data : (data as DoctorProfile);
  },

  /** Update doctor profile details (Admin action). */
  async update(id: string, payload: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const { data } = await apiClient.patch<DoctorProfile | { data: DoctorProfile }>(
      `${BASE}/${id}`,
      payload,
    );
    return 'data' in data && data.data ? data.data : (data as DoctorProfile);
  },

  /** Deactivate doctor profile (soft delete). */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.delete<{ success: boolean; message: string }>(
      `${BASE}/${id}`,
    );
    return data;
  },
};
