import { create } from 'zustand';

export type DeskPanel = 'checkout' | 'return' | 'member' | 'overdue' | 'catalog' | null;

type LibraryState = {
  selectedMemberId: string | null;
  selectedCopyId: string | null;
  selectedBookId: string | null;
  checkoutDialogOpen: boolean;
  returnDialogOpen: boolean;
  activeDeskPanel: DeskPanel;
  setSelectedMemberId: (id: string | null) => void;
  setSelectedCopyId: (id: string | null) => void;
  setSelectedBookId: (id: string | null) => void;
  setCheckoutDialogOpen: (open: boolean) => void;
  setReturnDialogOpen: (open: boolean) => void;
  setActiveDeskPanel: (panel: DeskPanel) => void;
  resetCheckoutWorkflow: () => void;
  reset: () => void;
};

const initialLibrary = {
  selectedMemberId: null as string | null,
  selectedCopyId: null as string | null,
  selectedBookId: null as string | null,
  checkoutDialogOpen: false,
  returnDialogOpen: false,
  activeDeskPanel: null as DeskPanel,
};

export const useLibraryStore = create<LibraryState>((set) => ({
  ...initialLibrary,
  setSelectedMemberId: (id) => set({ selectedMemberId: id }),
  setSelectedCopyId: (id) => set({ selectedCopyId: id }),
  setSelectedBookId: (id) => set({ selectedBookId: id }),
  setCheckoutDialogOpen: (open) => set({ checkoutDialogOpen: open }),
  setReturnDialogOpen: (open) => set({ returnDialogOpen: open }),
  setActiveDeskPanel: (panel) => set({ activeDeskPanel: panel }),
  resetCheckoutWorkflow: () =>
    set({
      selectedMemberId: null,
      selectedCopyId: null,
      selectedBookId: null,
      checkoutDialogOpen: false,
    }),
  reset: () => set(initialLibrary),
}));
