'use client';

import { useCallback } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { authUiReducer, resetAuthUi, setPendingEmail } from './slices/auth-ui.slice';
import {
  catalogFiltersReducer,
  resetCatalogFilterDraft,
  setCatalogFilterDraft,
  type CatalogFilterDraft,
} from './slices/catalog-filters.slice';
import {
  checkoutSelectionReducer,
  resetCheckoutWorkflow,
  setBookId,
  setCopyId,
  setMemberId,
} from './slices/checkout-selection.slice';

export const store = configureStore({
  reducer: {
    checkoutSelection: checkoutSelectionReducer,
    catalogFilters: catalogFiltersReducer,
    authUi: authUiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function resetClientStores(): void {
  store.dispatch(resetCheckoutWorkflow());
  store.dispatch(resetCatalogFilterDraft());
  store.dispatch(resetAuthUi());
}

export function useCheckoutSelection() {
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.checkoutSelection);
  const setSelectedMemberId = useCallback(
    (id: string | null) => dispatch(setMemberId(id)),
    [dispatch],
  );
  const setSelectedBookId = useCallback(
    (id: string | null) => dispatch(setBookId(id)),
    [dispatch],
  );
  const setSelectedCopyId = useCallback(
    (id: string | null) => dispatch(setCopyId(id)),
    [dispatch],
  );
  const resetWorkflow = useCallback(() => {
    dispatch(resetCheckoutWorkflow());
  }, [dispatch]);
  return {
    selectedMemberId: selection.memberId,
    selectedBookId: selection.bookId,
    selectedCopyId: selection.copyId,
    setSelectedMemberId,
    setSelectedBookId,
    setSelectedCopyId,
    resetCheckoutWorkflow: resetWorkflow,
  };
}

export function useAuthUi() {
  const dispatch = useAppDispatch();
  const pendingEmail = useAppSelector((state) => state.authUi.pendingEmail);
  return {
    pendingEmail,
    setPendingEmail: (email: string | null) => dispatch(setPendingEmail(email)),
  };
}

export function useCatalogFilterDraft() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.catalogFilters);
  const setDraft = useCallback(
    (patch: Partial<CatalogFilterDraft>) => {
      dispatch(setCatalogFilterDraft(patch));
    },
    [dispatch],
  );
  const resetDraft = useCallback(() => {
    dispatch(resetCatalogFilterDraft());
  }, [dispatch]);
  return { draft, setDraft, resetDraft };
}

export {
  setMemberId,
  setBookId,
  setCopyId,
  resetCheckoutWorkflow,
} from './slices/checkout-selection.slice';
export {
  setCatalogFilterDraft,
  resetCatalogFilterDraft,
} from './slices/catalog-filters.slice';
export { setPendingEmail, resetAuthUi } from './slices/auth-ui.slice';
