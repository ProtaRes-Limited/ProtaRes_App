import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';
import type { AvailabilityStatus, Coordinates, Database, Responder } from '@/types';

/**
 * Responder profile service. Every mutation is routed through here —
 * screens never call `supabase.from('responders')` directly.
 */

type ResponderUpdate = Database['public']['Tables']['responders']['Update'];

function currentUserId(): string {
  const session = useAuthStore.getState().session;
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

export async function updateProfile(
  updates: Partial<
    Pick<
      Responder,
      | 'firstName'
      | 'lastName'
      | 'phone'
      | 'profilePhotoUrl'
      | 'alertRadiusKm'
      | 'smsFallbackEnabled'
      | 'pushEnabled'
    >
  >
) {
  const id = currentUserId();
  const payload: ResponderUpdate = {};
  if (updates.firstName !== undefined) payload.first_name = updates.firstName;
  if (updates.lastName !== undefined) payload.last_name = updates.lastName;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.profilePhotoUrl !== undefined) payload.profile_photo_url = updates.profilePhotoUrl;
  if (updates.alertRadiusKm !== undefined) payload.alert_radius_km = updates.alertRadiusKm;
  if (updates.smsFallbackEnabled !== undefined)
    payload.sms_fallback_enabled = updates.smsFallbackEnabled;
  if (updates.pushEnabled !== undefined) payload.push_enabled = updates.pushEnabled;

  const { error } = await supabase.from('responders').update(payload).eq('id', id);
  if (error) throw error;
}

export async function setAvailability(status: AvailabilityStatus) {
  const id = currentUserId();
  const { error } = await supabase
    .from('responders')
    .update({ availability: status, last_active_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateLocation(
  location: Coordinates,
  extras: {
    accuracyMeters?: number;
    speedMps?: number;
    headingDegrees?: number;
    transportMode?: Responder['currentTransportMode'];
  } = {}
) {
  const id = currentUserId();
  const wkt = `POINT(${location.longitude} ${location.latitude})`;
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('responders')
    .update({
      current_location: wkt,
      current_transport_mode: extras.transportMode ?? null,
      location_updated_at: now,
    })
    .eq('id', id);
  if (updateError) throw updateError;

  // The location_history table stores the point as a geometry column; the
  // live schema names the bearing column `heading` (not heading_degrees).
  const { error: historyError } = await supabase.from('location_history').insert({
    responder_id: id,
    location: wkt,
    accuracy_meters: extras.accuracyMeters ?? null,
    speed_mps: extras.speedMps ?? null,
    heading: extras.headingDegrees ?? null,
    transport_mode: extras.transportMode ?? null,
  });
  if (historyError) throw historyError;
}

export async function recordConsent(
  consentType: string,
  granted: boolean,
  consentVersion: string
) {
  const id = currentUserId();
  // consent_records stores `consent_version` (not policy_version) and
  // `created_at` (no separate granted_at column). See schema README.
  const { error } = await supabase.from('consent_records').insert({
    responder_id: id,
    consent_type: consentType,
    granted,
    consent_version: consentVersion,
  });
  if (error) throw error;
}
