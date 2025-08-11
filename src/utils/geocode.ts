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

// utils/geocode.ts
export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalización no soportada"));
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(err)
    );
  });
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
  );

  if (!res.ok) {
    throw new Error("Error al obtener la dirección");
  }

  const data = await res.json();
  return data.display_name || "";
};


export async function getAddressFromCoords(lat: number, lng: number): Promise<{ address: string; postalCode: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "GasFinderApp/1.0 (your-email@example.com)", // Es buena práctica enviar un User-Agent
      },
    });

    if (!response.ok) {
      throw new Error("La respuesta de la red no fue correcta.");
    }

    const data = await response.json();

    if (data && data.address) {
      const { road, house_number, postcode, city, town, village } = data.address;
      // Construimos la dirección de la forma más completa posible
      const street = road || "";
      const number = house_number || "";
      const finalAddress = `${street}, ${number}`.replace(/^, |^,|, $/g, ''); // Limpia comas sobrantes

      return {
        address: finalAddress || data.display_name, // Si no hay calle, usa el nombre completo
        postalCode: postcode || "",
      };
    } else {
      throw new Error("No se pudo encontrar una dirección para estas coordenadas.");
    }
  } catch (error) {
    console.error("Error en la geocodificación inversa:", error);
    throw new Error("No se pudo convertir la ubicación a una dirección.");
  }
}