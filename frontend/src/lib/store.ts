import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  remember: boolean;
  setSession: (token: string, user: AuthUser, remember: boolean) => void;
  clearSession: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      remember: true,
      setSession: (token, user, remember) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("roaddna_token", token);
        }
        set({ token, user, remember });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("roaddna_token");
        }
        set({ token: null, user: null });
      },
      hydrateFromStorage: () => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("roaddna_token");
        if (!token) set({ token: null });
      },
    }),
    {
      name: "roaddna-auth",
      partialize: (state) =>
        state.remember
          ? {
              token: state.token,
              user: state.user,
              remember: state.remember,
            }
          : { remember: false },
    },
  ),
);

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
