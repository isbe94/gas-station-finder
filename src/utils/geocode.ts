import axios from "axios";
import { getDistance } from "geolib"; 

// Función para calcular distancia usando Haversine
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // getDistance devuelve metros, convertimos a km
  const distanceMeters = getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 }
  );
  return distanceMeters / 1000;
}

// Función para geocodificar una dirección a coordenadas
export async function getCoordinatesFromAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const { data } = await axios.get(url);
  if (data.length === 0) throw new Error("No se encontraron coordenadas para la dirección.");
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}