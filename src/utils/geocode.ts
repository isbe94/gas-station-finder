import { Coordinates } from '../types';

// Simulamos un servicio de geocoding más realista
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  // Simulamos una llamada a API con delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulamos algunas direcciones conocidas de España
  const mockAddresses: { [key: string]: Coordinates } = {
    'madrid': { lat: 40.4168, lng: -3.7038 },
    'barcelona': { lat: 41.3851, lng: 2.1734 },
    'valencia': { lat: 39.4699, lng: -0.3763 },
    'sevilla': { lat: 37.3891, lng: -5.9845 },
    'bilbao': { lat: 43.2627, lng: -2.9253 },
    'zaragoza': { lat: 41.6488, lng: -0.8891 },
    'málaga': { lat: 36.7213, lng: -4.4214 },
    'murcia': { lat: 37.9922, lng: -1.1307 },
    'palma': { lat: 39.5696, lng: 2.6502 },
    'las palmas': { lat: 28.1248, lng: -15.4300 },
    'alicante': { lat: 38.3452, lng: -0.4810 },
    'córdoba': { lat: 37.8882, lng: -4.7794 },
    'valladolid': { lat: 41.6523, lng: -4.7245 },
    'vigo': { lat: 42.2406, lng: -8.7207 },
    'gijón': { lat: 43.5322, lng: -5.6611 },
    'hospitalet': { lat: 41.3598, lng: 2.1074 },
    'coruña': { lat: 43.3623, lng: -8.4115 },
    'granada': { lat: 37.1773, lng: -3.5986 },
    'vitoria': { lat: 42.8467, lng: -2.6716 },
    'elche': { lat: 38.2622, lng: -0.7011 }
  };

  const normalizedAddress = address.toLowerCase().trim();
  
  // Buscar coincidencia en ciudades conocidas
  for (const [city, coords] of Object.entries(mockAddresses)) {
    if (normalizedAddress.includes(city)) {
      return coords;
    }
  }
  
  // Si no encuentra coincidencia, devolver coordenadas aleatorias en España
  return {
    lat: 40.4168 + (Math.random() - 0.5) * 8, // Rango más amplio para España
    lng: -3.7038 + (Math.random() - 0.5) * 12
  };
};

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
