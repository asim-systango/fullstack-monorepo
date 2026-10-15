import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { leaveDraftReducer } from './leave-draft-slice';
import { requestFiltersReducer } from './request-filters-slice';

/**
 * Ownership rule:
 * - RTK owns unfinished drafts, selection, and filter chrome only.
 * - TanStack Query owns server lists and mutations.
 * Never put Nest entity arrays into this store.
 */
export const store = configureStore({
  reducer: {
    leaveDraft: leaveDraftReducer,
    requestFilters: requestFiltersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { clearDraft, updateDraft, type LeaveDraft } from './leave-draft-slice';
export { setMyPage, setMyStatus } from './request-filters-slice';
