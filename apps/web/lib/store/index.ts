import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 */
export type ExpenseFilter = {
  from: string;
  to: string;
  payerUserId: string;
  q: string;
  category: string;
  sortBy: 'expenseDate' | 'amountCents' | 'description';
  sortDir: 'ASC' | 'DESC';
  page: number;
  limit: number;
};

const emptyFilter: ExpenseFilter = {
  from: '',
  to: '',
  payerUserId: '',
  q: '',
  category: '',
  sortBy: 'expenseDate',
  sortDir: 'DESC',
  page: 1,
  limit: 10,
};

type UiState = {
  expenseFilterDraft: ExpenseFilter;
  expenseFilterApplied: ExpenseFilter;
};

const initialState: UiState = {
  expenseFilterDraft: emptyFilter,
  expenseFilterApplied: emptyFilter,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setExpenseFilterDraft(state, action: PayloadAction<Partial<ExpenseFilter>>) {
      state.expenseFilterDraft = { ...state.expenseFilterDraft, ...action.payload };
    },
    applyExpenseFilter(state) {
      state.expenseFilterApplied = {
        ...state.expenseFilterDraft,
        page: 1,
      };
      state.expenseFilterDraft = {
        ...state.expenseFilterDraft,
        page: 1,
      };
    },
    setExpensePage(state, action: PayloadAction<number>) {
      const page = Math.max(1, action.payload);
      state.expenseFilterDraft.page = page;
      state.expenseFilterApplied.page = page;
    },
    setExpenseLimit(state, action: PayloadAction<number>) {
      const limit = action.payload;
      state.expenseFilterDraft.limit = limit;
      state.expenseFilterDraft.page = 1;
      state.expenseFilterApplied.limit = limit;
      state.expenseFilterApplied.page = 1;
    },
    clearExpenseFilter(state) {
      state.expenseFilterDraft = emptyFilter;
      state.expenseFilterApplied = emptyFilter;
    },
  },
});

export const {
  setExpenseFilterDraft,
  applyExpenseFilter,
  setExpensePage,
  setExpenseLimit,
  clearExpenseFilter,
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
