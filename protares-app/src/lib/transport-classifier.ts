import type { Coordinates, TransportMode } from '@/types';
import { haversineDistance } from './distance';

/**
 * Transport Mode Classifier™ (patent-pending) — §10.2.
 *
 * Lightweight, on-device heuristic that looks at the last ~20 location
 * points and infers the most likely mode. Used to:
 *   1. Show the responder an accurate "you're walking / cycling / on a bus"
 *      indicator on the home screen.
 *   2. Feed into the Corridor Algorithm so dispatch can predict where
 *      they will be in 1-10 minutes.
 *
 * The real production version will also consult:
 *   • TfL route data (for buses and trains)
 *   • Device activity recognition APIs (iOS CoreMotion / Android
 *     ActivityRecognitionClient) for cross-validation
 *   • Time-of-day heuristics (rush hour = more likely transit)
 *
 * This implementation uses only speed profiles, so it will never over-
 * commit to a classification it cannot justify from the raw points.
 */

export interface TimestampedPoint extends Coordinates {
  timestamp: number; // epoch ms
}

const MIN_POINTS = 3;

export function classifyTransportMode(points: TimestampedPoint[]): TransportMode {
  if (points.length < MIN_POINTS) return 'stationary';

  const speeds = computeSpeeds(points);
  if (speeds.length === 0) return 'stationary';

  const averageMps = mean(speeds);
  const maxMps = Math.max(...speeds);
  const varianceMps = variance(speeds);

  // Thresholds tuned to realistic urban mobility.
  if (averageMps < 0.3) return 'stationary';
  if (averageMps < 2.0 && maxMps < 3.0) return 'walking';
  if (averageMps < 6.5 && maxMps < 9.0) return 'cycling';

  // Above 6.5 m/s (~23 km/h) we are in vehicle territory. Use variance
  // to distinguish stop-and-go bus/train travel from a steady driving
  // profile. A tight route match would disambiguate bus vs train — we
  // leave that to the server-side classifier.
  if (averageMps < 14 && varianceMps > 8) return 'bus';
  if (averageMps < 28 && varianceMps > 15) return 'train';

  return 'driving';
}

function computeSpeeds(points: TimestampedPoint[]): number[] {
  const speeds: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    const dt = (curr.timestamp - prev.timestamp) / 1000; // seconds
    if (dt <= 0) continue;
    const dist = haversineDistance(prev, curr);
    speeds.push(dist / dt);
  }
  return speeds;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return mean(values.map((v) => (v - m) ** 2));
}
