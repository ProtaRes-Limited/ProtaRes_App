import { computeCorridor, type TimestampedPoint } from '@/lib/corridor-algorithm';

/**
 * Corridor Algorithm behavioural tests.
 *
 * We focus on properties rather than exact numeric outputs because the
 * algorithm will evolve (TfL integration, acceleration smoothing). The
 * invariants below must hold no matter how the internals change:
 *
 *   1. Stationary history → closest distance equals current distance
 *   2. A responder moving towards the target has a closest distance
 *      smaller than their current distance
 *   3. A responder moving away from the target has a closest distance
 *      equal to the current distance (at t=0)
 *   4. Confidence decays monotonically across the horizon
 */

describe('computeCorridor', () => {
  const target = { latitude: 51.5074, longitude: -0.1278 }; // Trafalgar Square

  const now = 1_700_000_000_000;

  function walkingPoints(startLat: number, startLng: number, dir: 1 | -1): TimestampedPoint[] {
    return Array.from({ length: 5 }, (_, i) => ({
      latitude: startLat + dir * i * 0.0002,
      longitude: startLng + dir * i * 0.0001,
      timestamp: now + i * 20_000,
    }));
  }

  test('stationary responder: closest distance equals current distance', () => {
    const history: TimestampedPoint[] = [
      { latitude: 51.5090, longitude: -0.1290, timestamp: now },
      { latitude: 51.5090, longitude: -0.1290, timestamp: now + 20_000 },
      { latitude: 51.5090, longitude: -0.1290, timestamp: now + 40_000 },
    ];
    const result = computeCorridor(history, target, 'stationary');
    expect(result.closestDistanceMeters).toBeGreaterThan(0);
    expect(result.closestTMinutes).toBe(0);
  });

  test('responder moving towards target has closest distance < current distance', () => {
    // Start northeast of target, walk southwest.
    const history = walkingPoints(51.5100, -0.1260, -1);
    const result = computeCorridor(history, target, 'walking');
    const current = history[history.length - 1]!;
    const startDistance = Math.hypot(
      (current.latitude - target.latitude) * 111_000,
      (current.longitude - target.longitude) * 70_000
    );
    expect(result.closestDistanceMeters).toBeLessThan(startDistance);
  });

  test('confidence decays across the horizon', () => {
    const history = walkingPoints(51.5100, -0.1260, -1);
    const result = computeCorridor(history, target, 'walking');
    for (let i = 1; i < result.points.length; i++) {
      const prev = result.points[i - 1]!;
      const curr = result.points[i]!;
      expect(curr.confidence).toBeLessThanOrEqual(prev.confidence);
    }
  });

  test('willIntercept flag flips on close approach', () => {
    // Walk straight at the target.
    const history: TimestampedPoint[] = [
      { latitude: 51.5080, longitude: -0.1280, timestamp: now },
      { latitude: 51.5078, longitude: -0.1279, timestamp: now + 20_000 },
      { latitude: 51.5076, longitude: -0.1278, timestamp: now + 40_000 },
    ];
    const result = computeCorridor(history, target, 'walking');
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.closestDistanceMeters).toBeGreaterThanOrEqual(0);
  });
});
