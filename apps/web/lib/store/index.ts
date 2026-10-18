import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { IssueStatus } from '../domain-types';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 */
type IssueFiltersState = {
  status: IssueStatus | '';
  labelId: string;
  assigneeId: string;
  q: string;
};

type UiState = {
  issueFilters: IssueFiltersState;
  createIssueDraft: { title: string; description: string };
};

const initialState: UiState = {
  issueFilters: {
    status: '',
    labelId: '',
    assigneeId: '',
    q: '',
  },
  createIssueDraft: { title: '', description: '' },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIssueFilter(
      state,
      action: PayloadAction<{ key: keyof IssueFiltersState; value: string }>,
    ) {
      const { key, value } = action.payload;
      if (key === 'status') {
        state.issueFilters.status = value as IssueStatus | '';
      } else {
        state.issueFilters[key] = value;
      }
    },
    clearIssueFilters(state) {
      state.issueFilters = { status: '', labelId: '', assigneeId: '', q: '' };
    },
    setCreateIssueDraft(
      state,
      action: PayloadAction<Partial<{ title: string; description: string }>>,
    ) {
      state.createIssueDraft = { ...state.createIssueDraft, ...action.payload };
    },
    clearCreateIssueDraft(state) {
      state.createIssueDraft = { title: '', description: '' };
    },
  },
});

export const {
  setIssueFilter,
  clearIssueFilters,
  setCreateIssueDraft,
  clearCreateIssueDraft,
} = uiSlice.actions;

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
