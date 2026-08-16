import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CatalogFilterDraft = {
  q: string;
  author: string;
  isbn: string;
  availableOnly: boolean;
};

const initialState: CatalogFilterDraft = {
  q: '',
  author: '',
  isbn: '',
  availableOnly: false,
};

const catalogFiltersSlice = createSlice({
  name: 'catalogFilters',
  initialState,
  reducers: {
    setDraft(state, action: PayloadAction<Partial<CatalogFilterDraft>>) {
      Object.assign(state, action.payload);
    },
    resetDraft() {
      return initialState;
    },
  },
});

export const { setDraft: setCatalogFilterDraft, resetDraft: resetCatalogFilterDraft } =
  catalogFiltersSlice.actions;

export const catalogFiltersReducer = catalogFiltersSlice.reducer;
