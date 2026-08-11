import { apiClient } from '@/lib/api';
import type {
  Appointment,
  AppointmentFilters,
  CompleteAppointmentPayload,
  Prescription,
  MedicalNote,
  PrescriptionItem,
} from './types';
import { MOCK_DOCTORS } from '../doctor/services';

const BASE = '/appointments';

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    patientId: 'p1111111-1111-1111-1111-111111111111',
    slotId: 's1111111-1111-1111-1111-111111111111',
    status: 'COMPLETED',
    reason: 'Routine cardiac consultation & lipid profile review',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    deletedAt: null,
    slot: {
      id: 's1111111-1111-1111-1111-111111111111',
      doctorId: MOCK_DOCTORS[0]!.id,
      startsAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 10).toISOString(),
      endsAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 10.5).toISOString(),
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor: MOCK_DOCTORS[0],
    },
    prescription: {
      id: 'pr111111-1111-1111-1111-111111111111',
      appointmentId: 'a1111111-1111-1111-1111-111111111111',
      medicines: [
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily after dinner',
          duration: '30 days',
        },
        {
          name: 'Aspirin',
          dosage: '75mg',
          frequency: 'Once daily after breakfast',
          duration: '30 days',
        },
      ],
      instructions:
        'Maintain low sodium diet. Avoid strenuous exercise until lipid repeat test.',
      createdAt: new Date().toISOString(),
    },
    medicalNotes: [
      {
        id: 'mn1',
        appointmentId: 'a1111111-1111-1111-1111-111111111111',
        doctorId: MOCK_DOCTORS[0]!.id,
        notes:
          'Patient reports mild dyspnea on stair climbing. BP 128/82 mmHg. Pulse 72 bpm regular.',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    patientId: 'p2222222-2222-2222-2222-222222222222',
    slotId: 's1111111-1111-1111-1111-111111111112',
    status: 'SCHEDULED',
    reason: 'Chest discomfort on exertion follow-up',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    slot: {
      id: 's1111111-1111-1111-1111-111111111112',
      doctorId: MOCK_DOCTORS[0]!.id,
      startsAt: new Date(Date.now() + 86400000 + 3600000 * 11).toISOString(),
      endsAt: new Date(Date.now() + 86400000 + 3600000 * 11.5).toISOString(),
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor: MOCK_DOCTORS[0],
    },
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    patientId: 'p1111111-1111-1111-1111-111111111111',
    slotId: 's2222222-2222-2222-2222-222222222221',
    status: 'COMPLETED',
    reason: 'Skin flare-up consultation and allergy check',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    deletedAt: null,
    slot: {
      id: 's2222222-2222-2222-2222-222222222221',
      doctorId: MOCK_DOCTORS[1]!.id,
      startsAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 14).toISOString(),
      endsAt: new Date(Date.now() - 86400000 * 5 + 3600000 * 14.5).toISOString(),
      status: 'BOOKED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor: MOCK_DOCTORS[1],
    },
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    patientId: 'p2222222-2222-2222-2222-222222222222',
    slotId: 's3333333-3333-3333-3333-333333333331',
    status: 'CANCELLED',
    reason: 'Knee joint pain consultation (cancelled by patient)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    deletedAt: new Date().toISOString(),
    slot: {
      id: 's3333333-3333-3333-3333-333333333331',
      doctorId: MOCK_DOCTORS[2]!.id,
      startsAt: new Date(Date.now() - 86400000 * 1 + 3600000 * 16).toISOString(),
      endsAt: new Date(Date.now() - 86400000 * 1 + 3600000 * 16.5).toISOString(),
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      doctor: MOCK_DOCTORS[2],
    },
  },
];

export const appointmentApi = {
  /** Fetch all appointments with optional filters. */
  async getAll(filters?: AppointmentFilters): Promise<Appointment[]> {
    try {
      const response = await apiClient.get<
        | { items: Appointment[]; total: number }
        | { data: { items: Appointment[] } | Appointment[] }
        | Appointment[]
      >(BASE, {
        params: filters,
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
    } catch {
      let filtered = [...MOCK_APPOINTMENTS];
      if (filters?.status) {
        filtered = filtered.filter((a) => a.status === filters.status);
      }
      if (filters?.doctorId) {
        filtered = filtered.filter((a) => a.slot?.doctorId === filters.doctorId);
      }
      return filtered;
    }
  },

  /** Get single appointment details by ID. */
  async getById(id: string): Promise<Appointment> {
    try {
      const { data } = await apiClient.get<Appointment | { data: Appointment }>(
        `${BASE}/${id}`,
      );
      return 'data' in data && data.data ? data.data : (data as Appointment);
    } catch {
      const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
      if (found) return found;
      throw new Error(`Appointment ${id} not found`);
    }
  },

  /** Book an appointment. */
  async book(payload: { slotId: string; reason?: string }): Promise<Appointment> {
    try {
      const { data } = await apiClient.post<{ data: Appointment }>(BASE, payload);
      return data.data ?? data;
    } catch {
      const newAppt: Appointment = {
        id: `a-mock-${Date.now()}`,
        patientId: 'p1111111-1111-1111-1111-111111111111',
        slotId: payload.slotId,
        status: 'SCHEDULED',
        reason: payload.reason ?? 'General Consultation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      MOCK_APPOINTMENTS.unshift(newAppt);
      return newAppt;
    }
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
    try {
      const { data } = await apiClient.delete<{ data: Appointment }>(`${BASE}/${id}`);
      return data.data ?? data;
    } catch {
      const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
      if (found) {
        found.status = 'CANCELLED';
        found.deletedAt = new Date().toISOString();
        return found;
      }
      throw new Error(`Appointment ${id} not found`);
    }
  },

  /** Complete an appointment with prescription & medical notes. */
  async complete(id: string, payload?: CompleteAppointmentPayload): Promise<Appointment> {
    try {
      const { data } = await apiClient.post<Appointment | { data: Appointment }>(
        `${BASE}/${id}/complete`,
        payload,
      );
      return 'data' in data && data.data ? data.data : (data as Appointment);
    } catch {
      const found = MOCK_APPOINTMENTS.find((a) => a.id === id);
      if (found) {
        found.status = 'COMPLETED';
        if (payload?.prescription) {
          found.prescription = {
            id: `pr-mock-${Date.now()}`,
            appointmentId: id,
            medicines: payload.prescription.medicines,
            instructions: payload.prescription.instructions ?? null,
            createdAt: new Date().toISOString(),
          };
        }
        if (payload?.medicalNote) {
          found.medicalNotes = [
            ...(found.medicalNotes ?? []),
            {
              id: `mn-mock-${Date.now()}`,
              appointmentId: id,
              doctorId: found.slot?.doctorId ?? 'd1',
              notes: payload.medicalNote.notes,
              createdAt: new Date().toISOString(),
            },
          ];
        }
        return found;
      }

      const newCompleted: Appointment = {
        id,
        patientId: 'p1111111-1111-1111-1111-111111111111',
        slotId: 's1111111-1111-1111-1111-111111111111',
        status: 'COMPLETED',
        reason: 'Clinical Visit Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        prescription: payload?.prescription
          ? {
              id: `pr-mock-${Date.now()}`,
              appointmentId: id,
              medicines: payload.prescription.medicines,
              instructions: payload.prescription.instructions ?? null,
              createdAt: new Date().toISOString(),
            }
          : undefined,
        medicalNotes: payload?.medicalNote
          ? [
              {
                id: `mn-mock-${Date.now()}`,
                appointmentId: id,
                doctorId: 'd1',
                notes: payload.medicalNote.notes,
                createdAt: new Date().toISOString(),
              },
            ]
          : undefined,
      };
      MOCK_APPOINTMENTS.unshift(newCompleted);
      return newCompleted;
    }
  },
};

export const adminAppointmentApi = {
  async getAdminAppointments(filters?: AppointmentFilters): Promise<{
    items: Appointment[];
    meta: { page: number; limit: number; totalItems: number; totalPages: number };
  }> {
    try {
      const { data } = await apiClient.get<{
        items?: Appointment[];
        meta?: { page: number; limit: number; totalItems: number; totalPages: number };
        data?: {
          items: Appointment[];
          meta: { page: number; limit: number; totalItems: number; totalPages: number };
        };
      }>('/admin/appointments', { params: filters });

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
    } catch {
      const items = await appointmentApi.getAll(filters);
      return {
        items,
        meta: { page: 1, limit: 10, totalItems: items.length, totalPages: 1 },
      };
    }
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
