import { create } from "zustand";

interface UiState {
  selectedClusterId: string | null;
  sidebarOpen: boolean;
  setSelectedClusterId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  selectedClusterId: null,
  sidebarOpen: true,
  setSelectedClusterId: (id) => set({ selectedClusterId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
