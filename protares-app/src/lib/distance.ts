import type { Coordinates } from '@/types';

const EARTH_RADIUS_M = 6_371_000;

/** Haversine great-circle distance in metres. */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

/** Format a metres value into a short human-readable string. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  if (meters < 10_000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 1000)} km`;
}

/**
 * Rough travel-time estimate given a distance and transport mode.
 * For display only; the real dispatch ETA comes from the Corridor Algorithm
 * and Google Directions API.
 */
export function estimateTravelTimeSeconds(
  meters: number,
  mode: 'walking' | 'cycling' | 'driving' | 'stationary' = 'walking'
): number {
  const speedsMps: Record<string, number> = {
    walking: 1.4,
    cycling: 4.2,
    driving: 11.1, // 40 km/h urban average
    stationary: 1.0,
  };
  const speed = speedsMps[mode] ?? 1.4;
  return Math.round(meters / speed);
}

export function formatEta(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}
