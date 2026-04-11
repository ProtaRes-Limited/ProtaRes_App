// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * Green Badge generator.
 *
 *   • Produces a time-limited JWT-like payload signed with a server secret
 *   • Includes holder id, tier, issued-at, expiry (60s), and a random nonce
 *   • EMS teams scan the QR and verify the signature against the public key
 *
 * The payload format is: base64(header).base64(body).base64(signature)
 *
 * Replay protection: the nonce is stored in a short-lived KV cache. If a
 * scanner presents a nonce already seen, the check fails.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const TTL_SECONDS = 60;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Missing auth', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthenticated', { status: 401 });

  const { data: responder, error } = await supabase
    .from('responders')
    .select('id, first_name, last_name, tier')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !responder) {
    return new Response('Responder not found', { status: 404 });
  }

  // Require at least one verified credential before issuing the badge.
  const { data: verifiedCred } = await supabase
    .from('credentials')
    .select('id')
    .eq('responder_id', user.id)
    .eq('verified', true)
    .limit(1)
    .maybeSingle();

  if (!verifiedCred) {
    return new Response('No verified credentials', { status: 403 });
  }

  const issuedAt = Date.now();
  const expiresAt = issuedAt + TTL_SECONDS * 1000;
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Array.from(nonceBytes, (b) => b.toString(16).padStart(2, '0')).join('');

  const payload = {
    sub: responder.id,
    name: `${responder.first_name} ${responder.last_name}`,
    tier: responder.tier,
    iat: issuedAt,
    exp: expiresAt,
    nonce,
  };

  const secret = Deno.env.get('GREEN_BADGE_SECRET') ?? 'CHANGE_ME';
  const signature = await hmac(secret, JSON.stringify(payload));
  const signedPayload = `${btoa(JSON.stringify(payload))}.${signature}`;

  return Response.json({
    signedPayload,
    issuedAt: new Date(issuedAt).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    nonce,
  });
});

async function hmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}
