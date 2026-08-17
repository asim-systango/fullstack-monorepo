import { apiClient } from '@/lib/api';
import type {
  Appointment,
  AppointmentFilters,
  CompleteAppointmentPayload,
  Prescription,
  MedicalNote,
  PrescriptionItem,
} from './types';

const BASE = '/appointments';

function cleanFilters<T extends Record<string, unknown>>(
  filters?: T,
): Partial<T> | undefined {
  if (!filters) return undefined;
  const cleaned: Partial<T> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined && value !== 'ALL') {
      (cleaned as Record<string, unknown>)[key] = value;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export const appointmentApi = {
  /** Fetch all appointments with optional filters. */
  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    try {
      const response = await apiClient.get<
        | { items: Appointment[]; total: number }
        | { data: { items: Appointment[] } | Appointment[] }
        | Appointment[]
      >(BASE, {
        params: cleanFilters(filters as Record<string, unknown>),
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if ('items' in data && Array.isArray(data.items)) return data.items;
      if ('data' in data) {
        const inner = data.data;
        if (Array.isArray(inner)) return inner;
        if (
          typeof inner === 'object' &&
          inner &&
          'items' in inner &&
          Array.isArray(inner.items)
        ) {
          return inner.items;
        }
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      return [];
    }
  },

  /** Get single appointment details by ID. */
  async getById(id: string): Promise<Appointment> {
    const { data } = await apiClient.get<Appointment | { data: Appointment }>(
      `${BASE}/${id}`,
    );
    return 'data' in data && data.data ? data.data : (data as Appointment);
  },

  /** Book an appointment. */
  async book(payload: { slotId: string; reason?: string }): Promise<Appointment> {
    const { data } = await apiClient.post<{ data: Appointment }>(BASE, payload);
    return data.data ?? data;
  },

  async createPaymentCheckout(
    slotId: string,
  ): Promise<{ url: string; sessionId?: string }> {
    const response = await apiClient.post<
      { url: string; sessionId?: string } | { data: { url: string; sessionId?: string } }
    >('/payments/create-checkout', { slotId });

    const resData = response.data;
    if (resData && 'data' in resData && resData.data) {
      return resData.data;
    }
    return resData as { url: string; sessionId?: string };
  },

  /** Cancel an appointment. */
  async cancel(id: string): Promise<Appointment> {
    const { data } = await apiClient.delete<{ data: Appointment }>(`${BASE}/${id}`);
    return data.data ?? data;
  },

  /** Complete an appointment with prescription & medical notes. */
  async complete(id: string, payload?: CompleteAppointmentPayload): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment | { data: Appointment }>(
      `${BASE}/${id}/complete`,
      payload,
    );
    return 'data' in data && data.data ? data.data : (data as Appointment);
  },
};

export const adminAppointmentApi = {
  async getAdminAppointments(filters?: AppointmentFilters): Promise<{
    items: Appointment[];
    meta: { page: number; limit: number; totalItems: number; totalPages: number };
  }> {
    const { data } = await apiClient.get<{
      items?: Appointment[];
      meta?: { page: number; limit: number; totalItems: number; totalPages: number };
      data?: {
        items: Appointment[];
        meta: { page: number; limit: number; totalItems: number; totalPages: number };
      };
    }>('/admin/appointments', {
      params: cleanFilters(filters as Record<string, unknown>),
    });

    if (data.data?.items) {
      return data.data;
    }
    if (data.items) {
      return {
        items: data.items,
        meta: data.meta ?? {
          page: 1,
          limit: 10,
          totalItems: data.items.length,
          totalPages: 1,
        },
      };
    }
    return { items: [], meta: { page: 1, limit: 10, totalItems: 0, totalPages: 0 } };
  },
};

export const prescriptionApi = {
  async createForAppointment(
    appointmentId: string,
    payload: { medicines: PrescriptionItem[]; instructions?: string },
  ): Promise<Prescription> {
    const { data } = await apiClient.post<Prescription | { data: Prescription }>(
      `/appointments/${appointmentId}/prescriptions`,
      payload,
    );
    return 'data' in data && data.data ? data.data : (data as Prescription);
  },

  async getByAppointmentId(appointmentId: string): Promise<Prescription | null> {
    const { data } = await apiClient.get<Prescription | { data: Prescription | null }>(
      `/appointments/${appointmentId}/prescription`,
    );
    return 'data' in data ? data.data : (data as Prescription);
  },

  async getById(id: string): Promise<Prescription> {
    const { data } = await apiClient.get<Prescription | { data: Prescription }>(
      `/prescriptions/${id}`,
    );
    return 'data' in data && data.data ? data.data : (data as Prescription);
  },
};

export const medicalNoteApi = {
  async createForAppointment(
    appointmentId: string,
    payload: { notes: string },
  ): Promise<MedicalNote> {
    const { data } = await apiClient.post<MedicalNote | { data: MedicalNote }>(
      `/appointments/${appointmentId}/medical-notes`,
      payload,
    );
    return 'data' in data && data.data ? data.data : (data as MedicalNote);
  },

  async getByAppointmentId(appointmentId: string): Promise<MedicalNote[]> {
    const { data } = await apiClient.get<MedicalNote[] | { data: MedicalNote[] }>(
      `/appointments/${appointmentId}/medical-notes`,
    );
    const result = 'data' in data ? data.data : data;
    return Array.isArray(result) ? result : [];
  },

  async getPatientHistory(): Promise<
    { appointmentId: string; summary: string; createdAt: string }[]
  > {
    const { data } = await apiClient.get<
      | { appointmentId: string; summary: string; createdAt: string }[]
      | { data: { appointmentId: string; summary: string; createdAt: string }[] }
    >('/patients/me/medical-notes');
    const result = 'data' in data ? data.data : data;
    return Array.isArray(result) ? result : [];
  },
};
