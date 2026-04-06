import type { Coordinates, TransportMode } from '@/types';
import { haversineDistance } from './utils';

interface LocationSample {
  coords: Coordinates;
  timestamp: number;
}

interface MovementProfile {
  averageSpeed: number;
  speedVariance: number;
  accelerationPattern: number[];
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

function analyzeMovement(samples: LocationSample[]): MovementProfile {
  const speeds: number[] = [];
  const accelerations: number[] = [];

  for (let i = 1; i < samples.length; i++) {
    const distance = haversineDistance(samples[i - 1].coords, samples[i].coords);
    const timeDelta = (samples[i].timestamp - samples[i - 1].timestamp) / 1000;
    if (timeDelta === 0) continue;

    const speed = distance / timeDelta;
    speeds.push(speed);

    if (speeds.length >= 2) {
      const acceleration = (speed - speeds[speeds.length - 2]) / timeDelta;
      accelerations.push(acceleration);
    }
  }

  const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  const speedVariance = calculateVariance(speeds);

  return {
    averageSpeed,
    speedVariance,
    accelerationPattern: accelerations,
  };
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

export function classifyTransportMode(samples: LocationSample[]): TransportMode {
  if (samples.length < 2) return 'unknown';

  const profile = analyzeMovement(samples);

  // Stationary: Very low speed
  if (profile.averageSpeed < 0.5) {
    return 'stationary';
  }

  // Walking: 1-2 m/s (3.6-7.2 km/h)
  if (profile.averageSpeed < 2 && profile.speedVariance > 0.3) {
    return 'walking';
  }

  // Cycling: 3-8 m/s (10-30 km/h)
  if (profile.averageSpeed >= 3 && profile.averageSpeed <= 8) {
    return 'cycling';
  }

  // Bus: frequent stops
  if (profile.averageSpeed >= 5 && profile.averageSpeed <= 15) {
    if (hasStopStartPattern(profile.accelerationPattern)) {
      return 'bus';
    }
  }

  // Train: 10-40 m/s, smooth
  if (profile.averageSpeed >= 10 && profile.averageSpeed <= 40 && profile.speedVariance < 5) {
    return 'train';
  }

  // Driving: 5-30 m/s
  if (profile.averageSpeed >= 5 && profile.averageSpeed <= 30) {
    return 'driving';
  }

  // High speed = driving
  if (profile.averageSpeed > 20) {
    return 'driving';
  }

  return 'unknown';
}
