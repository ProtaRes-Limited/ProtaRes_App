import { useEffect } from 'react';

import { supabase } from '@/services/supabase';
import { ensureResponderProfile } from '@/services/auth';
import { useAuthStore } from '@/stores/auth';
import type { Responder } from '@/types';
import { captureException } from '@/lib/sentry';

/**
 * Top-level hook that wires the Supabase auth listener into Zustand.
 *
 *   1. Hydrates state from persisted session on mount
 *   2. Subscribes to auth changes (sign-in, sign-out, token refresh)
 *   3. On sign-in, guarantees a responder profile exists and loads it
 *
 * Mounted once in the root layout. Do not call from nested screens.
 */
export function useAuth() {
  const {
    setSession,
    markInitialised,
    reset,
    session,
    user,
    initialised,
    loading,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!active) return;
        setSession(data.session);
        if (data.session) {
          await loadResponderProfile();
        }
      } catch (err) {
        captureException(err, { context: 'useAuth.hydrate' });
      } finally {
        if (active) {
          markInitialised();
          setLoading(false);
        }
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (event === 'SIGNED_OUT' || !newSession) {
        reset();
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        try {
          await ensureResponderProfile();
          await loadResponderProfile();
        } catch (err) {
          captureException(err, { context: 'useAuth.onAuthStateChange', event });
        }
      }
    });

    hydrate();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { session, user, initialised, loading };
}

async function loadResponderProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('responders')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return;

  const row = data as Record<string, unknown>;
  const responder: Responder = {
    id: String(row.id),
    email: String(row.email),
    phone: (row.phone as string | null) ?? null,
    firstName: String(row.first_name ?? ''),
    lastName: String(row.last_name ?? ''),
    fullName: `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
    profilePhotoUrl: (row.profile_photo_url as string | null) ?? null,
    tier: (row.tier as Responder['tier']) ?? 'tier4_witness',
    availability: (row.availability as Responder['availability']) ?? 'unavailable',
    currentLocation: extractCoords(row.current_location),
    currentTransportMode:
      (row.current_transport_mode as Responder['currentTransportMode']) ?? null,
    locationUpdatedAt: (row.location_updated_at as string | null) ?? null,
    alertRadiusKm: (row.alert_radius_km as number) ?? 5,
    smsFallbackEnabled: Boolean(row.sms_fallback_enabled),
    pushEnabled: Boolean(row.push_enabled),
    totalResponses: (row.total_responses as number) ?? 0,
    totalAccepted: (row.total_accepted as number) ?? 0,
    totalDeclined: (row.total_declined as number) ?? 0,
    averageResponseTimeSeconds: (row.average_response_time_seconds as number | null) ?? null,
    locationConsent: Boolean(row.location_consent),
    locationConsentAt: (row.location_consent_at as string | null) ?? null,
    dataProcessingConsent: Boolean(row.data_processing_consent),
    dataProcessingConsentAt: (row.data_processing_consent_at as string | null) ?? null,
    marketingConsent: Boolean(row.marketing_consent),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
    lastActiveAt: (row.last_active_at as string | null) ?? null,
    deletedAt: (row.deleted_at as string | null) ?? null,
  };
  useAuthStore.getState().setUser(responder);
}

function extractCoords(value: unknown): { latitude: number; longitude: number } | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  // PostGIS returns `{ type: 'Point', coordinates: [lng, lat] }`
  if (v.type === 'Point' && Array.isArray(v.coordinates) && v.coordinates.length >= 2) {
    const [lng, lat] = v.coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { latitude: lat, longitude: lng };
    }
  }
  return null;
}
