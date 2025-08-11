import { getDistance } from 'geolib';
export function calculateDistance(from, to) {
    const meters = getDistance(from, to);
    return meters / 1000; // km
}
