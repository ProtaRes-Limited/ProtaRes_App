import { useFeatureFlagStore } from '@/stores/featureFlags';
import type { FeatureFlagKey } from '@/services/featureFlags';

/**
 * Read-only check for whether a feature is enabled. Components gated by
 * this hook re-render when an admin toggles the flag (via realtime).
 *
 * NEVER use this to gate a safety-critical path (999 dialer, emergency
 * accept/decline, responder location updates). Those MUST always work.
 * Only gate surfaces that depend on a partner or service not yet wired up.
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  return useFeatureFlagStore((s) => s.flags[key]?.enabled ?? false);
}
