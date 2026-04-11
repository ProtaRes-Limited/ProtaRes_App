---
name: protares-supabase-backend
description: "Complete Supabase backend setup, audit, and maintenance skill for the ProtaRes emergency response platform. Use this skill ANY time work touches Supabase — including database schema, Row Level Security policies, Edge Functions, Realtime subscriptions, Storage buckets, Auth provider configuration, cron jobs, PostGIS geospatial setup, database functions/triggers, migration management, type generation, environment linking, or production hardening. Also trigger when the user mentions 'backend', 'database', 'RLS', 'edge function', 'realtime', 'supabase', 'schema', 'migration', 'storage bucket', 'cron', 'PostGIS', 'auth provider', or 'type generation' in the context of ProtaRes. This skill is the single source of truth for everything that must be configured INSIDE Supabase (dashboard + SQL + CLI) before the React Native frontend can function."
---

# ProtaRes Supabase Backend Skill

## Purpose

This skill ensures that **every** Supabase configuration required for ProtaRes is created, verified, and hardened — not just the tables. Tables are only ~20% of the backend work. This skill covers the other 80%.

## When to Use

Run this skill (or sections of it) when:
- Setting up a new Supabase project for ProtaRes
- Auditing an existing ProtaRes Supabase project for completeness
- Deploying schema changes or Edge Functions
- Debugging auth, RLS, Realtime, or geospatial issues
- Preparing for NHS DTAC / DSPT compliance audit
- Moving between environments (dev → staging → production)

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project created at https://supabase.com
- Project linked: `supabase link --project-ref <your-project-ref>`
- Docker running locally (for `supabase start` local dev)

---

## MASTER CHECKLIST

Run through every section below. Check off each item. If an item fails, fix it before moving on. The checklist is ordered by dependency — later items depend on earlier ones.

### PHASE 1: Project & Extensions
- [ ] 1.1 — Supabase project exists and CLI is linked
- [ ] 1.2 — Required PostgreSQL extensions enabled
- [ ] 1.3 — Database timezone set to UTC

### PHASE 2: Schema
- [ ] 2.1 — All ENUM types created
- [ ] 2.2 — All 11 tables created with correct columns and constraints
- [ ] 2.3 — All indexes created (including GIST for PostGIS)
- [ ] 2.4 — All triggers created (updated_at)
- [ ] 2.5 — All database functions created
- [ ] 2.6 — Seed data loaded (dev/staging only)

### PHASE 3: Row Level Security
- [ ] 3.1 — RLS enabled on ALL 11 tables
- [ ] 3.2 — All RLS policies created and tested
- [ ] 3.3 — No table is publicly readable without auth

### PHASE 4: Auth Configuration
- [ ] 4.1 — Email provider enabled with confirm email
- [ ] 4.2 — Google provider enabled with correct Client ID + Secret
- [ ] 4.3 — Site URL and redirect URLs configured
- [ ] 4.4 — JWT expiry and refresh settings correct
- [ ] 4.5 — Auth trigger for new user profile creation

### PHASE 5: Realtime
- [ ] 5.1 — Realtime enabled on required tables
- [ ] 5.2 — Realtime policies verified

### PHASE 6: Storage
- [ ] 6.1 — Storage buckets created
- [ ] 6.2 — Storage policies set

### PHASE 7: Edge Functions
- [ ] 7.1 — All Edge Functions created and deployed
- [ ] 7.2 — Edge Function secrets set
- [ ] 7.3 — Edge Functions tested

### PHASE 8: Cron Jobs
- [ ] 8.1 — pg_cron extension enabled
- [ ] 8.2 — Location cleanup job scheduled
- [ ] 8.3 — Credential expiry check job scheduled

### PHASE 9: Type Generation & Migrations
- [ ] 9.1 — TypeScript types generated from schema
- [ ] 9.2 — Migration files created and tracked

### PHASE 10: Production Hardening
- [ ] 10.1 — Connection pooling configured
- [ ] 10.2 — Rate limiting on Edge Functions
- [ ] 10.3 — Database backups verified
- [ ] 10.4 — Monitoring and alerts set

---

## PHASE 1: PROJECT & EXTENSIONS

### 1.1 Link the Project

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

Verify with:
```bash
supabase status
```

### 1.2 Enable Required Extensions

Run in the Supabase SQL Editor (or in a migration file):

```sql
-- Geospatial queries — CRITICAL for nearby responder lookup
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA "extensions";

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "extensions";

-- Encryption for credential numbers
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA "extensions";

-- Cron jobs for automated cleanup
CREATE EXTENSION IF NOT EXISTS "pg_cron" SCHEMA "extensions";

-- Full text search (future: searching emergency descriptions)
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA "extensions";
```

**Verify** all extensions are active:
```sql
SELECT extname, extversion FROM pg_extension ORDER BY extname;
```

Expected output must include: `postgis`, `uuid-ossp`, `pgcrypto`, `pg_cron`, `pg_trgm`.

If `postgis` is missing, the `GEOGRAPHY(POINT, 4326)` columns will fail to create and ALL geospatial queries (nearby responders, equipment lookup) will break.

If `pg_cron` is missing, location history will grow unbounded (GDPR violation — 24-hour retention policy cannot be enforced).

### 1.3 Set Timezone

```sql
ALTER DATABASE postgres SET timezone TO 'UTC';
```

All timestamps in ProtaRes are stored as `TIMESTAMPTZ`. The app converts to local time on the client. The database must always operate in UTC.

---

## PHASE 2: SCHEMA

### 2.1 ENUM Types

Run the full ENUM creation block from `DATABASE_SCHEMA.sql`. There are 10 ENUM types:

```
responder_tier, availability_status, emergency_type, emergency_severity,
emergency_status, response_status, transport_mode, verification_status,
equipment_type
```

**Verify:**
```sql
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
```

All 9 must be present (note: `equipment_type` is one). If you get errors on table creation about unknown types, the ENUMs were not created first.

### 2.2 Tables

Run the full table creation block from `DATABASE_SCHEMA.sql`. The 11 tables are:

| # | Table | PostGIS | Purpose |
|---|-------|---------|---------|
| 1 | `responders` | Yes (`current_location`) | User profiles |
| 2 | `credentials` | No | GMC/NMC/First Aid certs |
| 3 | `emergencies` | Yes (`location`) | Emergency incidents |
| 4 | `responses` | No | Responder-to-emergency assignments |
| 5 | `location_history` | Yes (`location`) | Rolling 24h location log |
| 6 | `equipment_locations` | Yes (`location`) | AEDs, trauma kits, etc. |
| 7 | `push_tokens` | No | Device push notification tokens |
| 8 | `notification_log` | No | Notification delivery tracking |
| 9 | `data_requests` | No | GDPR export/delete requests |
| 10 | `audit_log` | No | Clinical governance audit trail |
| 11 | `consent_records` | No | GDPR consent records (append-only) |

**Verify all tables exist:**
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Verify PostGIS columns:**
```sql
SELECT f_table_name, f_geometry_column, srid, type
FROM geometry_columns
WHERE f_table_schema = 'public';
```

Expected: 4 rows (responders.current_location, emergencies.location, location_history.location, equipment_locations.location), all SRID 4326, type POINT.

### 2.3 Indexes

The schema defines 20+ indexes. The most critical are the GIST indexes for PostGIS:

```sql
-- Verify GIST indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%GIST%';
```

Expected: `idx_responders_location`, `idx_emergencies_location`, `idx_equipment_location` (and `idx_location_history` if you indexed that with GIST too — consider adding one).

If these are missing, `ST_DWithin()` queries will do full table scans — unacceptable for emergency dispatch latency.

### 2.4 Triggers

Create the `update_updated_at()` function and apply triggers to all tables with `updated_at` columns:

```sql
-- Verify triggers exist
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

Expected: triggers on `responders`, `credentials`, `emergencies`, `responses`, `equipment_locations`.

### 2.5 Database Functions

Three critical functions must exist:

**1. `find_nearby_responders(emergency_location, radius_meters, min_tier)`**
- Used by dispatch to find available responders within range
- Uses `ST_DWithin()` for spatial query
- Filters by availability, consent, deleted status
- Orders by tier then distance

**2. `cleanup_expired_location_history()`**
- Deletes rows where `expires_at < NOW()`
- Called by pg_cron every hour
- Returns count of deleted rows

**3. `generate_green_badge(responder_uuid)`**
- Builds JSON badge payload with 60-second expiry and cryptographic nonce
- Called by the Green Badge Edge Function

**Verify functions:**
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';
```

### 2.6 Seed Data

For dev/staging only (NEVER in production):

```sql
-- Verify seed equipment exists
SELECT COUNT(*) FROM equipment_locations;
```

The schema includes 4 seed equipment locations in London. Add more for your testing area (Hull, etc.).

---

## PHASE 3: ROW LEVEL SECURITY

### 3.1 Enable RLS on ALL Tables

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Every table must show `rowsecurity = true`.** If any table has `rowsecurity = false`, it is publicly readable/writable by any authenticated user — a GDPR and security violation.

### 3.2 Create and Verify All Policies

Run the full RLS policy block from `DATABASE_SCHEMA.sql`.

**Verify policies exist:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Required policy summary:**

| Table | SELECT | INSERT | UPDATE | DELETE | Service Role |
|-------|--------|--------|--------|--------|-------------|
| `responders` | Own only | Via auth trigger | Own only | — | Full |
| `credentials` | Own only | Own only | Own only | — | Full |
| `emergencies` | Active (all auth) + own reported | All auth | — | — | Full |
| `responses` | Own only | Own only | Own only | — | Full |
| `location_history` | Own only | Own only | — | — | Full |
| `equipment_locations` | All auth | — | — | — | Full |
| `push_tokens` | Own only | Own only | Own only | — | Full |
| `notification_log` | Own only | — | — | — | Full |
| `data_requests` | Own only | Own only | — | — | Full |
| `audit_log` | — (admin only via service role) | — | — | — | Full |
| `consent_records` | Own only | Own only | — (append-only) | — (no delete) | Full |

### 3.3 Test RLS — Critical Verification

Run these tests from the Supabase SQL Editor as an authenticated user (not service role):

```sql
-- This should return ONLY your own profile
SELECT * FROM responders;

-- This should return ONLY active emergencies
SELECT * FROM emergencies;

-- This should return ZERO rows (audit_log is admin-only)
SELECT * FROM audit_log;

-- This should FAIL (consent_records is append-only)
UPDATE consent_records SET granted = false WHERE id = 'some-id';
DELETE FROM consent_records WHERE id = 'some-id';
```

**If any of these tests return unexpected results, the RLS policies are wrong. Fix them before proceeding.**

---

## PHASE 4: AUTH CONFIGURATION

All of this is done in the **Supabase Dashboard → Authentication** section.

### 4.1 Email Provider

Go to **Authentication → Providers → Email:**
- Enable email auth: ✅
- Confirm email: ✅ (users must verify email)
- Secure email change: ✅
- Double confirm email changes: ✅

Go to **Authentication → Email Templates:**
- Customize confirm signup email with ProtaRes branding
- Customize reset password email with ProtaRes branding
- Customize magic link email (if used)

### 4.2 Google Provider

Go to **Authentication → Providers → Google:**
- Enable: ✅
- Client ID: Paste the **Web** OAuth Client ID from Google Cloud Console
- Client Secret: Paste the **Web** OAuth Client Secret
- Authorized Client IDs (skip unless using native sign-in with multiple client IDs): Add Android Client ID and iOS Client ID comma-separated

**Verify the callback URL** shown in Supabase matches what you added to the Google Cloud Console Web Client's "Authorized redirect URIs":
```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

### 4.3 URL Configuration

Go to **Authentication → URL Configuration:**

| Field | Value |
|-------|-------|
| Site URL | `protares://` |
| Redirect URLs | `protares://`, `protares://google-auth`, `protares://auth-callback`, `exp://localhost:8081` (dev only) |

**The `protares://` scheme must match the scheme defined in `app.config.js`.**

### 4.4 Auth Settings

Go to **Authentication → Settings:**

| Setting | Value | Why |
|---------|-------|-----|
| JWT Expiry | 3600 (1 hour) | Short-lived tokens for security |
| Enable refresh token rotation | ✅ | Prevent token reuse |
| Refresh token reuse interval | 10 seconds | Grace period for concurrent requests |
| Min password length | 8 | NHS DSPT minimum |

### 4.5 Auth Trigger — Auto-Create Responder Profile

When a user signs up (via email or Google), a row in `responders` must be created automatically. This is done with a PostgreSQL trigger on `auth.users`:

```sql
-- Function to create responder profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.responders (id, email, first_name, last_name, tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name',
             SPLIT_PART(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), ' ', 1),
             ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name',
             NULLIF(ARRAY_TO_STRING(
               (STRING_TO_ARRAY(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), ' '))[2:],
               ' '
             ), ''),
             ''),
    'tier4_witness'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**CRITICAL:** This function must be `SECURITY DEFINER` because auth triggers run in the auth schema context and need permission to insert into the public `responders` table.

**Verify:**
```sql
SELECT trigger_name, event_object_table, event_object_schema
FROM information_schema.triggers
WHERE event_object_schema = 'auth';
```

Expected: `on_auth_user_created` on `auth.users`.

**Test:** Create a test user via the Supabase Dashboard (Authentication → Users → Add user). Then verify:
```sql
SELECT id, email, first_name, last_name, tier FROM responders ORDER BY created_at DESC LIMIT 1;
```

A matching row should exist with `tier4_witness`.

---

## PHASE 5: REALTIME

### 5.1 Enable Realtime on Tables

Go to **Supabase Dashboard → Database → Replication** (or use SQL):

```sql
-- Enable realtime on tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE emergencies;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
ALTER PUBLICATION supabase_realtime ADD TABLE responders;
```

**Only enable Realtime on tables that need it.** Do NOT enable on `location_history` (too high volume), `audit_log` (not needed on client), or `consent_records`.

**Verify:**
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

Expected: `emergencies`, `responses`, `responders`.

### 5.2 Realtime + RLS

Supabase Realtime respects RLS policies. This means:
- A responder will only receive real-time updates for emergencies they can SELECT (active ones)
- A responder will only see their own response status changes
- No responder can see another responder's location updates via Realtime

This is correct for ProtaRes — no additional Realtime-specific policies needed. The RLS policies from Phase 3 apply.

**Test:** Open two browser tabs to the Supabase SQL Editor. In tab 1, subscribe to `emergencies` changes. In tab 2, insert a test emergency. Tab 1 should receive the change.

---

## PHASE 6: STORAGE

### 6.1 Create Storage Buckets

Go to **Supabase Dashboard → Storage** or use SQL:

```sql
-- Profile photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  false,
  5242880,  -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Credential documents (first aid certificates, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'credential-documents',
  'credential-documents',
  false,
  10485760,  -- 10MB max
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Witness mode media (video snapshots, not full streams)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'witness-media',
  'witness-media',
  false,
  52428800,  -- 50MB max
  ARRAY['image/jpeg', 'video/mp4']
);

-- GDPR data exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gdpr-exports',
  'gdpr-exports',
  false,
  104857600,  -- 100MB max
  ARRAY['application/json', 'application/pdf', 'application/zip']
);
```

### 6.2 Storage Policies

```sql
-- Profile photos: users can upload/read/delete their own
CREATE POLICY "profile_photos_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Credential documents: users can upload/read their own
CREATE POLICY "credential_docs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'credential-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "credential_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'credential-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Witness media: authenticated users can upload, service role reads
CREATE POLICY "witness_media_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'witness-media'
    AND auth.role() = 'authenticated'
  );

-- GDPR exports: users can read their own
CREATE POLICY "gdpr_exports_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'gdpr-exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**File naming convention:** All user-owned files are stored under `{user_id}/filename.ext`. This makes RLS policies clean — the first folder segment is always the user's UUID.

**Verify buckets:**
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets;
```

Expected: 4 buckets, all `public = false`.

---

## PHASE 7: EDGE FUNCTIONS

### 7.1 Create Edge Functions

Each Edge Function lives in `supabase/functions/<function-name>/index.ts`.

**Required Edge Functions:**

| Function | Trigger | Purpose |
|----------|---------|---------|
| `verify-gmc` | HTTP POST | Verify doctor credentials against GMC API |
| `verify-nmc` | HTTP POST | Verify nurse credentials against NMC API |
| `dispatch-alert` | HTTP POST (called by DB webhook or app) | Find nearby responders, send push notifications |
| `generate-green-badge` | HTTP GET | Generate signed, time-limited QR badge data |
| `send-sms-alert` | HTTP POST | Twilio SMS fallback for low-connectivity responders |
| `gdpr-export` | HTTP POST | Package user data as JSON/PDF, upload to storage |
| `gdpr-delete` | HTTP POST | Start 30-day deletion process |
| `cleanup-locations` | Scheduled (pg_cron calls via pg_net) | Delete expired location_history rows |
| `credential-expiry-check` | Scheduled | Alert responders with expiring credentials |

**Scaffold them:**
```bash
supabase functions new verify-gmc
supabase functions new verify-nmc
supabase functions new dispatch-alert
supabase functions new generate-green-badge
supabase functions new send-sms-alert
supabase functions new gdpr-export
supabase functions new gdpr-delete
supabase functions new cleanup-locations
supabase functions new credential-expiry-check
```

**Edge Function template (verify-gmc example):**

```typescript
// supabase/functions/verify-gmc/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the calling user is authenticated
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request
    const { gmc_number, full_name } = await req.json();

    if (!gmc_number || !full_name) {
      return new Response(JSON.stringify({ error: 'Missing gmc_number or full_name' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call GMC API (replace with real endpoint when available)
    const gmcApiKey = Deno.env.get('GMC_API_KEY');
    const gmcApiUrl = Deno.env.get('GMC_API_URL') ?? 'https://api.gmc-uk.org/v1';

    const gmcResponse = await fetch(`${gmcApiUrl}/doctors/${gmc_number}`, {
      headers: { 'Authorization': `Bearer ${gmcApiKey}` },
    });

    if (!gmcResponse.ok) {
      // Use service role to update credential status
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await serviceClient.from('credentials')
        .update({ verification_status: 'rejected', verified_at: new Date().toISOString() })
        .eq('responder_id', user.id)
        .eq('credential_type', 'gmc');

      // Audit log
      await serviceClient.from('audit_log').insert({
        user_id: user.id,
        user_role: 'responder',
        action: 'credential_verification_failed',
        resource_type: 'credential',
        details: { credential_type: 'gmc', reason: 'api_lookup_failed' },
      });

      return new Response(JSON.stringify({ verified: false, reason: 'GMC number not found' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const gmcData = await gmcResponse.json();

    // Fuzzy name matching (handle "Dr Sarah Johnson" vs "JOHNSON, Sarah")
    const nameMatch = fuzzyNameMatch(full_name, gmcData.name);

    // Update credential and responder tier
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (nameMatch) {
      await serviceClient.from('credentials').update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: 'api_gmc',
        verification_response: { status: gmcData.status, name: gmcData.name },
      })
      .eq('responder_id', user.id)
      .eq('credential_type', 'gmc');

      // Upgrade responder tier
      await serviceClient.from('responders')
        .update({ tier: 'tier1_active_healthcare' })
        .eq('id', user.id);

      // Audit log
      await serviceClient.from('audit_log').insert({
        user_id: user.id,
        user_role: 'responder',
        action: 'credential_verified',
        resource_type: 'credential',
        details: { credential_type: 'gmc', tier_assigned: 'tier1_active_healthcare' },
      });
    }

    return new Response(JSON.stringify({
      verified: nameMatch,
      reason: nameMatch ? 'Verified' : 'Name mismatch with GMC register',
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function fuzzyNameMatch(provided: string, registered: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim().split(/\s+/).sort().join(' ');
  return normalize(provided) === normalize(registered);
}
```

### 7.2 Set Edge Function Secrets

```bash
supabase secrets set GMC_API_KEY=your-gmc-key
supabase secrets set GMC_API_URL=https://api.gmc-uk.org/v1
supabase secrets set NMC_API_KEY=your-nmc-key
supabase secrets set NMC_API_URL=https://api.nmc.org.uk/v1
supabase secrets set TWILIO_ACCOUNT_SID=your-sid
supabase secrets set TWILIO_AUTH_TOKEN=your-token
supabase secrets set TWILIO_PHONE_NUMBER=+44xxxxxxxxxx
supabase secrets set RESEND_API_KEY=your-resend-key
```

**Verify secrets are set:**
```bash
supabase secrets list
```

All 8 secrets must be present.

### 7.3 Deploy Edge Functions

```bash
supabase functions deploy verify-gmc
supabase functions deploy verify-nmc
supabase functions deploy dispatch-alert
supabase functions deploy generate-green-badge
supabase functions deploy send-sms-alert
supabase functions deploy gdpr-export
supabase functions deploy gdpr-delete
supabase functions deploy cleanup-locations
supabase functions deploy credential-expiry-check
```

**Test each function:**
```bash
supabase functions invoke verify-gmc --body '{"gmc_number":"1234567","full_name":"Test Doctor"}'
```

---

## PHASE 8: CRON JOBS

### 8.1 Enable pg_cron

Already done in Phase 1 (`CREATE EXTENSION IF NOT EXISTS "pg_cron"`). Verify:

```sql
SELECT * FROM cron.job;
```

### 8.2 Location Cleanup (Every Hour)

```sql
SELECT cron.schedule(
  'cleanup-expired-locations',
  '0 * * * *',  -- Every hour on the hour
  $$SELECT cleanup_expired_location_history()$$
);
```

This enforces the 24-hour location retention policy required by GDPR and NHS DSPT.

### 8.3 Credential Expiry Check (Daily at 9am UTC)

```sql
SELECT cron.schedule(
  'check-credential-expiry',
  '0 9 * * *',  -- Daily at 09:00 UTC
  $$
  -- Find credentials expiring within 30 days
  INSERT INTO notification_log (responder_id, notification_type, channel, title, body)
  SELECT
    c.responder_id,
    'reminder',
    'push',
    'Credential Expiring Soon',
    'Your ' || c.credential_type || ' credential expires on ' || c.expires_at::date::text || '. Please renew to maintain your responder tier.'
  FROM credentials c
  WHERE c.expires_at IS NOT NULL
    AND c.expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
    AND c.verification_status = 'verified'
    AND NOT EXISTS (
      SELECT 1 FROM notification_log nl
      WHERE nl.responder_id = c.responder_id
        AND nl.notification_type = 'reminder'
        AND nl.body LIKE '%credential expires%'
        AND nl.sent_at > NOW() - INTERVAL '7 days'
    );

  -- Auto-expire credentials past their expiry date
  UPDATE credentials
  SET verification_status = 'expired', updated_at = NOW()
  WHERE expires_at < NOW()
    AND verification_status = 'verified';

  -- Downgrade responders with no valid credentials to Tier 4
  UPDATE responders r
  SET tier = 'tier4_witness', updated_at = NOW()
  WHERE r.tier != 'tier4_witness'
    AND NOT EXISTS (
      SELECT 1 FROM credentials c
      WHERE c.responder_id = r.id
        AND c.verification_status = 'verified'
    );
  $$
);
```

### 8.4 Stale Push Token Cleanup (Weekly)

```sql
SELECT cron.schedule(
  'cleanup-stale-push-tokens',
  '0 3 * * 0',  -- Sundays at 03:00 UTC
  $$
  UPDATE push_tokens
  SET is_active = false, updated_at = NOW()
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    AND is_active = true;
  $$
);
```

**Verify all cron jobs:**
```sql
SELECT jobid, schedule, command, nodename, active FROM cron.job ORDER BY jobid;
```

Expected: 3 active jobs.

---

## PHASE 9: TYPE GENERATION & MIGRATIONS

### 9.1 Generate TypeScript Types

```bash
supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/types/database.types.ts
```

**Run this command every time the schema changes.** The generated types give full type safety for all Supabase queries.

Add to `package.json` scripts:
```json
"db:types": "supabase gen types typescript --project-id <YOUR_PROJECT_REF> > src/types/database.types.ts"
```

**Verify** the generated file contains all 11 tables, all ENUM types, and all function signatures.

### 9.2 Create Migration Files

Every schema change should be a migration:

```bash
supabase migration new create_initial_schema
```

This creates a file in `supabase/migrations/`. Paste the full SQL from `DATABASE_SCHEMA.sql` (minus seed data).

Create separate migrations for:
1. `create_initial_schema` — Tables, ENUMs, indexes, triggers
2. `create_rls_policies` — All RLS policies
3. `create_auth_trigger` — The `handle_new_user` function and trigger
4. `create_storage_buckets` — Buckets and storage policies
5. `create_cron_jobs` — pg_cron schedules
6. `enable_realtime` — Realtime publication setup

**Apply migrations:**
```bash
supabase db push
```

**Reset (dev only):**
```bash
supabase db reset
```

---

## PHASE 10: PRODUCTION HARDENING

### 10.1 Connection Pooling

Go to **Supabase Dashboard → Database → Settings → Connection Pooling:**
- Mode: Transaction (recommended for serverless/Edge Functions)
- Pool size: Start at 15, monitor and adjust

Use the pooler connection string (port 6543) for Edge Functions. Use the direct connection string (port 5432) for migrations.

### 10.2 Rate Limiting in Edge Functions

Implement rate limiting using Supabase's built-in headers or an external store (Upstash Redis):

```typescript
// Simple in-memory rate limiter for Edge Functions (per-function instance)
// For production, use Upstash Redis for distributed rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false; // Rate limited
  }

  entry.count++;
  return true;
}
```

Recommended limits:
- Auth endpoints: 5 requests per 15 minutes per IP
- Credential verification: 5 per hour per user
- Emergency report: 3 per 5 minutes per user
- SMS sending: 10 per hour per user
- Green Badge generation: 60 per hour per user (1 per minute)

### 10.3 Database Backups

Supabase Pro plan includes daily backups with point-in-time recovery. Verify:
- Go to **Dashboard → Database → Backups**
- Confirm daily backups are running
- Note the retention period (7 days on Pro, 30 days on Enterprise)

For NHS DSPT compliance, document the backup schedule, retention, and recovery procedure.

### 10.4 Monitoring

- Enable **Supabase Dashboard → Reports** for database performance metrics
- Set up **Supabase Dashboard → Logs** monitoring for Edge Function errors
- Create alerts for:
  - Database CPU > 80%
  - Edge Function error rate > 5%
  - Realtime connection drops
  - Storage approaching quota

---

## AUDIT COMMAND

Run this SQL query to get a full health check of the ProtaRes Supabase backend:

```sql
-- PROTARES SUPABASE HEALTH CHECK
WITH checks AS (
  -- Extensions
  SELECT 'extensions' AS category,
    (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('postgis','uuid-ossp','pgcrypto','pg_cron'))::text || '/4' AS result

  UNION ALL

  -- Tables
  SELECT 'tables',
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public')::text || '/11'

  UNION ALL

  -- RLS enabled
  SELECT 'rls_enabled',
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true)::text || '/11'

  UNION ALL

  -- RLS policies
  SELECT 'rls_policies',
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public')::text || ' policies'

  UNION ALL

  -- Indexes
  SELECT 'indexes',
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public')::text || ' indexes'

  UNION ALL

  -- GIST indexes (PostGIS)
  SELECT 'gist_indexes',
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexdef LIKE '%GIST%')::text || ' GIST'

  UNION ALL

  -- Functions
  SELECT 'functions',
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION')::text || ' functions'

  UNION ALL

  -- Auth trigger
  SELECT 'auth_trigger',
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers WHERE event_object_schema = 'auth' AND trigger_name = 'on_auth_user_created'
    ) THEN 'EXISTS' ELSE 'MISSING' END

  UNION ALL

  -- Realtime tables
  SELECT 'realtime_tables',
    (SELECT COUNT(*) FROM pg_publication_tables WHERE pubname = 'supabase_realtime')::text || ' tables'

  UNION ALL

  -- Storage buckets
  SELECT 'storage_buckets',
    (SELECT COUNT(*) FROM storage.buckets)::text || ' buckets'

  UNION ALL

  -- Cron jobs
  SELECT 'cron_jobs',
    (SELECT COUNT(*) FROM cron.job WHERE active = true)::text || ' active'

  UNION ALL

  -- Location history (should be cleaned regularly)
  SELECT 'expired_locations',
    (SELECT COUNT(*) FROM location_history WHERE expires_at < NOW())::text || ' expired rows'
)
SELECT * FROM checks;
```

**Expected healthy output:**

| category | result |
|----------|--------|
| extensions | 4/4 |
| tables | 11/11 |
| rls_enabled | 11/11 |
| rls_policies | ~25+ policies |
| indexes | ~20+ indexes |
| gist_indexes | 3+ GIST |
| functions | 3+ functions |
| auth_trigger | EXISTS |
| realtime_tables | 3 tables |
| storage_buckets | 4 buckets |
| cron_jobs | 3 active |
| expired_locations | 0 expired rows |

If any result is below expected, go back to the corresponding Phase and fix it.

---

## ENVIRONMENT-SPECIFIC NOTES

### Development
- Use `supabase start` for local Supabase instance
- Seed data loaded
- Feature flags all enabled
- Email confirmations disabled for speed

### Staging
- Separate Supabase project
- Seed data loaded
- Email confirmations enabled
- Mirrors production config

### Production
- Separate Supabase project (different from dev/staging)
- NO seed data
- All security hardening applied
- Backups verified
- Monitoring active
- Connection pooling enabled

---

*This skill is the single source of truth for ProtaRes Supabase backend configuration.*
*Run the AUDIT COMMAND after every deployment to verify completeness.*
*Last updated: April 2026*
