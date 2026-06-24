import { haversineDistanceMeters } from './geo.util';

describe('haversineDistanceMeters', () => {
  it('returns 0 for identical points', () => {
    const point = { latitude: 24.7136, longitude: 46.6753 };
    expect(haversineDistanceMeters(point, point)).toBe(0);
  });

  it('computes a known distance within 1% tolerance', () => {
    const riyadh = { latitude: 24.7136, longitude: 46.6753 };
    const jeddah = { latitude: 21.4858, longitude: 39.1925 };
    const distance = haversineDistanceMeters(riyadh, jeddah);
    // Actual distance ~849 km
    expect(distance / 1000).toBeGreaterThan(840);
    expect(distance / 1000).toBeLessThan(860);
  });
});
