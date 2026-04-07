import { supabase } from './supabase';
import type { Responder, AvailabilityStatus } from '@/types';

export const authService = {
  async signUp(
    email: string,
    password: string,
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Create responder profile
    const { error: profileError } = await supabase
      .from('responders')
      .insert({
        id: authData.user.id,
        email,
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
      });

    if (profileError) throw profileError;

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(): Promise<Responder | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return transformResponder(data);
  },

  async updateProfile(updates: Partial<Responder>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('responders')
      .update(transformResponderForDb(updates))
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return transformResponder(data);
  },

  async setAvailability(status: AvailabilityStatus) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('responders')
      .update({ availability: status })
      .eq('id', user.id);

    if (error) throw error;
  },

  onAuthStateChange(
    callback: (event: string, session: unknown) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Transform database row to app model
function transformResponder(row: Record<string, unknown>): Responder {
  const r = row as Record<string, any>;
  return {
    id: r.id,
    email: r.email,
    phone: r.phone,
    firstName: r.first_name,
    lastName: r.last_name,
    fullName: `${r.first_name} ${r.last_name}`,
    profilePhotoUrl: r.profile_photo_url,
    tier: r.tier,
    availability: r.availability,
    currentLocation: r.current_location
      ? {
          latitude: r.current_location.coordinates[1],
          longitude: r.current_location.coordinates[0],
        }
      : null,
    currentTransportMode: r.current_transport_mode,
    locationUpdatedAt: r.location_updated_at,
    alertRadiusKm: r.alert_radius_km,
    smsFallbackEnabled: r.sms_fallback_enabled,
    pushEnabled: r.push_enabled,
    totalResponses: r.total_responses,
    totalAccepted: r.total_accepted,
    totalDeclined: r.total_declined,
    averageResponseTimeSeconds: r.average_response_time_seconds,
    locationConsent: r.location_consent,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    lastActiveAt: r.last_active_at,
  };
}

// Transform app model to database row for updates
function transformResponderForDb(
  updates: Partial<Responder>
): Record<string, unknown> {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.profilePhotoUrl !== undefined)
    dbUpdates.profile_photo_url = updates.profilePhotoUrl;
  if (updates.availability !== undefined)
    dbUpdates.availability = updates.availability;
  if (updates.alertRadiusKm !== undefined)
    dbUpdates.alert_radius_km = updates.alertRadiusKm;
  if (updates.smsFallbackEnabled !== undefined)
    dbUpdates.sms_fallback_enabled = updates.smsFallbackEnabled;
  if (updates.pushEnabled !== undefined)
    dbUpdates.push_enabled = updates.pushEnabled;
  if (updates.locationConsent !== undefined)
    dbUpdates.location_consent = updates.locationConsent;

  return dbUpdates;
}
