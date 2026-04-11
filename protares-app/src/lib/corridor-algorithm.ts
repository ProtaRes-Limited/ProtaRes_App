import type { Coordinates, TransportMode } from '@/types';
import { haversineDistance } from './distance';
import { CORRIDOR_HORIZON_MINUTES, CORRIDOR_STEP_MINUTES } from './constants';

/**
 * Corridor Algorithm™ (patent-pending) — §10.1 of master instructions.
 *
 * PROBLEM
 *   A naive "circle around the emergency" dispatch alerts stale responders
 *   who are moving away. A responder might be 2 km from the incident right
 *   now but about to pass it in 90 seconds on a northbound bus — we want
 *   that responder in the alert.
 *
 * APPROACH
 *   1. Estimate the responder's velocity from their recent points.
 *   2. Project forward at CORRIDOR_STEP_MINUTES intervals for up to
 *      CORRIDOR_HORIZON_MINUTES, adjusting speed by transport mode.
 *   3. For each predicted point, compute distance to the target.
 *   4. Find the minimum predicted distance and the time at which it occurs.
 *   5. That (t, distance) pair is the Expected Closest Approach.
 *   6. A confidence score decays with time (further = less certain),
 *      weighted by the transport mode's inherent variance.
 *
 * NOTE
 *   The real production version consults TfL route geometry for
 *   bus / train modes, so predictions follow the track rather than a
 *   straight line. This client-side version uses velocity extrapolation
 *   as a fallback for the UI preview; the authoritative corridor runs
 *   inside the `dispatch-alert` Edge Function.
 */

export interface TimestampedPoint extends Coordinates {
  /** epoch ms */
  timestamp: number;
}

export interface CorridorPoint {
  coords: Coordinates;
  /** Minutes from now */
  tMinutes: number;
  /** Distance from the target at this predicted time (metres) */
  distanceMeters: number;
  /** 0-1 confidence the responder is near this point */
  confidence: number;
}

export interface CorridorResult {
  points: CorridorPoint[];
  /** Minimum predicted distance across the horizon (metres) */
  closestDistanceMeters: number;
  /** Minutes from now at which the closest approach occurs */
  closestTMinutes: number;
  /** Overall confidence the responder will reach that closest distance */
  confidence: number;
  /** True if the responder is projected to pass within 100 m of the target */
  willIntercept: boolean;
}

/** Typical maximum speed per mode, used as a velocity cap during projection. */
const MAX_SPEED_MPS: Record<TransportMode, number> = {
  stationary: 0.5,
  walking: 2.0,
  cycling: 6.0,
  bus: 15.0,
  train: 35.0,
  driving: 22.0,
  unknown: 5.0, // conservative default when classifier cannot pin a mode
};

/** Per-mode confidence decay factor per minute of horizon. */
const CONFIDENCE_DECAY: Record<TransportMode, number> = {
  stationary: 0.01,
  walking: 0.04,
  cycling: 0.06,
  bus: 0.09,
  train: 0.12,
  driving: 0.1,
  unknown: 0.15, // decay fastest when we don't know how the responder is moving
};

export function computeCorridor(
  history: TimestampedPoint[],
  target: Coordinates,
  transportMode: TransportMode = 'walking'
): CorridorResult {
  if (history.length < 2) {
    const lastPoint = history[history.length - 1];
    const current = lastPoint ?? target;
    const distance = haversineDistance(current, target);
    const point: CorridorPoint = {
      coords: current,
      tMinutes: 0,
      distanceMeters: distance,
      confidence: 0.3,
    };
    return {
      points: [point],
      closestDistanceMeters: distance,
      closestTMinutes: 0,
      confidence: 0.3,
      willIntercept: distance < 100,
    };
  }

  const velocity = estimateVelocity(history);
  const maxSpeed = MAX_SPEED_MPS[transportMode];
  const cappedVelocity = capVelocity(velocity, maxSpeed);
  const decay = CONFIDENCE_DECAY[transportMode];
  const current = history[history.length - 1]!;

  const points: CorridorPoint[] = [];
  let closest: CorridorPoint = {
    coords: current,
    tMinutes: 0,
    distanceMeters: haversineDistance(current, target),
    confidence: 1.0,
  };

  for (let t = 0; t <= CORRIDOR_HORIZON_MINUTES; t += CORRIDOR_STEP_MINUTES) {
    const projected = projectCoordinate(current, cappedVelocity, t * 60);
    const dist = haversineDistance(projected, target);
    const confidence = Math.max(0, 1 - decay * t);
    const p: CorridorPoint = { coords: projected, tMinutes: t, distanceMeters: dist, confidence };
    points.push(p);
    if (dist < closest.distanceMeters) {
      closest = p;
    }
  }

  return {
    points,
    closestDistanceMeters: closest.distanceMeters,
    closestTMinutes: closest.tMinutes,
    confidence: closest.confidence,
    willIntercept: closest.distanceMeters < 100,
  };
}

interface Velocity {
  /** metres per second in the latitude direction */
  vLatMps: number;
  /** metres per second in the longitude direction */
  vLngMps: number;
}

function estimateVelocity(history: TimestampedPoint[]): Velocity {
  const latest = history[history.length - 1]!;
  const earlier = history[history.length - 2]!;
  const dtSec = (latest.timestamp - earlier.timestamp) / 1000;
  if (dtSec <= 0) return { vLatMps: 0, vLngMps: 0 };

  const metersPerDegLat = 111_000;
  const metersPerDegLng =
    111_000 * Math.cos((latest.latitude * Math.PI) / 180);

  const vLatMps = ((latest.latitude - earlier.latitude) * metersPerDegLat) / dtSec;
  const vLngMps = ((latest.longitude - earlier.longitude) * metersPerDegLng) / dtSec;

  return { vLatMps, vLngMps };
}

function capVelocity(v: Velocity, maxMps: number): Velocity {
  const mag = Math.hypot(v.vLatMps, v.vLngMps);
  if (mag <= maxMps || mag === 0) return v;
  const factor = maxMps / mag;
  return { vLatMps: v.vLatMps * factor, vLngMps: v.vLngMps * factor };
}

function projectCoordinate(
  from: Coordinates,
  velocity: Velocity,
  seconds: number
): Coordinates {
  const metersPerDegLat = 111_000;
  const metersPerDegLng = 111_000 * Math.cos((from.latitude * Math.PI) / 180);
  return {
    latitude: from.latitude + (velocity.vLatMps * seconds) / metersPerDegLat,
    longitude: from.longitude + (velocity.vLngMps * seconds) / metersPerDegLng,
  };
}
