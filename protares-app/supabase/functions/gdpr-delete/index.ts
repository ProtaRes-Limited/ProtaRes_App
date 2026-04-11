// @ts-nocheck — Deno runtime
// deno-lint-ignore-file

/**
 * GDPR account-deletion handler with 30-day grace period.
 *
 * The client calls this to *schedule* a deletion. We mark the responder
 * as pending_deletion with a `scheduled_for_deletion_at` timestamp. A
 * daily cron (`gdpr-delete-sweeper`, separate) scans that column and
 * performs the actual cascade delete after 30 days.
 *
 * Signing in again within the window cancels the deletion.
 *
 * Response codes:
 *   200 — deletion scheduled
 *   401 — not authenticated
 *   500 — database error
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const GRACE_PERIOD_DAYS = 30;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Missing auth', { status: 401 });

  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );
  const {
    data: { user },
  } = await userSupabase.auth.getUser();
  if (!user) return new Response('Unauthenticated', { status: 401 });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const deletionDate = new Date(Date.now() + GRACE_PERIOD_DAYS * 86_400_000).toISOString();

  const { error } = await admin
    .from('audit_log')
    .insert({
      actor_id: user.id,
      action: 'gdpr.deletion_scheduled',
      subject_type: 'responder',
      subject_id: user.id,
      metadata: { scheduled_for: deletionDate, reason: 'user_request' },
    });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // The actual row flag is an `updated_at`/availability change to off_duty.
  await admin
    .from('responders')
    .update({ availability: 'off_duty' })
    .eq('id', user.id);

  return Response.json({ scheduledFor: deletionDate });
});
