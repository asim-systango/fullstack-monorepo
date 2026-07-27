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

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
