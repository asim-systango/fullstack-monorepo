import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface HotelFiltersState {
  cityDraft: string;
  searchDraft: string;
  appliedCity: string;
  appliedSearch: string;
  page: number;
  limit: number;
}

const initialState: HotelFiltersState = {
  cityDraft: '',
  searchDraft: '',
  appliedCity: '',
  appliedSearch: '',
  page: 1,
  limit: 10,
};

const hotelFiltersSlice = createSlice({
  name: 'hotelFilters',
  initialState,
  reducers: {
    setCityDraft(state, action: PayloadAction<string>) {
      state.cityDraft = action.payload;
    },
    setSearchDraft(state, action: PayloadAction<string>) {
      state.searchDraft = action.payload;
    },
    applyFilters(state) {
      state.appliedCity = state.cityDraft;
      state.appliedSearch = state.searchDraft;
      state.page = 1; // Reset to page 1 on search
    },
    resetFilters(state) {
      state.cityDraft = '';
      state.searchDraft = '';
      state.appliedCity = '';
      state.appliedSearch = '';
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
      state.page = 1;
    },
  },
});

export const {
  setCityDraft,
  setSearchDraft,
  applyFilters,
  resetFilters,
  setPage,
  setLimit,
} = hotelFiltersSlice.actions;

export default hotelFiltersSlice.reducer;
