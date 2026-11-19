import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AuctionStatus } from '../schemas/auction';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 */
export type AuctionFilterDraft = {
  q: string;
  category: string;
  status: '' | AuctionStatus;
  minPrice: string;
  maxPrice: string;
};

type UiState = {
  filterDraft: AuctionFilterDraft;
  appliedFilter: AuctionFilterDraft;
};

const emptyFilters: AuctionFilterDraft = {
  q: '',
  category: '',
  status: 'open',
  minPrice: '',
  maxPrice: '',
};

const initialState: UiState = {
  filterDraft: { ...emptyFilters },
  appliedFilter: { ...emptyFilters },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilterField(
      state,
      action: PayloadAction<{ key: keyof AuctionFilterDraft; value: string }>,
    ) {
      const { key, value } = action.payload;
      state.filterDraft[key] = value as never;
    },
    applyFilter(state) {
      state.appliedFilter = { ...state.filterDraft };
    },
    clearFilters(state) {
      state.filterDraft = { ...emptyFilters };
      state.appliedFilter = { ...emptyFilters };
    },
    resetFilterDraft(state) {
      state.filterDraft = { ...state.appliedFilter };
    },
  },
});

export const { setFilterField, applyFilter, clearFilters, resetFilterDraft } =
  uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function filtersToListParams(
  filters: AuctionFilterDraft,
  page = 1,
  limit = 12,
): {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  status?: AuctionStatus;
  minPrice?: number;
  maxPrice?: number;
} {
  const params: {
    page: number;
    limit: number;
    q?: string;
    category?: string;
    status?: AuctionStatus;
    minPrice?: number;
    maxPrice?: number;
  } = { page, limit };

  const q = filters.q.trim();
  if (q) params.q = q;
  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  if (filters.minPrice.trim()) {
    const n = Number(filters.minPrice);
    if (Number.isFinite(n)) params.minPrice = n;
  }
  if (filters.maxPrice.trim()) {
    const n = Number(filters.maxPrice);
    if (Number.isFinite(n)) params.maxPrice = n;
  }
  return params;
}
