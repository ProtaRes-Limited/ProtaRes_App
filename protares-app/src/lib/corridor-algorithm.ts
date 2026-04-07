import type { Coordinates, TransportMode, Responder, Emergency } from '@/types';
import { haversineDistance, calculateBearing } from './utils';

interface TrajectoryPoint {
  location: Coordinates;
  timestamp: number; // seconds from now
  confidence: number; // 0-1
}

export interface ResponderCandidate {
  responder: Responder;
  etaSeconds: number;
  distanceMeters: number;
  trajectoryMatch: 'direct' | 'corridor' | 'stationary';
  confidence: number;
}

interface LocationHistoryEntry {
  location: Coordinates;
  timestamp: Date;
}

/**
 * Find responders whose predicted trajectory brings them near the emergency.
 */
export function findCorridorResponders(
  emergency: Emergency,
  responders: Responder[],
  maxEtaMinutes: number = 10
): ResponderCandidate[] {
  const candidates: ResponderCandidate[] = [];
  const maxEtaSeconds = maxEtaMinutes * 60;

  for (const responder of responders) {
    if (!responder.currentLocation) continue;

    const trajectory = predictTrajectory(
      responder.currentLocation,
      responder.currentTransportMode,
      [] // Location history would be passed from tracking
    );

    const intersection = findTrajectoryIntersection(
      trajectory,
      emergency.location,
      getAlertRadius(emergency)
    );

    if (intersection && intersection.etaSeconds <= maxEtaSeconds) {
      candidates.push({
        responder,
        etaSeconds: intersection.etaSeconds,
        distanceMeters: intersection.distanceMeters,
        trajectoryMatch: intersection.matchType as 'direct' | 'corridor' | 'stationary',
        confidence: intersection.confidence,
      });
    }
  }

  // Sort by confidence, then tier, then ETA
  const tierOrder: Record<string, number> = {
    tier1_active_healthcare: 1,
    tier2_retired_healthcare: 2,
    tier3_first_aid: 3,
    tier4_witness: 4,
  };

  return candidates.sort((a, b) => {
    // Prioritize higher confidence matches
    if (Math.abs(a.confidence - b.confidence) > 0.3) {
      return b.confidence - a.confidence;
    }
    // Then by tier
    if (tierOrder[a.responder.tier] !== tierOrder[b.responder.tier]) {
      return tierOrder[a.responder.tier] - tierOrder[b.responder.tier];
    }
    // Then by ETA
    return a.etaSeconds - b.etaSeconds;
  });
}

/**
 * Predict the trajectory of a responder based on current location,
 * transport mode, and recent location history.
 */
export function predictTrajectory(
  currentLocation: Coordinates,
  transportMode: TransportMode,
  locationHistory: LocationHistoryEntry[]
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];

  // Current position with full confidence
  trajectory.push({
    location: currentLocation,
    timestamp: 0,
    confidence: 1.0,
  });

  if (transportMode === 'stationary' || locationHistory.length < 2) {
    return trajectory;
  }

  // Calculate velocity vector from recent history
  const velocity = calculateVelocity(locationHistory);

  // Linear prediction for walking, driving, cycling, etc.
  const predictions = [30, 60, 120, 180, 300, 600]; // seconds

  for (const seconds of predictions) {
    const predicted = extrapolatePosition(currentLocation, velocity, seconds);
    trajectory.push({
      location: predicted,
      timestamp: seconds,
      confidence: Math.max(0.3, 1 - (seconds / 600) * 0.7),
    });
  }

  return trajectory;
}

/**
 * Find the point where a trajectory intersects an emergency's alert radius.
 */
export function findTrajectoryIntersection(
  trajectory: TrajectoryPoint[],
  emergencyLocation: Coordinates,
  radiusMeters: number
): {
  etaSeconds: number;
  distanceMeters: number;
  matchType: string;
  confidence: number;
} | null {
  for (const point of trajectory) {
    const distance = haversineDistance(point.location, emergencyLocation);

    if (distance <= radiusMeters) {
      return {
        etaSeconds: point.timestamp,
        distanceMeters: distance,
        matchType: point.timestamp === 0 ? 'stationary' : 'corridor',
        confidence: point.confidence,
      };
    }
  }

  // Check if closest approach is within acceptable range
  const closestApproach = findClosestApproach(trajectory, emergencyLocation);
  if (closestApproach && closestApproach.distance <= radiusMeters * 1.5) {
    return {
      etaSeconds:
        closestApproach.timestamp +
        estimateDiversionTime(closestApproach.distance),
      distanceMeters: closestApproach.distance,
      matchType: 'corridor',
      confidence: closestApproach.confidence * 0.8,
    };
  }

  return null;
}

// ============ Helper Functions ============

function calculateVelocity(
  history: LocationHistoryEntry[]
): { speed: number; heading: number } {
  if (history.length < 2) {
    return { speed: 0, heading: 0 };
  }

  const recent = history.slice(-2);
  const timeDelta =
    (recent[1].timestamp.getTime() - recent[0].timestamp.getTime()) / 1000;
  if (timeDelta <= 0) return { speed: 0, heading: 0 };

  const distance = haversineDistance(recent[0].location, recent[1].location);
  const speed = distance / timeDelta;
  const heading = calculateBearing(recent[0].location, recent[1].location);

  return { speed, heading };
}

function extrapolatePosition(
  current: Coordinates,
  velocity: { speed: number; heading: number },
  seconds: number
): Coordinates {
  const distance = velocity.speed * seconds;
  const headingRad = (velocity.heading * Math.PI) / 180;

  const R = 6371e3;
  const lat1 = (current.latitude * Math.PI) / 180;
  const lon1 = (current.longitude * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
      Math.cos(lat1) * Math.sin(distance / R) * Math.cos(headingRad)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(headingRad) * Math.sin(distance / R) * Math.cos(lat1),
      Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}

function findClosestApproach(
  trajectory: TrajectoryPoint[],
  target: Coordinates
): { distance: number; timestamp: number; confidence: number } | null {
  if (trajectory.length === 0) return null;

  let closest = {
    distance: Infinity,
    timestamp: 0,
    confidence: 0,
  };

  for (const point of trajectory) {
    const distance = haversineDistance(point.location, target);
    if (distance < closest.distance) {
      closest = {
        distance,
        timestamp: point.timestamp,
        confidence: point.confidence,
      };
    }
  }

  return closest.distance < Infinity ? closest : null;
}

function estimateDiversionTime(distanceMeters: number): number {
  // Assume walking speed for diversion (~1.4 m/s)
  return distanceMeters / 1.4;
}

function getAlertRadius(emergency: Emergency): number {
  const baseRadius: Record<string, number> = {
    cardiac_arrest: 500,
    road_accident: 800,
    stroke: 600,
    default: 1000,
  };

  return baseRadius[emergency.emergencyType] || baseRadius.default;
}
