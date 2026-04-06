import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Responder } from '@/types';

interface AuthState {
  user: Responder | null;
  session: { accessToken: string; refreshToken: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: Responder | null) => void;
  setSession: (session: { accessToken: string; refreshToken: string } | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<Responder>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setSession: (session) => set({ session }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'protares-auth',
      partialize: (state) => ({ session: state.session }),
    }
  )
);
