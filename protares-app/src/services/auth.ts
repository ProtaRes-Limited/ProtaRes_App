/**
 * Authentication service — Section 4 of master instructions.
 *
 * Two flows, one session:
 *   • Email + password via supabase.auth.signInWithPassword
 *   • Google ID token via native @react-native-google-signin, passed to
 *     supabase.auth.signInWithIdToken
 *
 * Both produce the same Supabase auth.users row. The post-auth hook
 * (§4.9) then ensures a `responders` profile exists.
 *
 * NEVER use signInWithOAuth on native — that's the browser flow and is
 * what caused the historical iOS crashes.
 */

import { Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

import { supabase } from './supabase';
import type { ResponderTier } from '@/types';

// ---------------------------------------------------------------------------
// Email / password
// ---------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export interface SignUpMetadata {
  firstName: string;
  lastName: string;
  phone?: string;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: SignUpMetadata
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        phone: metadata.phone,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Google Sign-In
// ---------------------------------------------------------------------------

/**
 * Returned shape has changed across @react-native-google-signin versions;
 * we narrow it defensively before using the id token.
 */
function extractIdToken(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null;
  const r = result as Record<string, unknown>;
  // v14+ wraps the payload in `data`.
  if (r.type === 'success' && r.data && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>;
    if (typeof d.idToken === 'string') return d.idToken;
  }
  // Legacy shape — idToken directly on the root.
  if (typeof r.idToken === 'string') return r.idToken;
  return null;
}

export async function signInWithGoogle() {
  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const signInResult = await GoogleSignin.signIn();
    const idToken = extractIdToken(signInResult);

    if (!idToken) {
      throw new Error(
        'Google Sign-In succeeded but no id token was returned. ' +
          'Verify webClientId is the WEB OAuth client (not Android).'
      );
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;

    return data;
  } catch (error: unknown) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
      if (error.code === statusCodes.IN_PROGRESS) return null;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available. Please update Google Play Services.');
      }
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Sign out — both providers
// ---------------------------------------------------------------------------

export async function signOut() {
  try {
    const isGoogleSignedIn = await GoogleSignin.getCurrentUser();
    if (isGoogleSignedIn) {
      await GoogleSignin.signOut();
    }
  } catch {
    // Google sign-out failure is non-fatal — still sign out of Supabase.
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Post-auth: ensure responder profile exists (§4.9)
// ---------------------------------------------------------------------------

export async function ensureResponderProfile(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;

  const { data: existing, error: fetchError } = await supabase
    .from('responders')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }
  if (existing) return;

  const fullName = typeof user.user_metadata?.full_name === 'string'
    ? user.user_metadata.full_name
    : '';
  const [firstNameFromGoogle, ...rest] = fullName.split(' ');
  const firstName =
    (user.user_metadata?.first_name as string | undefined) ??
    firstNameFromGoogle ??
    '';
  const lastName =
    (user.user_metadata?.last_name as string | undefined) ??
    rest.join(' ') ??
    '';

  const defaultTier: ResponderTier = 'tier4_witness';

  const { error: insertError } = await supabase.from('responders').insert({
    id: user.id,
    email: user.email ?? '',
    first_name: firstName,
    last_name: lastName,
    tier: defaultTier,
    availability: 'unavailable',
    location_consent: false,
    sms_fallback_enabled: true,
    push_enabled: true,
    alert_radius_km: 5,
  });

  if (insertError) throw insertError;
}

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(
  callback: (event: string, session: Awaited<ReturnType<typeof getCurrentSession>>) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
