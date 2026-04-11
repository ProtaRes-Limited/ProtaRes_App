// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * Hourly cleanup cron — deletes location_history rows older than the
 * configured retention window (24 hours per master instructions §14).
 *
 * Schedule via Supabase cron:
 *   select cron.schedule('protares-cleanup-locations', '0 * * * *',
 *     'select net.http_post(...)'
 *   );
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const RETENTION_HOURS = 24;

serve(async () => {
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const cutoff = new Date(Date.now() - RETENTION_HOURS * 3600_000).toISOString();

  const { count, error } = await admin
    .from('location_history')
    .delete({ count: 'exact' })
    .lt('recorded_at', cutoff);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return Response.json({ deleted: count ?? 0, cutoff });
});
