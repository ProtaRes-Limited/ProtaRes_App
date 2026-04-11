import { haversineDistance, formatDistance, estimateTravelTimeSeconds, formatEta } from '@/lib/distance';

describe('haversineDistance', () => {
  test('zero distance between identical points', () => {
    const p = { latitude: 51.5074, longitude: -0.1278 };
    expect(haversineDistance(p, p)).toBeCloseTo(0, 1);
  });

  test('known-good London distance', () => {
    // Trafalgar Square ↔ St. Paul's is about 2.1 km.
    const trafalgar = { latitude: 51.5074, longitude: -0.1278 };
    const stPauls = { latitude: 51.5138, longitude: -0.0984 };
    const distance = haversineDistance(trafalgar, stPauls);
    expect(distance).toBeGreaterThan(1900);
    expect(distance).toBeLessThan(2500);
  });
});

describe('formatDistance', () => {
  test('sub-kilometre in metres', () => {
    expect(formatDistance(450)).toBe('450 m');
  });
  test('round kilometres in km with one decimal', () => {
    expect(formatDistance(2300)).toBe('2.3 km');
  });
  test('over 10km rounds to integer km', () => {
    expect(formatDistance(15_300)).toBe('15 km');
  });
});

describe('estimateTravelTimeSeconds', () => {
  test('walking speed is ~1.4 m/s', () => {
    expect(estimateTravelTimeSeconds(140, 'walking')).toBe(100);
  });
  test('driving speed is ~11.1 m/s', () => {
    expect(estimateTravelTimeSeconds(1110, 'driving')).toBeCloseTo(100, 0);
  });
});

describe('formatEta', () => {
  test('short durations in seconds', () => {
    expect(formatEta(45)).toBe('45 s');
  });
  test('mid durations in minutes', () => {
    expect(formatEta(180)).toBe('3 min');
  });
  test('long durations in h and m', () => {
    expect(formatEta(7_200)).toBe('2h 0m');
  });
});
