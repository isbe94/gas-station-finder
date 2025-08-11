// src/api/index.ts

import axios from 'axios';
import {
  ApiGasStation,
  ApiPetroleumProduct,
  ApiProvince,
} from '@/types';
// Asegúrate de que la ruta a tus utilidades de geocodificación es correcta
import { reverseGeocode, haversineDistance } from '@/utils/geocode';

const GAS_STATIONS_API =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

// Interfaz para la respuesta de la API (sin cambios)
interface GasStationApiResponse {
  Fecha: string;
  ListaEESSPrecio: ApiGasStation[];
  Nota: string;
  ResultadoConsulta: string;
}

// --- FUNCIONES AUXILIARES DE LISTADO (SIN CAMBIOS) ---

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
    return response.data;
  } catch (error) {
    console.error('Error fetching petroleum products:', error);
    throw new Error('No se pudieron cargar los tipos de carburante.');
  }
}


// --- FUNCIÓN DE BÚSQUEDA PRINCIPAL Y ÚNICA ---
// Esta función REEMPLAZA tu antigua gasStationsProductsProvinces.

const MAX_DISTANCE_KM = 30;
const MAX_RESULTS = 10;
type Coordinates = { lat: number; lng: number };

/**
 * Orquesta la búsqueda de gasolineras de principio a fin.
 * El frontend solo necesita proporcionar el producto y las coordenadas.
 * @param productId - El ID del carburante.
 * @param userCoords - Las coordenadas del usuario.
 * @returns Una lista de gasolineras filtrada y ordenada.
 */
export async function gasStationsProductsProvinces(
  productId: string,
  userCoords: Coordinates
): Promise<(ApiGasStation & { distancia: number })[]> {
  
  console.log('Iniciando búsqueda en la API con productId:', productId);
  
  if (!productId || !userCoords) {
    throw new Error('Se requiere un producto y las coordenadas del usuario.');
  }

  try {
    // --- PASO 1: Determinar la provincia a partir de las coordenadas ---
    console.log("Paso 1: Obteniendo lista de provincias...");
    const allProvinces = await provincesList();
    console.log("Paso 1.1: Obteniendo dirección desde coordenadas...");
    const addressString = await reverseGeocode(userCoords.lat, userCoords.lng);
    console.log("Paso 1.2: Dirección obtenida:", addressString);

    const foundProvince = allProvinces.find(p => 
        addressString.toUpperCase().includes(p.Provincia.toUpperCase())
    );

    if (!foundProvince) {
      throw new Error("No se pudo determinar tu provincia desde tu ubicación.");
    }
    const provinceId = foundProvince.IDPovincia;
    console.log(`Paso 2: Provincia detectada: ${foundProvince.Provincia} (ID: ${provinceId})`);

    // --- PASO 2: Llamar a la API del gobierno con los datos correctos ---
    console.log(`Paso 3: Llamando a la API para provincia ${provinceId} y producto ${productId}`);
    const { data } = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
    );
    console.log("Paso 3.1: Datos recibidos de la API.");

    // --- PASO 3: Filtrar y ordenar los resultados ---
    console.log(`Paso 4: Filtrando y ordenando ${data.ListaEESSPrecio.length} estaciones...`);
    let estaciones = data.ListaEESSPrecio
      .map((e) => {
        const lat = parseFloat(e['Latitud'].replace(',', '.'));
        const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;
        const distancia = haversineDistance(userCoords.lat, userCoords.lng, lat, lon);
        return { ...e, distancia };
      })
      .filter((e): e is ApiGasStation & { distancia: number } => e !== null)
      .filter((e) => e.distancia <= MAX_DISTANCE_KM);
    
    estaciones.sort((a, b) => a.distancia - b.distancia);

    console.log(`Paso 5: Proceso completado. Devolviendo ${estaciones.slice(0, MAX_RESULTS).length} estaciones.`);
    return estaciones.slice(0, MAX_RESULTS);

  } catch (error) {
    console.error('ERROR en gasStationsProductsProvinces:', error);
    const errorMessage = error instanceof Error ? error.message : "Un error inesperado ocurrió en la API.";
    throw new Error(errorMessage);
  }
}