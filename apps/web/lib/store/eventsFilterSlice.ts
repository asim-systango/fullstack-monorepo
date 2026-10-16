import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface EventsFilterState {
  q: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  viewMode: 'grid' | 'table';
  page: number;
}

const initialState: EventsFilterState = {
  q: '',
  category: 'ALL',
  status: 'ALL',
  startDate: '',
  endDate: '',
  viewMode: 'grid',
  page: 1,
};

export const eventsFilterSlice = createSlice({
  name: 'eventsFilter',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.q = action.payload;
      state.page = 1;
    },
    setCategoryFilter(state, action: PayloadAction<string>) {
      state.category = action.payload;
      state.page = 1;
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.status = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setViewMode(state, action: PayloadAction<'grid' | 'table'>) {
      state.viewMode = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters(state) {
      state.q = '';
      state.category = 'ALL';
      state.status = 'ALL';
      state.startDate = '';
      state.endDate = '';
      state.page = 1;
    },
  },
});

export const {
  setSearchQuery,
  setCategoryFilter,
  setStatusFilter,
  setDateRange,
  setViewMode,
  setPage,
  resetFilters,
} = eventsFilterSlice.actions;

export default eventsFilterSlice.reducer;
