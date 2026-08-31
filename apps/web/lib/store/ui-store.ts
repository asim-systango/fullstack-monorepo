import { create } from 'zustand';

/**
 * Client UI chrome only (filters, drafts, selection).
 * Server lists/mutations belong in TanStack Query — never mirror Nest entities here.
 */
type UiState = {
  filterDraft: string;
  appliedFilter: string;
  setFilterDraft: (value: string) => void;
  applyFilter: () => void;
  resetFilters: () => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  filterDraft: '',
  appliedFilter: '',
  setFilterDraft(value) {
    set({ filterDraft: value });
  },
  applyFilter() {
    set({ appliedFilter: get().filterDraft.trim() });
  },
  resetFilters() {
    set({ filterDraft: '', appliedFilter: '' });
  },
}));
