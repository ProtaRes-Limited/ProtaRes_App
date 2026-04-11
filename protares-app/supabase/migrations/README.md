# Migrations

The initial schema for this project was applied to the live Supabase
project **before** this scaffold was written, so it is not reproduced
here as a SQL file. The authoritative source of truth is the live
project schema.

## How to regenerate TypeScript types

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx \
  npx supabase@latest gen types typescript \
    --project-id dloyziwowuupyesuwlfg \
    --schema public \
    > ../../src/types/database.types.ts
```

This keeps `src/types/database.types.ts` aligned with whatever is
currently deployed.

## How to pull the full schema as SQL

Requires Docker Desktop (Supabase CLI uses a containerised pg_dump):

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx \
SUPABASE_DB_PASSWORD='...' \
  npx supabase@latest db dump \
    --schema public \
    -f 0001_initial_schema.sql
```

## New migrations

For all **future** schema changes, create numbered SQL files in this
directory (`0002_xxx.sql`, `0003_xxx.sql`, etc.) and apply them via:

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx \
SUPABASE_DB_PASSWORD='...' \
  npx supabase@latest db push
```

## Expected enums (as of initial scaffolding)

These are what the live schema currently contains — keep TypeScript
types and Zod schemas in sync with this list:

| Enum | Values |
| --- | --- |
| `availability_status` | `available`, `busy`, `unavailable`, `do_not_disturb` |
| `responder_tier` | `tier1_active_healthcare`, `tier2_retired_healthcare`, `tier3_first_aid`, `tier4_witness` |
| `transport_mode` | `stationary`, `walking`, `cycling`, `bus`, `train`, `driving`, `unknown` |
| `emergency_status` | `reported`, `dispatched`, `responder_en_route`, `responder_on_scene`, `ems_en_route`, `ems_on_scene`, `handover_complete`, `resolved`, `cancelled`, `no_response` |
| `emergency_severity` | `critical`, `serious`, `moderate`, `minor` |
| `emergency_type` | `cardiac_arrest`, `heart_attack`, `road_accident`, `pedestrian_incident`, `cyclist_incident`, `stroke`, `diabetic_emergency`, `anaphylaxis`, `seizure`, `breathing_difficulty`, `stabbing`, `assault`, `serious_fall`, `choking`, `drowning`, `burn`, `electrocution`, `overdose`, `other_medical`, `other_trauma` |
| `equipment_type` | `aed`, `trauma_kit`, `burn_kit`, `naloxone_kit`, `obstetric_kit`, `basic_medical_kit`, `oxygen`, `cutting_gear` |
| `response_status` | `alerted`, `accepted`, `declined`, `en_route`, `on_scene`, `intervening`, `completing`, `completed`, `withdrawn` |
| `verification_status` | `pending`, `verified`, `rejected`, `expired`, `revoked` |
