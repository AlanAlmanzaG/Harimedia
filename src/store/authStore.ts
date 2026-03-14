// src/store/authStore.ts
import { create } from "zustand";
import type { User } from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // true hasta que Firebase resuelva onAuthStateChanged
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}));