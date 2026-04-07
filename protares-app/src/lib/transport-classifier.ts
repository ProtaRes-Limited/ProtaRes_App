import type { Coordinates, TransportMode } from '@/types';
import { haversineDistance, calculateBearing } from './utils';

interface LocationSample {
  coords: Coordinates;
  timestamp: number;
}

interface MovementProfile {
  averageSpeed: number; // m/s
  speedVariance: number; // consistency
  accelerationPattern: number[];
  isOnKnownRoute: boolean;
  routeType?: 'bus' | 'train' | 'road';
}

/**
 * Classify the transport mode based on a series of location samples.
 */
export function classifyTransportMode(
  samples: LocationSample[]
): TransportMode {
  if (samples.length < 2) return 'unknown';

  const profile = analyzeMovement(samples);

  // Stationary: Very low speed
  if (profile.averageSpeed < 0.5) {
    return 'stationary';
  }

  // Walking: 1-2 m/s (3.6-7.2 km/h), high variance
  if (profile.averageSpeed < 2 && profile.speedVariance > 0.3) {
    return 'walking';
  }

  // Cycling: 3-8 m/s (10-30 km/h), moderate variance
  if (profile.averageSpeed >= 3 && profile.averageSpeed <= 8) {
    if (!profile.isOnKnownRoute || profile.routeType === 'road') {
      return 'cycling';
    }
  }

  // Bus: 5-15 m/s with frequent stops, on bus route
  if (profile.isOnKnownRoute && profile.routeType === 'bus') {
    if (hasStopStartPattern(profile.accelerationPattern)) {
      return 'bus';
    }
  }

  // Train: 10-40 m/s, on rail route, smooth acceleration
  if (profile.isOnKnownRoute && profile.routeType === 'train') {
    return 'train';
  }

  // Driving: 5-30 m/s on road, variable speed
  if (profile.averageSpeed >= 5 && profile.averageSpeed <= 30) {
    if (profile.isOnKnownRoute && profile.routeType === 'road') {
      return 'driving';
    }
  }

  // High speed driving (motorway)
  if (profile.averageSpeed > 20) {
    return 'driving';
  }

  return 'unknown';
}

function analyzeMovement(samples: LocationSample[]): MovementProfile {
  const speeds: number[] = [];
  const accelerations: number[] = [];

  for (let i = 1; i < samples.length; i++) {
    const distance = haversineDistance(samples[i - 1].coords, samples[i].coords);
    const timeDelta = (samples[i].timestamp - samples[i - 1].timestamp) / 1000;
    if (timeDelta <= 0) continue;
    const speed = distance / timeDelta;
    speeds.push(speed);

    if (speeds.length >= 2) {
      const acceleration = (speed - speeds[speeds.length - 2]) / timeDelta;
      accelerations.push(acceleration);
    }
  }

  const averageSpeed =
    speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  const speedVariance = calculateVariance(speeds);

  // Check if on known public transport route
  const lastLocation = samples[samples.length - 1].coords;
  const heading =
    samples.length >= 2
      ? calculateBearing(
          samples[samples.length - 2].coords,
          lastLocation
        )
      : 0;
  const routeMatch = matchToKnownRoute(lastLocation, heading);

  return {
    averageSpeed,
    speedVariance,
    accelerationPattern: accelerations,
    isOnKnownRoute: routeMatch !== null,
    routeType: routeMatch?.type,
  };
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

function hasStopStartPattern(accelerations: number[]): boolean {
  let stopCount = 0;

  for (let i = 1; i < accelerations.length; i++) {
    if (accelerations[i - 1] < -1 && accelerations[i] > 0.5) {
      stopCount++;
    }
  }

  return stopCount >= 2;
}

/**
 * Match the current location and heading to a known public transport route.
 * Placeholder implementation - will integrate with TfL API in Phase 2.
 */
function matchToKnownRoute(
  _location: Coordinates,
  _heading: number
): { type: 'bus' | 'train' | 'road' } | null {
  // TODO: Integrate with TfL API for real route matching
  // For now, return null (no known route match)
  return null;
}
