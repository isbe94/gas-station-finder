import axios from 'axios';
import {
  ApiGasStation,
  ApiPetroleumProduct,
  ApiProvince,
  Coordinates
} from '@/types';
import { reverseGeocode, haversineDistance } from '@/utils/geocode';

const GAS_STATIONS_API =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

interface GasStationApiResponse {
  Fecha: string;
  ListaEESSPrecio: ApiGasStation[];
  Nota: string;
  ResultadoConsulta: string;
}


export async function provincesList(): Promise<ApiProvince[]> {
  try {
    const response = await axios.get<ApiProvince[]>(
      `${GAS_STATIONS_API}/Listados/Provincias/`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('No se pudieron cargar las provincias.');
  }
}


export async function petroleumProducts(): Promise<ApiPetroleumProduct[]> {
  try {
    const response = await axios.get<ApiPetroleumProduct[]>(
      `${GAS_STATIONS_API}/Listados/ProductosPetroliferos/`
    );

    const allowedProductIds = ['1', '23', '24', '25', '20', '3', '21', '4', '5', '26',
    ];

    const allProducts = response.data;

    // Filter the product list to only include the ones with allowed IDs.
    const filteredProducts = allProducts.filter(product =>
      allowedProductIds.includes(product.IDProducto)
    );

    return filteredProducts;

  } catch (error) {
    console.error('Error fetching petroleum products:', error);
    throw new Error('Could not load the fuel types.');
  }
}



const MAX_DISTANCE_KM = 30;
/**
 * Orquesta la búsqueda de gasolineras.
 * Devuelve TODAS las estaciones encontradas dentro del radio para que el frontend las gestione.
 * @param productId - El ID del carburante.
 * @param userCoords - Las coordenadas del usuario.
 * @returns Una lista de TODAS las gasolineras cercanas, ordenadas por distancia por defecto.
 */
export async function gasStationsProductsProvinces(
  productId: string,
  userCoords: Coordinates
): Promise<(ApiGasStation & { distance: number })[]> {

  // console.log('Iniciando búsqueda en la API con productId:', productId);

  if (!productId || !userCoords) {
    throw new Error('Se requiere un producto y las coordenadas del usuario.');
  }

  try {
    // --- PASO 1: Determinar provincia (sin cambios) ---
    // console.log("Paso 1: Obteniendo lista de provincias...");
    const allProvinces = await provincesList();
    const addressString = await reverseGeocode(userCoords.lat, userCoords.lng);
    const foundProvince = allProvinces.find(p =>
      addressString.toUpperCase().includes(p.Provincia.toUpperCase())
    );
    if (!foundProvince) throw new Error("No se pudo determinar tu provincia.");
    const provinceId = foundProvince.IDPovincia;
    // console.log(`Paso 2: Provincia detectada: ${foundProvince.Provincia} (ID: ${provinceId})`);

    // --- PASO 2: Llamar a la API (sin cambios) ---
    // console.log(`Paso 3: Llamando a la API para provincia ${provinceId} y producto ${productId}`);
    const { data } = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
    );
    // console.log("Paso 3.1: Datos recibidos.");

    // --- PASO 3: Filtrar por distancia ---
    // console.log(`Paso 4: Filtrando ${data.ListaEESSPrecio.length} estaciones por radio de ${MAX_DISTANCE_KM} km...`);
    const nearbyStations = data.ListaEESSPrecio
      .map((e) => {
        const lat = parseFloat(e['Latitud'].replace(',', '.'));
        const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;
        const distance = haversineDistance(userCoords.lat, userCoords.lng, lat, lon);
        return { ...e, distance };
      })
      .filter((e): e is ApiGasStation & { distance: number } => e !== null)
      .filter((e) => e.distance <= MAX_DISTANCE_KM);

    // --- PASO 4: Devolver la lista COMPLETA de estaciones cercanas ---
    // Se elimina el ordenamiento por precio y el .slice() de aquí.
    // console.log(`Paso 5: Proceso completado. Devolviendo ${nearbyStations.length} estaciones cercanas.`);
    return nearbyStations;

  } catch (error) {
    console.error('ERROR en gasStationsProductsProvinces:', error);
    const errorMessage = error instanceof Error ? error.message : "Un error inesperado ocurrió en la API.";
    throw new Error(errorMessage);
  }
}