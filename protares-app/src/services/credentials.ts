import * as Crypto from 'expo-crypto';

import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';
import type { CredentialBody, GreenBadge } from '@/types';

/**
 * Credential verification service.
 *
 * The real GMC / NMC / HCPC lookups happen in Supabase Edge Functions —
 * the API keys are server-only. From the client side, we:
 *
 *   1. Hash the credential number locally (so plaintext never leaves the device)
 *   2. Invoke the edge function with the hash + holder name
 *   3. Store the verified credential row on success
 *
 * Column names map to the live schema: `credential_type`,
 * `credential_number_hash`, `verification_status` (enum).
 */

function currentUserId(): string {
  const session = useAuthStore.getState().session;
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

export async function hashCredential(rawNumber: string): Promise<string> {
  // SHA-256 of the trimmed, uppercased number. The Edge Function re-hashes
  // with a server-side pepper before comparing against GMC/NMC.
  const normalised = rawNumber.trim().toUpperCase();
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, normalised);
}

export async function verifyCredential(params: {
  body: CredentialBody;
  rawNumber: string;
  holderName: string;
}): Promise<{ verified: boolean; expiresAt: string | null }> {
  const credentialNumberHash = await hashCredential(params.rawNumber);

  const functionName = params.body === 'gmc' ? 'verify-gmc' : 'verify-nmc';
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: {
      numberHash: credentialNumberHash,
      holderName: params.holderName.trim(),
    },
  });
  if (error) throw error;

  const result = data as { verified: boolean; expiresAt: string | null } | null;
  const verified = result?.verified === true;
  const expiresAt = result?.expiresAt ?? null;

  await supabase.from('credentials').insert({
    responder_id: currentUserId(),
    credential_type: params.body,
    credential_number_hash: credentialNumberHash,
    verification_status: verified ? 'verified' : 'pending',
    verified_at: verified ? new Date().toISOString() : null,
    expires_at: expiresAt,
  });

  if (verified) {
    // Promote to Tier 2 (retired healthcare) on successful professional
    // verification — the Edge Function can upgrade further to Tier 1
    // if the clinician is flagged as currently practising.
    await supabase
      .from('responders')
      .update({ tier: 'tier2_retired_healthcare' })
      .eq('id', currentUserId());
  }

  return { verified, expiresAt };
}

export async function listCredentials() {
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('responder_id', currentUserId())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Green Badge — signed, time-limited credential QR.
 *
 * Regenerated every 60 s via the Edge Function so screenshots cannot
 * be reused. The client never produces the signature itself.
 */
export async function fetchGreenBadge(): Promise<GreenBadge> {
  const { data, error } = await supabase.functions.invoke('generate-green-badge', {
    body: {},
  });
  if (error) throw error;
  const badge = data as GreenBadge | null;
  if (!badge) throw new Error('Green Badge response was empty');
  return badge;
}
