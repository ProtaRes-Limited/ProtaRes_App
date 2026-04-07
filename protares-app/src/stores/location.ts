import { create } from 'zustand';
import type { Coordinates, TransportMode } from '@/types';

interface LocationState {
  // State
  currentLocation: Coordinates | null;
  locationPermission: 'granted' | 'denied' | 'undetermined';
  isTracking: boolean;
  transportMode: TransportMode;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  lastUpdated: Date | null;

  // Actions
  setLocation: (location: Coordinates) => void;
  setLocationPermission: (permission: 'granted' | 'denied' | 'undetermined') => void;
  setTracking: (tracking: boolean) => void;
  setTransportMode: (mode: TransportMode) => void;
  updateLocationDetails: (details: {
    accuracy?: number;
    heading?: number;
    speed?: number;
  }) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  locationPermission: 'undetermined',
  isTracking: false,
  transportMode: 'unknown',
  accuracy: null,
  heading: null,
  speed: null,
  lastUpdated: null,

  setLocation: (location) =>
    set({
      currentLocation: location,
      lastUpdated: new Date(),
    }),

  setLocationPermission: (permission) => set({ locationPermission: permission }),

  setTracking: (isTracking) => set({ isTracking }),

  setTransportMode: (transportMode) => set({ transportMode }),

  updateLocationDetails: (details) =>
    set((state) => ({
      ...state,
      ...details,
    })),

  clearLocation: () =>
    set({
      currentLocation: null,
      accuracy: null,
      heading: null,
      speed: null,
      lastUpdated: null,
    }),
}));
