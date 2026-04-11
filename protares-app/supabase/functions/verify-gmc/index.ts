// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * GMC credential verification stub.
 *
 * In production this function:
 *   1. Receives `numberHash` + `holderName`
 *   2. Calls the GMC List Of Registered Medical Practitioners (LRMP) API
 *   3. Compares the returned name and registration status
 *   4. Returns { verified, expiresAt }
 *
 * Since the GMC API requires an approved integration account, this
 * scaffold returns a mock response. Swap the implementation once the
 * LRMP API key is available.
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

  const MOCK_VERIFY_IN_STAGING = Deno.env.get('GMC_MOCK_VERIFY') === 'true';
  if (MOCK_VERIFY_IN_STAGING) {
    return Response.json({ verified: true, expiresAt: null });
  }

  // TODO: live GMC integration
  // const gmcResponse = await fetch(`https://api.gmc-uk.org/v1/lrmp/lookup`, {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${Deno.env.get('GMC_API_KEY')}` },
  //   body: JSON.stringify({ numberHash: body.numberHash, name: body.holderName }),
  // });

  return Response.json({ verified: false, expiresAt: null });
});
