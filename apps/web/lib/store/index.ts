import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 *
 * Extend this slice (or add slices) for your domain drafts.
 */
type UiState = {
  filterDraft: string;
  appliedFilter: string;
};

const initialState: UiState = {
  filterDraft: '',
  appliedFilter: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilterDraft(state, action: PayloadAction<string>) {
      state.filterDraft = action.payload;
    },
    applyFilter(state) {
      state.appliedFilter = state.filterDraft.trim();
    },
  },
});

export const { setFilterDraft, applyFilter } = uiSlice.actions;

/* ────────────────────────────────────────────────────────────
 * Appointment Filters Slice (RTK owns drafts/filters only)
 * ──────────────────────────────────────────────────────────── */

type AppointmentFilterState = {
  statusDraft: string;
  dateFromDraft: string;
  dateToDraft: string;
  doctorIdDraft: string;
  appliedStatus: string;
  appliedDateFrom: string;
  appliedDateTo: string;
  appliedDoctorId: string;
};

const appointmentFilterInitial: AppointmentFilterState = {
  statusDraft: '',
  dateFromDraft: '',
  dateToDraft: '',
  doctorIdDraft: '',
  appliedStatus: '',
  appliedDateFrom: '',
  appliedDateTo: '',
  appliedDoctorId: '',
};

const appointmentFilterSlice = createSlice({
  name: 'appointmentFilters',
  initialState: appointmentFilterInitial,
  reducers: {
    setStatusDraft(state, action: PayloadAction<string>) {
      state.statusDraft = action.payload;
    },
    setDateFromDraft(state, action: PayloadAction<string>) {
      state.dateFromDraft = action.payload;
    },
    setDateToDraft(state, action: PayloadAction<string>) {
      state.dateToDraft = action.payload;
    },
    setDoctorIdDraft(state, action: PayloadAction<string>) {
      state.doctorIdDraft = action.payload;
    },
    applyAppointmentFilters(state) {
      state.appliedStatus = state.statusDraft.trim();
      state.appliedDateFrom = state.dateFromDraft.trim();
      state.appliedDateTo = state.dateToDraft.trim();
      state.appliedDoctorId = state.doctorIdDraft.trim();
    },
    clearAppointmentFilters(state) {
      Object.assign(state, appointmentFilterInitial);
    },
  },
});

export const {
  setStatusDraft,
  setDateFromDraft,
  setDateToDraft,
  setDoctorIdDraft,
  applyAppointmentFilters,
  clearAppointmentFilters,
} = appointmentFilterSlice.actions;

/* ────────────────────────────────────────────────────────────
 * Store Configuration
 * ──────────────────────────────────────────────────────────── */

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    appointmentFilters: appointmentFilterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
