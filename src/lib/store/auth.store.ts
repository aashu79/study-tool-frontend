import { create } from "zustand";
import type { User } from "../api/auth.service";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
