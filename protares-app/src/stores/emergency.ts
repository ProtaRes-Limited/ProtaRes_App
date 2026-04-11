import { create } from 'zustand';

import type { Emergency } from '@/types';

interface EmergencyState {
  pendingAlerts: Emergency[];
  activeEmergency: Emergency | null;

  addPendingAlert: (alert: Emergency) => void;
  removePendingAlert: (id: string) => void;
  setActiveEmergency: (emergency: Emergency | null) => void;
  updateEmergency: (updates: Partial<Emergency> & { id: string }) => void;
  clear: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  pendingAlerts: [],
  activeEmergency: null,

  addPendingAlert: (alert) =>
    set((state) => {
      if (state.pendingAlerts.some((a) => a.id === alert.id)) return state;
      return { pendingAlerts: [alert, ...state.pendingAlerts].slice(0, 10) };
    }),

  removePendingAlert: (id) =>
    set((state) => ({
      pendingAlerts: state.pendingAlerts.filter((a) => a.id !== id),
    })),

  setActiveEmergency: (emergency) => set({ activeEmergency: emergency }),

  updateEmergency: (updates) =>
    set((state) => ({
      activeEmergency:
        state.activeEmergency?.id === updates.id
          ? { ...state.activeEmergency, ...updates }
          : state.activeEmergency,
      pendingAlerts: state.pendingAlerts.map((a) =>
        a.id === updates.id ? { ...a, ...updates } : a
      ),
    })),

  clear: () => set({ pendingAlerts: [], activeEmergency: null }),
}));
