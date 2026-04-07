import type { Coordinates } from '@/types';

/**
 * Combine class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames for NativeWind.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a distance in meters to a human-readable string.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1)}km` : `${Math.round(km)}km`;
}

/**
 * Format a duration in seconds to a human-readable string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Format a timestamp to a relative time string (e.g., "2 minutes ago").
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffSeconds / 86400);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/**
 * Calculate the Haversine distance between two coordinates in meters.
 */
export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const deltaPhi = ((b.latitude - a.latitude) * Math.PI) / 180;
  const deltaLambda = ((b.longitude - a.longitude) * Math.PI) / 180;

  const x =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * c;
}

/**
 * Calculate the bearing (in degrees) from point a to point b.
 */
export function calculateBearing(a: Coordinates, b: Coordinates): number {
  const phi1 = (a.latitude * Math.PI) / 180;
  const phi2 = (b.latitude * Math.PI) / 180;
  const deltaLambda = ((b.longitude - a.longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}
