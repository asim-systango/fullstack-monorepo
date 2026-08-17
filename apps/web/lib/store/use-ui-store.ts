import { create } from 'zustand';

type UiState = {
  searchQuery: string;
  isBookingModalOpen: boolean;
  activeFilterRole: string;
  setSearchQuery: (query: string) => void;
  setBookingModalOpen: (open: boolean) => void;
  setActiveFilterRole: (role: string) => void;
  resetUiState: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  searchQuery: '',
  isBookingModalOpen: false,
  activeFilterRole: 'ALL',

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setBookingModalOpen: (isBookingModalOpen) => set({ isBookingModalOpen }),
  setActiveFilterRole: (activeFilterRole) => set({ activeFilterRole }),

  resetUiState: () =>
    set({
      searchQuery: '',
      isBookingModalOpen: false,
      activeFilterRole: 'ALL',
    }),
}));
