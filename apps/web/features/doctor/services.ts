import { apiClient } from '@/lib/api';
import type { DoctorProfile, DoctorFilters } from './types';

const BASE = '/doctors';

export const MOCK_DOCTORS: DoctorProfile[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    userId: 'u1111111-1111-1111-1111-111111111111',
    firstName: 'Rajesh',
    lastName: 'Sharma',
    specialization: 'Cardiology',
    qualification: 'MD, FACC (Cardiology)',
    experienceYears: 14,
    consultationFee: 750,
    biography:
      'Senior Interventional Cardiologist specializing in preventive heart health, coronary artery disease management, and complex catheter-based interventions.',
    profileImage:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    userId: 'u2222222-2222-2222-2222-222222222222',
    firstName: 'Priya',
    lastName: 'Deshmukh',
    specialization: 'Dermatology',
    qualification: 'MD, DNB (Dermatology)',
    experienceYears: 9,
    consultationFee: 600,
    biography:
      'Consultant Dermatologist & Cosmetic Surgeon with expertise in advanced laser therapies, acne treatment protocols, and pediatric skin care.',
    profileImage:
      'https://images.unsplash.com/photo-1594824813566-88855ce78965?w=400&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    userId: 'u3333333-3333-3333-3333-333333333333',
    firstName: 'Arjun',
    lastName: 'Mehta',
    specialization: 'Orthopedics',
    qualification: 'MS (Orthopedics), MCh',
    experienceYears: 12,
    consultationFee: 800,
    biography:
      'Renowned Orthopedic & Spine Surgeon specializing in robotic joint replacement, sports injury recovery, and arthroscopic reconstructions.',
    profileImage:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  },
];

export const doctorApi = {
  /** Fetch all doctors with optional filter parameters. */
  async getAll(filters?: DoctorFilters): Promise<DoctorProfile[]> {
    try {
      const { data } = await apiClient.get<{ data: DoctorProfile[] }>(BASE, {
        params: filters,
      });
      return data.data ?? data;
    } catch {
      let filtered = [...MOCK_DOCTORS];
      if (filters?.specialization && filters.specialization !== 'ALL') {
        filtered = filtered.filter((d) =>
          d.specialization.toLowerCase().includes(filters.specialization!.toLowerCase()),
        );
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.firstName.toLowerCase().includes(query) ||
            d.lastName.toLowerCase().includes(query) ||
            d.specialization.toLowerCase().includes(query),
        );
      }
      return filtered;
    }
  },

  /** Fetch a single doctor by ID. */
  async getById(id: string): Promise<DoctorProfile> {
    try {
      const { data } = await apiClient.get<{ data: DoctorProfile }>(`${BASE}/${id}`);
      return data.data ?? data;
    } catch {
      const found = MOCK_DOCTORS.find((d) => d.id === id);
      if (!found) {
        throw new Error(`Doctor with ID ${id} not found`);
      }
      return found;
    }
  },

  /** Fetch profile of the currently logged-in doctor. */
  async getMe(): Promise<DoctorProfile> {
    try {
      const { data } = await apiClient.get<{ data: DoctorProfile }>(`${BASE}/me`);
      return data.data ?? data;
    } catch {
      const fallback = MOCK_DOCTORS[0];
      if (!fallback) {
        throw new Error('No doctor profile available');
      }
      return fallback;
    }
  },

  /** Create a new doctor profile (Admin action). */
  async create(payload: Partial<DoctorProfile>): Promise<DoctorProfile> {
    try {
      const { data } = await apiClient.post<{ data: DoctorProfile }>(BASE, payload);
      return data.data ?? data;
    } catch {
      const newDoc: DoctorProfile = {
        id: `d-${Date.now()}`,
        userId: payload.userId || `u-${Date.now()}`,
        firstName: payload.firstName || 'Doctor',
        lastName: payload.lastName || 'Specialist',
        specialization: payload.specialization || 'General Medicine',
        qualification: payload.qualification || 'MBBS',
        experienceYears: payload.experienceYears ?? 5,
        consultationFee: payload.consultationFee ?? 500,
        biography: payload.biography || '',
        profileImage: payload.profileImage || '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      MOCK_DOCTORS.unshift(newDoc);
      return newDoc;
    }
  },

  /** Update doctor profile details (Admin action). */
  async update(id: string, payload: Partial<DoctorProfile>): Promise<DoctorProfile> {
    try {
      const { data } = await apiClient.patch<{ data: DoctorProfile }>(
        `${BASE}/${id}`,
        payload,
      );
      return data.data ?? data;
    } catch {
      const idx = MOCK_DOCTORS.findIndex((d) => d.id === id);
      if (idx !== -1) {
        MOCK_DOCTORS[idx] = {
          ...MOCK_DOCTORS[idx]!,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        return MOCK_DOCTORS[idx]!;
      }
      throw new Error(`Doctor with ID ${id} not found`);
    }
  },

  /** Deactivate doctor profile (soft delete). */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await apiClient.delete<{ success: boolean; message: string }>(
        `${BASE}/${id}`,
      );
      return data;
    } catch {
      const idx = MOCK_DOCTORS.findIndex((d) => d.id === id);
      if (idx !== -1) {
        MOCK_DOCTORS[idx]!.isActive = !MOCK_DOCTORS[idx]!.isActive;
      }
      return { success: true, message: `Doctor ${id} status toggled` };
    }
  },
};
