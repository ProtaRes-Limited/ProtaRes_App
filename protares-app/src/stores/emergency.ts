import { create } from 'zustand';
import type { Emergency, EmergencyResponse, ResponseStatus } from '@/types';

interface EmergencyState {
  activeEmergency: Emergency | null;
  activeResponse: EmergencyResponse | null;
  pendingAlerts: Emergency[];
  isResponding: boolean;
  responseStatus: ResponseStatus | null;
  setActiveEmergency: (emergency: Emergency | null) => void;
  setActiveResponse: (response: EmergencyResponse | null) => void;
  addPendingAlert: (emergency: Emergency) => void;
  removePendingAlert: (emergencyId: string) => void;
  clearPendingAlerts: () => void;
  setResponseStatus: (status: ResponseStatus | null) => void;
  clearActiveResponse: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  activeEmergency: null,
  activeResponse: null,
  pendingAlerts: [],
  isResponding: false,
  responseStatus: null,

  setActiveEmergency: (emergency) =>
    set({
      activeEmergency: emergency,
      isResponding: !!emergency,
    }),

  setActiveResponse: (response) =>
    set({
      activeResponse: response,
      responseStatus: response?.status || null,
    }),

  addPendingAlert: (emergency) =>
    set((state) => ({
      pendingAlerts: [...state.pendingAlerts, emergency],
    })),

  removePendingAlert: (emergencyId) =>
    set((state) => ({
      pendingAlerts: state.pendingAlerts.filter((e) => e.id !== emergencyId),
    })),

  clearPendingAlerts: () => set({ pendingAlerts: [] }),

  setResponseStatus: (status) => set({ responseStatus: status }),

  clearActiveResponse: () =>
    set({
      activeEmergency: null,
      activeResponse: null,
      isResponding: false,
      responseStatus: null,
    }),
}));
