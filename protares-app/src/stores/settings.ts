import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  alertRadius: number;
  smsFallbackEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: 'system' | 'light' | 'dark';
  locationConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  setAlertRadius: (radius: number) => void;
  setSmsFallback: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  setDarkMode: (mode: 'system' | 'light' | 'dark') => void;
  setLocationConsent: (consent: boolean) => void;
  setAnalyticsConsent: (consent: boolean) => void;
  setMarketingConsent: (consent: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      alertRadius: 5,
      smsFallbackEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      darkMode: 'system',
      locationConsent: false,
      analyticsConsent: true,
      marketingConsent: false,

      setAlertRadius: (alertRadius) => set({ alertRadius }),
      setSmsFallback: (smsFallbackEnabled) => set({ smsFallbackEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrationEnabled: (vibrationEnabled) => set({ vibrationEnabled }),
      setDarkMode: (darkMode) => set({ darkMode }),
      setLocationConsent: (locationConsent) => set({ locationConsent }),
      setAnalyticsConsent: (analyticsConsent) => set({ analyticsConsent }),
      setMarketingConsent: (marketingConsent) => set({ marketingConsent }),
    }),
    {
      name: 'protares-settings',
    }
  )
);
