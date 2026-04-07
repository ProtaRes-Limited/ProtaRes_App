import type { Coordinates, TransportMode } from '@/types';
import { haversineDistance } from './utils';

/**
 * Average speeds in meters per second for each transport mode.
 */
const AVERAGE_SPEEDS: Record<TransportMode, number> = {
  stationary: 0,
  walking: 1.4, // ~5 km/h
  cycling: 5.5, // ~20 km/h
  bus: 6.9, // ~25 km/h (accounting for stops)
  train: 13.9, // ~50 km/h (accounting for stops)
  driving: 8.3, // ~30 km/h (urban average)
  unknown: 1.4, // Default to walking
};

/**
 * Estimate travel time in seconds from origin to destination
 * based on the transport mode.
 */
export function estimateTravelTime(
  origin: Coordinates,
  destination: Coordinates,
  transportMode: TransportMode
): number {
  const distance = haversineDistance(origin, destination);
  const speed = AVERAGE_SPEEDS[transportMode];

  if (speed <= 0) return Infinity;

  // Apply a detour factor (straight-line distance is shorter than actual travel)
  const detourFactor = transportMode === 'walking' || transportMode === 'cycling' ? 1.3 : 1.4;

  return (distance * detourFactor) / speed;
}

/**
 * Check if a coordinate is within a given radius (in km) of a center point.
 */
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusKm: number
): boolean {
  const distanceMeters = haversineDistance(point, center);
  return distanceMeters <= radiusKm * 1000;
}

/**
 * Sort an array of items with a location by distance from a reference point.
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
