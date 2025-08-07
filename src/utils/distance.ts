import { getDistance } from 'geolib';

export function calculateDistance(
  from: {latitude: number; longitude: number},
  to: {latitude: number; longitude: number}
): number {
  const meters = getDistance(from, to);
  return meters / 1000; // km
}
