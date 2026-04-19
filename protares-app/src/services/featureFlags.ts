import { supabase } from './supabase';
import { useFeatureFlagStore, type FeatureFlag } from '@/stores/featureFlags';
import { captureException } from '@/lib/sentry';

/**
 * Canonical feature flag keys. Keep in sync with the feature_flags table.
 * Having these as a union type means `useFeatureFlag('typo')` fails at
 * compile time rather than silently returning undefined at runtime.
 */
export type FeatureFlagKey =
  | 'emergency_contacts'
  | 'twilio_voip_calling'
  | 'dispatcher_voice_channel'
  | 'police_cad_ingest'
  | 'fire_cad_ingest';

interface FlagRow {
  key: string;
  enabled: boolean;
  description: string;
  category: string;
  requires_configuration: unknown;
}

function rowToFlag(row: FlagRow): FeatureFlag {
  return {
    key: row.key,
    enabled: row.enabled,
    description: row.description,
    category: row.category,
    requiresConfiguration: Array.isArray(row.requires_configuration)
      ? (row.requires_configuration as string[])
      : [],
  };
}

/**
 * Load all flags from Supabase. Call once at app init. Safe to call again
 * (it replaces the whole map — realtime handles per-flag deltas).
 */
export async function loadFeatureFlags(): Promise<void> {
  try {
    const { data, error } = await supabase.from('feature_flags').select('*');
    if (error) throw error;
    const flags = (data as FlagRow[] | null)?.map(rowToFlag) ?? [];
    useFeatureFlagStore.getState().setFlags(flags);
  } catch (err) {
    captureException(err, { context: 'loadFeatureFlags' });
    // Even on failure, mark loaded=true so gated UI falls back to default (off)
    // rather than hanging in an indeterminate state.
    useFeatureFlagStore.getState().setFlags([]);
  }
}

/**
 * Subscribe to realtime changes on the feature_flags table so admin toggles
 * propagate to all running clients within a second. Returns an unsubscribe fn.
 */
export function subscribeFeatureFlags(): () => void {
  const channel = supabase
    .channel('feature_flags_updates')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'feature_flags' },
      (payload) => {
        const row = payload.new as FlagRow | null;
        if (!row?.key) return;
        useFeatureFlagStore.getState().setFlag(row.key, row.enabled);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Admin-only write. RLS enforces this on the server; we don't re-check here.
 */
export async function setFeatureFlag(
  key: FeatureFlagKey,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from('feature_flags')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) throw error;
  // Optimistic local update — realtime confirms it a moment later.
  useFeatureFlagStore.getState().setFlag(key, enabled);
}
