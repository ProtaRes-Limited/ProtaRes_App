/**
 * Domain types — aligned with the live Supabase schema.
 *
 * The canonical source for field names and enum values is
 * `database.types.ts`, which is regenerated from the live project via
 * `supabase gen types typescript`. This file exposes a small set of
 * app-friendly camelCase types that wrap the raw DB rows so screens
 * don't have to deal with snake_case everywhere.
 *
 * Keep the unions below in lockstep with the enums in database.types.ts.
 */

import type { Database } from './database.types';

// ---------------------------------------------------------------------------
// Enum aliases (pulled straight from the generated types)
// ---------------------------------------------------------------------------

export type ResponderTier = Database['public']['Enums']['responder_tier'];
// 'tier1_active_healthcare' | 'tier2_retired_healthcare' | 'tier3_first_aid' | 'tier4_witness'

export type AvailabilityStatus = Database['public']['Enums']['availability_status'];
// 'available' | 'busy' | 'unavailable' | 'do_not_disturb'

export type TransportMode = Database['public']['Enums']['transport_mode'];
// 'stationary' | 'walking' | 'cycling' | 'bus' | 'train' | 'driving' | 'unknown'

export type EmergencyStatus = Database['public']['Enums']['emergency_status'];
// 'reported' | 'dispatched' | 'responder_en_route' | … | 'no_response'

export type EmergencyType = Database['public']['Enums']['emergency_type'];
// 'cardiac_arrest' | 'heart_attack' | 'road_accident' | …

export type EmergencySeverity = Database['public']['Enums']['emergency_severity'];
// 'critical' | 'serious' | 'moderate' | 'minor'

export type EquipmentType = Database['public']['Enums']['equipment_type'];
// 'aed' | 'trauma_kit' | …

export type ResponseStatus = Database['public']['Enums']['response_status'];
// 'alerted' | 'accepted' | 'declined' | 'en_route' | 'on_scene' | …

export type VerificationStatus = Database['public']['Enums']['verification_status'];
// 'pending' | 'verified' | 'rejected' | 'expired' | 'revoked'

// ---------------------------------------------------------------------------
// Domain objects (camelCase wrappers around DB rows)
// ---------------------------------------------------------------------------

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Responder {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePhotoUrl: string | null;
  tier: ResponderTier;
  availability: AvailabilityStatus;
  currentLocation: Coordinates | null;
  currentTransportMode: TransportMode | null;
  locationUpdatedAt: string | null;
  alertRadiusKm: number;
  smsFallbackEnabled: boolean;
  pushEnabled: boolean;
  totalResponses: number;
  totalAccepted: number;
  totalDeclined: number;
  averageResponseTimeSeconds: number | null;
  locationConsent: boolean;
  locationConsentAt: string | null;
  isAdmin: boolean;
  dataProcessingConsent: boolean;
  dataProcessingConsentAt: string | null;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  deletedAt: string | null;
}

/**
 * Credential "body" used in UI: the form asks the user to pick which
 * regulator they want to verify with. The DB stores this as a TEXT
 * column (`credential_type`) rather than an enum — the values below
 * are the canonical set.
 */
export type CredentialBody = 'gmc' | 'nmc' | 'hcpc' | 'first_aid';

export interface Credential {
  id: string;
  responderId: string;
  credentialType: string;
  /** Hashed value — never stored plaintext. */
  credentialNumberHash: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Emergency {
  id: string;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  location: Coordinates;
  locationAddress: string | null;
  locationDescription: string | null;
  what3words: string | null;
  reportedBy: string | null;
  reporterPhone: string | null;
  reporterName: string | null;
  description: string | null;
  casualtyCount: number;
  casualtiesConscious: boolean | null;
  casualtiesBreathing: boolean | null;
  witnessStreamActive: boolean;
  witnessStreamUrl: string | null;
  equipmentRequested: string[];
  equipmentDelivered: string[];
  ambulanceNotified: boolean;
  ambulanceNotifiedAt: string | null;
  ambulanceEtaMinutes: number | null;
  policeNotified: boolean;
  fireNotified: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  /** Computed client-side for display. */
  distanceMeters: number | null;
  etaMinutes: number | null;
}

export interface GreenBadge {
  signedPayload: string;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
}

export * from './database.types';
