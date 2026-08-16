import { create } from 'zustand';

type LibraryState = {
  selectedMemberId: string | null;
  selectedCopyId: string | null;
  selectedBookId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  setSelectedCopyId: (id: string | null) => void;
  setSelectedBookId: (id: string | null) => void;
  resetCheckoutWorkflow: () => void;
  reset: () => void;
};

const initialLibrary = {
  selectedMemberId: null as string | null,
  selectedCopyId: null as string | null,
  selectedBookId: null as string | null,
};

export const useLibraryStore = create<LibraryState>((set) => ({
  ...initialLibrary,
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  setSelectedCopyId: (id) => set({ selectedCopyId: id }),
  setSelectedBookId: (id) => set({ selectedBookId: id }),
  resetCheckoutWorkflow: () =>
    set({
      selectedMemberId: null,
      selectedCopyId: null,
      selectedBookId: null,
    }),
  reset: () => set(initialLibrary),
}));
