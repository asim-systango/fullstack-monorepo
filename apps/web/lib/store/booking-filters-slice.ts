import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BookingFiltersState {
  statusFilter: 'all' | 'confirmed' | 'cancelled' | 'completed';
  page: number;
  limit: number;
}

const initialState: BookingFiltersState = {
  statusFilter: 'all',
  page: 1,
  limit: 10,
};

const bookingFiltersSlice = createSlice({
  name: 'bookingFilters',
  initialState,
  reducers: {
    setStatusFilter(
      state,
      action: PayloadAction<'all' | 'confirmed' | 'cancelled' | 'completed'>,
    ) {
      state.statusFilter = action.payload;
      state.page = 1; // Reset to page 1 on filter change
    },
    setBookingPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setBookingLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
  },
});

export const { setStatusFilter, setBookingPage, setBookingLimit } =
  bookingFiltersSlice.actions;

export default bookingFiltersSlice.reducer;
