import { create } from 'zustand';

/**
 * Feature flag store. Flags are loaded once at app init and kept in sync via
 * a realtime subscription so admin toggles take effect without a restart.
 *
 * Every gated feature uses `useFeatureFlag(key)` — never read from this store
 * directly outside the hook, and never feature-gate critical safety paths
 * (999 dial, emergency accept). Only UI surfaces that introduce a dependency
 * on an un-signed partner integration should be gated.
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  category: string;
  requiresConfiguration: string[];
}

interface FeatureFlagState {
  flags: Record<string, FeatureFlag>;
  loaded: boolean;
  setFlags: (flags: FeatureFlag[]) => void;
  setFlag: (key: string, enabled: boolean) => void;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set) => ({
  flags: {},
  loaded: false,
  setFlags: (flags) => {
    const map: Record<string, FeatureFlag> = {};
    for (const f of flags) map[f.key] = f;
    set({ flags: map, loaded: true });
  },
  setFlag: (key, enabled) =>
    set((s) => {
      const existing = s.flags[key];
      if (!existing) return s;
      return { flags: { ...s.flags, [key]: { ...existing, enabled } } };
    }),
}));
