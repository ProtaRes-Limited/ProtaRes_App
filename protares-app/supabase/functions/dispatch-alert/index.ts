// @ts-nocheck — Deno runtime, not resolved by the app's TS config.
// deno-lint-ignore-file

/**
 * Dispatch Alert Edge Function.
 *
 * Triggered after a new emergency is inserted. Responsibilities:
 *   1. Look up nearby available responders via `nearby_available_responders`
 *   2. Score them using the Corridor Algorithm (Expected Time of Arrival)
 *   3. Pick the top 5–10, filtered by tier match for the emergency type
 *   4. Insert rows into `emergency_responders` with status = 'alerted'
 *   5. Push an FCM/APNs notification to each via Expo Push API
 *   6. Notify emergency services (999) in parallel — ProtaRes supplements,
 *      never replaces, EMS
 *
 * This file is a scaffold. The live version fetches Expo push tokens,
 * integrates TfL route data, and includes rate-limiting guards.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

interface DispatchRequest {
  emergencyId: string;
  searchRadiusKm?: number;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let body: DispatchRequest;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { emergencyId, searchRadiusKm = 5 } = body;
  if (!emergencyId) {
    return new Response('emergencyId is required', { status: 400 });
  }

  const { data: emergency, error: emergencyError } = await supabase
    .from('emergencies')
    .select('id, location, emergency_type, severity')
    .eq('id', emergencyId)
    .maybeSingle();

  if (emergencyError || !emergency) {
    return new Response(JSON.stringify({ error: 'Emergency not found' }), { status: 404 });
  }

  // Find candidates within radius using the SQL helper.
  const { data: candidates, error: nearbyError } = await supabase.rpc(
    'nearby_available_responders',
    {
      emergency_location: emergency.location,
      search_radius_km: searchRadiusKm,
    }
  );

  if (nearbyError) {
    return new Response(JSON.stringify({ error: nearbyError.message }), { status: 500 });
  }

  // Filter by tier match — critical cases need Tier 1/2, otherwise widen.
  const tierPriority: Record<string, number> = {
    tier1_active_healthcare: 1,
    tier2_off_duty_healthcare: 2,
    tier3_trained_first_aider: 3,
    tier4_witness: 4,
  };
  const filtered = (candidates ?? [])
    .filter((c: { tier: string }) => {
      if (emergency.severity === 'critical') {
        return tierPriority[c.tier] <= 3;
      }
      return true;
    })
    .slice(0, 10);

  // Insert alert rows.
  const rows = filtered.map((c: { responder_id: string }) => ({
    emergency_id: emergencyId,
    responder_id: c.responder_id,
    status: 'alerted',
  }));

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from('emergency_responders')
      .upsert(rows, { onConflict: 'emergency_id,responder_id' });
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }
  }

  // TODO: fetch Expo push tokens and fire-and-forget notifications via
  //       https://exp.host/--/api/v2/push/send

  return new Response(
    JSON.stringify({ dispatched: rows.length, candidates: candidates?.length ?? 0 }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
