import type { Coordinates } from '@/types';
import { haversineDistance } from './utils';

/**
 * Estimates travel time based on transport mode and distance.
 */
export function estimateTravelTime(
  from: Coordinates,
  to: Coordinates,
  mode: 'walking' | 'cycling' | 'driving' | 'transit'
): number {
  const distance = haversineDistance(from, to);

  // Average speeds in m/s
  const speeds: Record<string, number> = {
    walking: 1.4, // ~5 km/h
    cycling: 4.5, // ~16 km/h
    driving: 8.3, // ~30 km/h (urban)
    transit: 6.0, // ~22 km/h (average with stops)
  };

  const speed = speeds[mode] || speeds.walking;
  return Math.ceil(distance / speed);
}

/**
 * Checks if a coordinate is within a given radius of another coordinate.
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusMeters: number
): boolean {
  return haversineDistance(center, point) <= radiusMeters;
}

/**
 * Sorts coordinates by distance from a reference point.
 */
export function sortByDistance<T extends { location: Coordinates }>(
  items: T[],
  from: Coordinates
): (T & { distanceMeters: number })[] {
  return items
    .map((item) => ({
      ...item,
      distanceMeters: haversineDistance(from, item.location),
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
