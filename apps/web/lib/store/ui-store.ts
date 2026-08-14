import { create } from 'zustand';

type UiState = {
  sidebarOpen: boolean;
  activeModalId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveModalId: (id: string | null) => void;
  reset: () => void;
};

const initialUi = {
  sidebarOpen: true,
  activeModalId: null as string | null,
};

export const useUiStore = create<UiState>((set) => ({
  ...initialUi,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveModalId: (id) => set({ activeModalId: id }),
  reset: () => set(initialUi),
}));
