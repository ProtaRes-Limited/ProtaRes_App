import { supabase } from './supabase';
import type { Responder, AvailabilityStatus } from '@/types';

function transformResponder(row: Record<string, unknown>): Responder {
  return {
    id: row.id as string,
    email: row.email as string,
    phone: (row.phone as string) || null,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    fullName: `${row.first_name} ${row.last_name}`,
    profilePhotoUrl: (row.profile_photo_url as string) || null,
    tier: row.tier as Responder['tier'],
    availability: row.availability as Responder['availability'],
    currentLocation: row.current_location
      ? {
          latitude: (row.current_location as { coordinates: number[] }).coordinates[1],
          longitude: (row.current_location as { coordinates: number[] }).coordinates[0],
        }
      : null,
    currentTransportMode: (row.current_transport_mode as Responder['currentTransportMode']) || 'unknown',
    locationUpdatedAt: (row.location_updated_at as string) || null,
    alertRadiusKm: (row.alert_radius_km as number) || 5,
    smsFallbackEnabled: (row.sms_fallback_enabled as boolean) ?? true,
    pushEnabled: (row.push_enabled as boolean) ?? true,
    totalResponses: (row.total_responses as number) || 0,
    totalAccepted: (row.total_accepted as number) || 0,
    totalDeclined: (row.total_declined as number) || 0,
    averageResponseTimeSeconds: (row.average_response_time_seconds as number) || null,
    locationConsent: (row.location_consent as boolean) ?? false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    lastActiveAt: (row.last_active_at as string) || null,
  };
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    profile: { firstName: string; lastName: string; phone?: string }
  ) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const { error: profileError } = await supabase.from('responders').insert({
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

    const dbUpdates: Record<string, unknown> = {};
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.alertRadiusKm !== undefined) dbUpdates.alert_radius_km = updates.alertRadiusKm;
    if (updates.smsFallbackEnabled !== undefined) dbUpdates.sms_fallback_enabled = updates.smsFallbackEnabled;
    if (updates.pushEnabled !== undefined) dbUpdates.push_enabled = updates.pushEnabled;
    if (updates.locationConsent !== undefined) dbUpdates.location_consent = updates.locationConsent;

    const { data, error } = await supabase
      .from('responders')
      .update(dbUpdates)
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

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
