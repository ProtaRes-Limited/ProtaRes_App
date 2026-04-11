import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

import type { Responder } from '@/types';

interface AuthState {
  session: Session | null;
  user: Responder | null;
  initialised: boolean;
  loading: boolean;

  setSession: (session: Session | null) => void;
  setUser: (user: Responder | null) => void;
  markInitialised: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialised: false,
  loading: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  markInitialised: () => set({ initialised: true }),
  setLoading: (loading) => set({ loading }),
  reset: () => set({ session: null, user: null }),
}));
