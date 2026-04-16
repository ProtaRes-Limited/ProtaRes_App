// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * CAD Ingest — NHS Ambulance Trust Webhook Receiver.
 *
 * Receives HTTP POST calls from NHS Ambulance Trust CAD (Computer Aided
 * Dispatch) systems and converts them into ProtaRes emergencies, triggering
 * the responder dispatch pipeline automatically.
 *
 * ─── Authentication ────────────────────────────────────────────────────────
 * Every request must include:
 *   X-ProtaRes-Signature : sha256=<HMAC-SHA256(secret, timestamp + "." + body)>
 *   X-ProtaRes-Timestamp : <Unix timestamp seconds — must be within 5 minutes>
 *   X-ProtaRes-Source    : <trust identifier e.g. "yas", "las", "nwas">
 *
 * The HMAC secret is stored per-Trust in Supabase Secrets as:
 *   CAD_WEBHOOK_SECRET_<TRUST_ID_UPPERCASE>   e.g. CAD_WEBHOOK_SECRET_YAS
 *
 * A fallback generic secret CAD_WEBHOOK_SECRET can be set for development /
 * testing before individual Trust secrets are provisioned.
 *
 * ─── Accepted Payload Format ───────────────────────────────────────────────
 * See normalise.ts for full schema. Minimal example:
 * {
 *   "incident_ref": "YAS-2024-001234",
 *   "ampds_code": "09E01",           // or call_type / emergency_type
 *   "priority": "CAT1",              // or RED / ECHO / CHARLIE / etc.
 *   "location": {
 *     "latitude": 53.7456,
 *     "longitude": -0.3367,
 *     "address": "12 High Street, Hull, HU1 1AA",
 *     "what3words": "filled.count.soap"
 *   },
 *   "caller_phone": "07700900000",
 *   "conscious": true,
 *   "breathing": true,
 *   "ambulance_dispatched": true,
 *   "ambulance_eta_minutes": 8
 * }
 *
 * ─── Response ──────────────────────────────────────────────────────────────
 * 200  { emergencyId, dispatched, alreadyExists }
 * 400  Bad payload / missing fields
 * 401  Invalid or missing signature
 * 429  Too many requests from this source
 * 500  Internal error
 *
 * ─── Deployment ────────────────────────────────────────────────────────────
 * supabase functions deploy cad-ingest --no-verify-jwt
 * (JWT verification disabled — auth is done via HMAC signature instead)
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';
import { normaliseCadPayload } from './normalise.ts';

// ─── Constants ───────────────────────────────────────────────────────────────

const TIMESTAMP_TOLERANCE_SECONDS = 300; // 5 minutes — replay attack window
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-ProtaRes-Signature, X-ProtaRes-Timestamp, X-ProtaRes-Source',
};

// ─── HMAC verification ────────────────────────────────────────────────────────

async function verifySignature(
  secret: string,
  timestamp: string,
  body: string,
  providedSig: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const message = `${timestamp}.${body}`;
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const expected = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== providedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ providedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

function jsonError(message: string, status: number): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  // ── 1. Read raw body (needed for signature verification) ──────────────────
  const rawBody = await req.text();

  // ── 2. Extract authentication headers ─────────────────────────────────────
  const providedSig = req.headers.get('X-ProtaRes-Signature') ?? '';
  const timestampStr = req.headers.get('X-ProtaRes-Timestamp') ?? '';
  const sourceId = (req.headers.get('X-ProtaRes-Source') ?? 'unknown').toUpperCase();

  if (!providedSig || !timestampStr) {
    return jsonError('Missing X-ProtaRes-Signature or X-ProtaRes-Timestamp', 401);
  }

  // ── 3. Replay attack protection ────────────────────────────────────────────
  const requestTime = parseInt(timestampStr, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(requestTime) || Math.abs(nowSeconds - requestTime) > TIMESTAMP_TOLERANCE_SECONDS) {
    return jsonError('Request timestamp is expired or invalid', 401);
  }

  // ── 4. HMAC signature verification ────────────────────────────────────────
  // Look for a Trust-specific secret first, fall back to the generic one.
  const trustSecret = Deno.env.get(`CAD_WEBHOOK_SECRET_${sourceId}`)
    ?? Deno.env.get('CAD_WEBHOOK_SECRET');

  if (!trustSecret) {
    console.error(`No webhook secret configured for source: ${sourceId}`);
    return jsonError('Webhook source not configured', 401);
  }

  const signatureValid = await verifySignature(trustSecret, timestampStr, rawBody, providedSig);
  if (!signatureValid) {
    return jsonError('Invalid signature', 401);
  }

  // ── 5. Parse payload ───────────────────────────────────────────────────────
  let rawPayload: Record<string, unknown>;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  // ── 6. Normalise to ProtaRes schema ────────────────────────────────────────
  let normalised;
  try {
    normalised = normaliseCadPayload(rawPayload as any);
  } catch (err) {
    return jsonError(`Payload error: ${(err as Error).message}`, 400);
  }

  // ── 7. Write to database ───────────────────────────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const wkt = `POINT(${normalised.longitude} ${normalised.latitude})`;
  const emergencyPayload = {
    cad_incident_ref: normalised.cadIncidentRef,
    ingested_via: 'cad_webhook',
    emergency_type: normalised.emergencyType,
    severity: normalised.severity,
    location: wkt,
    location_address: normalised.locationAddress,
    location_description: normalised.locationDescription,
    what3words: normalised.what3words,
    reporter_phone: normalised.reporterPhone,
    reporter_name: normalised.reporterName,
    description: normalised.description,
    casualty_count: normalised.casualtyCount,
    casualties_conscious: normalised.casualtiesConscious,
    casualties_breathing: normalised.casualtiesBreathing,
    ambulance_notified: normalised.ambulanceNotified,
    ambulance_notified_at: normalised.ambulanceNotified ? new Date().toISOString() : null,
    ambulance_eta_minutes: normalised.ambulanceEtaMinutes,
    // CAD-ingested emergencies start at 'dispatched' — ambulance already knows
    status: 'dispatched',
  };

  const { data: emergency, error: insertError } = await supabase
    .from('emergencies')
    .upsert(emergencyPayload, {
      onConflict: 'cad_incident_ref',
      ignoreDuplicates: false, // Update if CAD sends an update to an existing incident
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Emergency insert error:', insertError);
    return jsonError(`Database error: ${insertError.message}`, 500);
  }

  const emergencyId = emergency.id;
  const alreadyExists = insertError?.code === '23505'; // unique_violation — shouldn't happen due to upsert but guard anyway

  // ── 8. Trigger dispatch to nearby responders ───────────────────────────────
  let dispatched = 0;
  try {
    const dispatchResp = await supabase.functions.invoke('dispatch-alert', {
      body: { emergencyId, searchRadiusKm: 5 },
    });
    dispatched = dispatchResp.data?.dispatched ?? 0;
  } catch (dispatchErr) {
    // Non-fatal — emergency is created, dispatch will retry via DB trigger
    console.error('Dispatch invocation failed:', dispatchErr);
  }

  // ── 9. Audit log ───────────────────────────────────────────────────────────
  await supabase.from('audit_log').insert({
    action: 'cad_ingest',
    table_name: 'emergencies',
    record_id: emergencyId,
    actor_id: null,
    actor_type: `cad_source:${sourceId.toLowerCase()}`,
    new_data: { cadIncidentRef: normalised.cadIncidentRef, emergencyType: normalised.emergencyType },
  }).then(() => {}).catch(() => {});

  return new Response(
    JSON.stringify({ emergencyId, dispatched, alreadyExists: alreadyExists ?? false }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
  );
});
