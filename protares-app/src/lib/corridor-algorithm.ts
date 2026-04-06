import type { Coordinates, TransportMode, Emergency } from '@/types';
import { haversineDistance, calculateBearing } from './utils';

interface TrajectoryPoint {
  location: Coordinates;
  timestamp: number;
  confidence: number;
}

export interface ResponderCandidate {
  responderId: string;
  etaSeconds: number;
  distanceMeters: number;
  trajectoryMatch: 'direct' | 'corridor' | 'stationary';
  confidence: number;
}

interface LocationSample {
  location: Coordinates;
  timestamp: number;
}

function extrapolatePosition(
  current: Coordinates,
  velocity: { speed: number; heading: number },
  seconds: number
): Coordinates {
  const distance = velocity.speed * seconds;
  const R = 6371e3;

  const headingRad = (velocity.heading * Math.PI) / 180;
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

function calculateVelocity(history: LocationSample[]): { speed: number; heading: number } {
  if (history.length < 2) {
    return { speed: 0, heading: 0 };
  }

  const recent = history.slice(-2);
  const timeDelta = (recent[1].timestamp - recent[0].timestamp) / 1000;
  if (timeDelta === 0) return { speed: 0, heading: 0 };

  const distance = haversineDistance(recent[0].location, recent[1].location);
  const speed = distance / timeDelta;
  const heading = calculateBearing(recent[0].location, recent[1].location);

  return { speed, heading };
}

export function predictTrajectory(
  currentLocation: Coordinates,
  transportMode: TransportMode,
  locationHistory: LocationSample[]
): TrajectoryPoint[] {
  const trajectory: TrajectoryPoint[] = [];

  trajectory.push({
    location: currentLocation,
    timestamp: 0,
    confidence: 1.0,
  });

  if (transportMode === 'stationary' || locationHistory.length < 2) {
    return trajectory;
  }

  const velocity = calculateVelocity(locationHistory);
  const predictions = [30, 60, 120, 180, 300, 600];

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

function getAlertRadius(emergency: Emergency): number {
  const baseRadius: Record<string, number> = {
    cardiac_arrest: 500,
    road_accident: 800,
    stroke: 600,
  };
  return baseRadius[emergency.emergencyType] || 1000;
}

export function findTrajectoryIntersection(
  trajectory: TrajectoryPoint[],
  emergencyLocation: Coordinates,
  radiusMeters: number
): { etaSeconds: number; distanceMeters: number; matchType: string; confidence: number } | null {
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

  // Check closest approach
  let closestDistance = Infinity;
  let closestPoint: TrajectoryPoint | null = null;
  for (const point of trajectory) {
    const d = haversineDistance(point.location, emergencyLocation);
    if (d < closestDistance) {
      closestDistance = d;
      closestPoint = point;
    }
  }

  if (closestPoint && closestDistance <= radiusMeters * 1.5) {
    const diversionTime = Math.round(closestDistance / 1.4); // ~walking speed
    return {
      etaSeconds: closestPoint.timestamp + diversionTime,
      distanceMeters: closestDistance,
      matchType: 'corridor',
      confidence: closestPoint.confidence * 0.8,
    };
  }

  return null;
}

export function findCorridorResponders(
  emergency: Emergency,
  responders: Array<{
    id: string;
    currentLocation: Coordinates;
    transportMode: TransportMode;
    locationHistory: LocationSample[];
    tier: string;
  }>,
  maxEtaMinutes: number = 10
): ResponderCandidate[] {
  const candidates: ResponderCandidate[] = [];
  const maxEtaSeconds = maxEtaMinutes * 60;
  const alertRadius = getAlertRadius(emergency);

  for (const responder of responders) {
    const trajectory = predictTrajectory(
      responder.currentLocation,
      responder.transportMode,
      responder.locationHistory
    );

    const intersection = findTrajectoryIntersection(trajectory, emergency.location, alertRadius);

    if (intersection && intersection.etaSeconds <= maxEtaSeconds) {
      candidates.push({
        responderId: responder.id,
        etaSeconds: intersection.etaSeconds,
        distanceMeters: intersection.distanceMeters,
        trajectoryMatch: intersection.matchType as ResponderCandidate['trajectoryMatch'],
        confidence: intersection.confidence,
      });
    }
  }

  return candidates.sort((a, b) => {
    if (Math.abs(a.confidence - b.confidence) > 0.3) {
      return b.confidence - a.confidence;
    }
    return a.etaSeconds - b.etaSeconds;
  });
}
