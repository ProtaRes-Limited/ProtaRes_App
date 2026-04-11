import { create } from 'zustand';

import type { Coordinates, TransportMode } from '@/types';

interface LocationState {
  current: Coordinates | null;
  transportMode: TransportMode | null;
  consent: boolean;
  tracking: boolean;

  setCurrent: (coords: Coordinates, transportMode?: TransportMode | null) => void;
  setConsent: (consent: boolean) => void;
  setTracking: (tracking: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  current: null,
  transportMode: null,
  consent: false,
  tracking: false,
  setCurrent: (current, transportMode = null) => set({ current, transportMode }),
  setConsent: (consent) => set({ consent }),
  setTracking: (tracking) => set({ tracking }),
}));
