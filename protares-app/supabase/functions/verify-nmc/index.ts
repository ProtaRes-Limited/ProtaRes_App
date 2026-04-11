// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * NMC credential verification stub.
 * Mirrors the GMC function but targets the NMC register lookup API.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.numberHash || !body?.holderName) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
  }

  if (Deno.env.get('NMC_MOCK_VERIFY') === 'true') {
    return Response.json({ verified: true, expiresAt: null });
  }

  return Response.json({ verified: false, expiresAt: null });
});
