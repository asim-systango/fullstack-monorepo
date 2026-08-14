import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  filterDraft: string;
  appliedFilter: string;
}

const initialState: UiState = {
  filterDraft: '',
  appliedFilter: '',
};

export const uiSlice = createSlice({
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
export default uiSlice.reducer;
