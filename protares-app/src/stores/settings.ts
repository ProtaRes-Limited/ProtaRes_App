import { create } from 'zustand';

/**
 * App-wide UI/user-preference state. Persisted to SecureStore separately
 * because these are not security-sensitive.
 */
interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  hasSeenOnboarding: boolean;
  biometricsEnabled: boolean;

  setDarkMode: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  notificationsEnabled: true,
  hasSeenOnboarding: false,
  biometricsEnabled: false,
  setDarkMode: (darkMode) => set({ darkMode }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
  setBiometricsEnabled: (biometricsEnabled) => set({ biometricsEnabled }),
}));
