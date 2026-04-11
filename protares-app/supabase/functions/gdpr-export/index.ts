// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * GDPR data-export handler.
 *
 * Exports all data we hold for the authenticated user:
 *   • Profile
 *   • Credentials
 *   • Consent records
 *   • Response history (emergency_responders rows + redacted emergency info)
 *
 * Bundles the export as a JSON blob and uploads it to a short-lived
 * Supabase Storage signed URL. Returns the URL for the client to fetch.
 *
 * Per UK GDPR Article 12, exports should be provided within one month —
 * we aim for immediate fulfilment.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Missing auth', { status: 401 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user) return new Response('Unauthenticated', { status: 401 });

  const [{ data: profile }, { data: credentials }, { data: consents }, { data: history }] =
    await Promise.all([
      supabase.from('responders').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('credentials').select('*').eq('responder_id', user.id),
      supabase.from('consent_records').select('*').eq('responder_id', user.id),
      supabase
        .from('emergency_responders')
        .select('*, emergencies(emergency_type, severity, created_at)')
        .eq('responder_id', user.id),
    ]);

  const archive = {
    exportedAt: new Date().toISOString(),
    policyVersion: '1.0',
    profile,
    credentials: (credentials ?? []).map((c) => ({
      ...c,
      number_hash: '[redacted]',
    })),
    consents,
    history,
  };

  const fileName = `gdpr/${user.id}/${Date.now()}.json`;
  const bucket = supabase.storage.from('gdpr-exports');
  const { error: uploadError } = await bucket.upload(
    fileName,
    new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }),
    { upsert: true }
  );
  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
  }

  const { data: signed, error: signError } = await bucket.createSignedUrl(fileName, 60 * 60 * 24);
  if (signError) {
    return new Response(JSON.stringify({ error: signError.message }), { status: 500 });
  }

  return Response.json({ url: signed?.signedUrl ?? null });
});
