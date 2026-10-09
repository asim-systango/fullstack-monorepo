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

type IssueFiltersState = {
  status: string;
  labelId: string;
  assigneeId: string;
  page: number;
};
const issueFiltersInitial: IssueFiltersState = {
  status: '',
  labelId: '',
  assigneeId: '',
  page: 1,
};
const issueFiltersSlice = createSlice({
  name: 'issueFilters',
  initialState: issueFiltersInitial,
  reducers: {
    setIssueFilter(state, action: PayloadAction<Partial<IssueFiltersState>>) {
      Object.assign(state, action.payload, { page: 1 });
    },
    setIssuePage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    clearIssueFilters() {
      return issueFiltersInitial;
    },
  },
});
export const { setIssueFilter, setIssuePage, clearIssueFilters } =
  issueFiltersSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    issueFilters: issueFiltersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
