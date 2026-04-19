import { Linking, Platform } from 'react-native';

import { captureException } from '@/lib/sentry';
import { trustForPostcode, type AmbulanceTrust } from '@/data/ambulanceTrusts';
import type { Coordinates } from '@/types';

/**
 * Emergency services lookup + initiate-contact helpers.
 *
 * Tier 1 of the emergency-services feature set: no VoIP, no partner
 * integration. Uses the public data.police.uk API (no auth required) to
 * identify the user's local police force from their GPS location, then
 * routes outbound calls via native tel:/sms: URL handlers.
 *
 * 999 and 101 and 111 are universal across the UK — the telecom network
 * routes them automatically. The district-aware part is purely informational
 * (showing "Your local force: Humberside Police" + their website) plus
 * deep-linking to the force's non-emergency web form.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PoliceForce {
  id: string;
  name: string;
  description?: string;
  url?: string;
  telephone?: string;
  engagementMethods?: Array<{ type: string; url: string; description?: string }>;
}

export interface Neighbourhood {
  force: string;      // force id, e.g. "humberside"
  neighbourhood: string; // team id within that force
}

export interface EmergencyContactProfile {
  coords: Coordinates | null;
  postcode: string | null;
  policeForce: PoliceForce | null;
  ambulanceTrust: AmbulanceTrust | null;
  loadedAt: number;
}

// ─── data.police.uk client ───────────────────────────────────────────────────

const POLICE_UK_BASE = 'https://data.police.uk/api';

/**
 * Look up the police force covering a given lat/lng.
 * data.police.uk covers England, Wales, and Northern Ireland.
 * Scotland is served by Police Scotland (returned as "police-scotland").
 */
export async function locateNeighbourhood(
  coords: Coordinates
): Promise<Neighbourhood | null> {
  try {
    const res = await fetch(
      `${POLICE_UK_BASE}/locate-neighbourhood?q=${coords.latitude},${coords.longitude}`,
      { method: 'GET' }
    );
    if (!res.ok) return null;
    return (await res.json()) as Neighbourhood;
  } catch (err) {
    captureException(err, { context: 'locateNeighbourhood' });
    return null;
  }
}

export async function fetchPoliceForce(forceId: string): Promise<PoliceForce | null> {
  try {
    const res = await fetch(`${POLICE_UK_BASE}/forces/${forceId}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      id?: string;
      name?: string;
      description?: string;
      url?: string;
      telephone?: string;
      engagement_methods?: Array<{ type: string; url: string; description?: string }>;
    };
    return {
      id: data.id ?? forceId,
      name: data.name ?? forceId,
      description: data.description,
      url: data.url,
      telephone: data.telephone,
      engagementMethods: data.engagement_methods,
    };
  } catch (err) {
    captureException(err, { context: 'fetchPoliceForce', forceId });
    return null;
  }
}

// ─── Postcode reverse-geocode ────────────────────────────────────────────────

/**
 * postcodes.io is a free, no-auth, UK-wide postcode API. Used to map a
 * GPS point to a postcode so we can identify the ambulance trust.
 */
export async function reverseGeocodePostcode(
  coords: Coordinates
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes?lon=${coords.longitude}&lat=${coords.latitude}&limit=1&radius=2000`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: Array<{ postcode?: string }> | null;
    };
    return data.result?.[0]?.postcode ?? null;
  } catch (err) {
    captureException(err, { context: 'reverseGeocodePostcode' });
    return null;
  }
}

// ─── Composed lookup ─────────────────────────────────────────────────────────

/**
 * Build a full emergency contact profile from the user's current location.
 * Any sub-lookup that fails returns null for that field — the UI handles
 * degraded states gracefully, since 999/101/111 always work regardless.
 */
export async function buildContactProfile(
  coords: Coordinates | null
): Promise<EmergencyContactProfile> {
  const profile: EmergencyContactProfile = {
    coords,
    postcode: null,
    policeForce: null,
    ambulanceTrust: null,
    loadedAt: Date.now(),
  };

  if (!coords) return profile;

  // Run sub-lookups in parallel — they're independent.
  const [neighbourhood, postcode] = await Promise.all([
    locateNeighbourhood(coords),
    reverseGeocodePostcode(coords),
  ]);

  if (neighbourhood?.force) {
    profile.policeForce = await fetchPoliceForce(neighbourhood.force);
  }

  profile.postcode = postcode;
  if (postcode) {
    profile.ambulanceTrust = trustForPostcode(postcode);
  }

  return profile;
}

// ─── Outbound contact helpers ────────────────────────────────────────────────

export async function callEmergency(): Promise<void> {
  await Linking.openURL('tel:999').catch((err) =>
    captureException(err, { context: 'callEmergency' })
  );
}

export async function callPoliceNonEmergency(): Promise<void> {
  await Linking.openURL('tel:101').catch((err) =>
    captureException(err, { context: 'callPoliceNonEmergency' })
  );
}

export async function callNhsNonEmergency(): Promise<void> {
  await Linking.openURL('tel:111').catch((err) =>
    captureException(err, { context: 'callNhsNonEmergency' })
  );
}

/**
 * Open the user's SMS app prefilled to 999. Requires the user to be
 * pre-registered with the UK emergencySMS service (free, text REGISTER to
 * 999 once). Critical accessibility path for deaf / hard-of-hearing users.
 */
export async function smsEmergency(prefill = ''): Promise<void> {
  const separator = Platform.OS === 'ios' ? '&' : '?';
  const url = prefill ? `sms:999${separator}body=${encodeURIComponent(prefill)}` : 'sms:999';
  await Linking.openURL(url).catch((err) =>
    captureException(err, { context: 'smsEmergency' })
  );
}

export async function openForceWebsite(force: PoliceForce): Promise<void> {
  if (!force.url) return;
  await Linking.openURL(force.url).catch((err) =>
    captureException(err, { context: 'openForceWebsite', force: force.id })
  );
}

export async function openTrustWebsite(trust: AmbulanceTrust): Promise<void> {
  await Linking.openURL(trust.website).catch((err) =>
    captureException(err, { context: 'openTrustWebsite', trust: trust.id })
  );
}
