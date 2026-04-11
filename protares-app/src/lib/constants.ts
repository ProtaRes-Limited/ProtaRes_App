/**
 * App-wide constants. Keep this file free of React imports so it can be
 * consumed by Edge Functions and Jest tests without pulling RN.
 *
 * Enum value arrays mirror the live Supabase schema — regenerate
 * src/types/database.types.ts and update these arrays together.
 */

export const APP_NAME = 'ProtaRes';
export const EMERGENCY_SERVICE_NUMBER = '999';

/** Default search radius when locating nearby responders (kilometres). */
export const DEFAULT_ALERT_RADIUS_KM = 5;

/** Maximum time a responder has to accept an emergency before the next tier is notified. */
export const RESPONDER_ACCEPT_TIMEOUT_SECONDS = 60;

/** Location history retention — GDPR minimisation. */
export const LOCATION_HISTORY_RETENTION_HOURS = 24;

/** Green Badge QR regeneration interval. */
export const GREEN_BADGE_REFRESH_SECONDS = 60;

/** Corridor algorithm horizon. */
export const CORRIDOR_HORIZON_MINUTES = 10;
export const CORRIDOR_STEP_MINUTES = 1;

/** Emergency status machine transitions. */
export const EMERGENCY_STATUSES = [
  'reported',
  'dispatched',
  'responder_en_route',
  'responder_on_scene',
  'ems_en_route',
  'ems_on_scene',
  'handover_complete',
  'resolved',
  'cancelled',
  'no_response',
] as const;

export const RESPONDER_TIERS = [
  'tier1_active_healthcare',
  'tier2_retired_healthcare',
  'tier3_first_aid',
  'tier4_witness',
] as const;

export const AVAILABILITY_STATUSES = [
  'available',
  'busy',
  'unavailable',
  'do_not_disturb',
] as const;

export const TRANSPORT_MODES = [
  'stationary',
  'walking',
  'cycling',
  'bus',
  'train',
  'driving',
  'unknown',
] as const;

export const EMERGENCY_TYPES = [
  'cardiac_arrest',
  'heart_attack',
  'road_accident',
  'pedestrian_incident',
  'cyclist_incident',
  'stroke',
  'diabetic_emergency',
  'anaphylaxis',
  'seizure',
  'breathing_difficulty',
  'stabbing',
  'assault',
  'serious_fall',
  'choking',
  'drowning',
  'burn',
  'electrocution',
  'overdose',
  'other_medical',
  'other_trauma',
] as const;

export const EMERGENCY_SEVERITIES = [
  'critical',
  'serious',
  'moderate',
  'minor',
] as const;

export const RESPONSE_STATUSES = [
  'alerted',
  'accepted',
  'declined',
  'en_route',
  'on_scene',
  'intervening',
  'completing',
  'completed',
  'withdrawn',
] as const;

export const VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'expired',
  'revoked',
] as const;

/** Rate limits enforced client-side (server enforces too). */
export const RATE_LIMITS = {
  login: { count: 5, windowMs: 15 * 60 * 1000 },
  credentialVerify: { count: 5, windowMs: 60 * 60 * 1000 },
  emergencyReport: { count: 3, windowMs: 5 * 60 * 1000 },
} as const;
