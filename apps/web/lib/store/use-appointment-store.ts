import { create } from 'zustand';

export type MultiStepBookingData = {
  step: 1 | 2 | 3 | 4;
  selectedDoctorId: string | null;
  selectedDoctorName: string | null;
  selectedDate: string;
  selectedTimeSlot: string | null;
  lockId: string | null;
  notes: string;
};

type AppointmentStoreState = {
  booking: MultiStepBookingData;
  filterStatus: string;
  filterDateFrom: string;
  filterDateTo: string;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  selectDoctor: (id: string, name: string) => void;
  selectDateSlot: (date: string, timeSlot: string) => void;
  setLockId: (lockId: string) => void;
  setNotes: (notes: string) => void;
  resetBooking: () => void;

  setFilterStatus: (status: string) => void;
  setFilterDateFrom: (dateFrom: string) => void;
  setFilterDateTo: (dateTo: string) => void;
  clearFilters: () => void;
};

const initialBookingState: MultiStepBookingData = {
  step: 1,
  selectedDoctorId: null,
  selectedDoctorName: null,
  selectedDate: new Date().toISOString().split('T')[0] ?? '',
  selectedTimeSlot: null,
  lockId: null,
  notes: '',
};

export const useAppointmentStore = create<AppointmentStoreState>((set) => ({
  booking: initialBookingState,
  filterStatus: 'ALL',
  filterDateFrom: '',
  filterDateTo: '',

  setStep: (step) =>
    set((state) => ({
      booking: { ...state.booking, step },
    })),

  selectDoctor: (selectedDoctorId, selectedDoctorName) =>
    set((state) => ({
      booking: { ...state.booking, selectedDoctorId, selectedDoctorName, step: 2 },
    })),

  selectDateSlot: (selectedDate, selectedTimeSlot) =>
    set((state) => ({
      booking: { ...state.booking, selectedDate, selectedTimeSlot, step: 3 },
    })),

  setLockId: (lockId) =>
    set((state) => ({
      booking: { ...state.booking, lockId },
    })),

  setNotes: (notes) =>
    set((state) => ({
      booking: { ...state.booking, notes },
    })),

  resetBooking: () => set({ booking: initialBookingState }),

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterDateFrom: (filterDateFrom) => set({ filterDateFrom }),
  setFilterDateTo: (filterDateTo) => set({ filterDateTo }),
  clearFilters: () => set({ filterStatus: 'ALL', filterDateFrom: '', filterDateTo: '' }),
}));
