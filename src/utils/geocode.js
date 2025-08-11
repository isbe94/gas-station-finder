import axios from "axios";
// Función para calcular distancia usando Haversine
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
// Función para geocodificar una dirección a coordenadas
export async function getCoordinatesFromAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const { data } = await axios.get(url);
    if (data.length === 0)
        throw new Error("No se encontraron coordenadas para la dirección.");
    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
    };
}
