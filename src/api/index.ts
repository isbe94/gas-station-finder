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

    const allowedProductIds = [ '1', '23', '24', '25',  '20', '3',  '21', '4', '5', '26',
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
    // --- PASO 1 y 2: Determinar provincia y llamar a la API (sin cambios) ---
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

    console.log(`Paso 3: Llamando a la API para provincia ${provinceId} y producto ${productId}`);
    const { data } = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
    );
    console.log("Paso 3.1: Datos recibidos de la API.");

    // --- PASO 3: Filtrar por distancia ---
    console.log(`Paso 4: Filtrando ${data.ListaEESSPrecio.length} estaciones por un radio de ${MAX_DISTANCE_KM} km...`);
    let estacionesCercanas = data.ListaEESSPrecio
      .map((e) => {
        const lat = parseFloat(e['Latitud'].replace(',', '.'));
        const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;
        const distancia = haversineDistance(userCoords.lat, userCoords.lng, lat, lon);
        return { ...e, distancia };
      })
      .filter((e): e is ApiGasStation & { distancia: number } => e !== null)
      .filter((e) => e.distancia <= MAX_DISTANCE_KM);

    console.log(`Paso 4.1: Se encontraron ${estacionesCercanas.length} estaciones dentro del radio.`);

    // --- PASO 4: ORDENAR LAS ESTACIONES CERCANAS POR PRECIO (DE MENOR A MAYOR) ---
    // Este es el bloque que ha cambiado.
    console.log("Paso 5: Ordenando las estaciones cercanas por precio...");
    estacionesCercanas.sort((a, b) => {
      // Convierte el precio (string con coma) a un número flotante.
      // Usa Infinity como fallback si el precio no es válido, para que se vaya al final.
      const priceA = parseFloat(a.PrecioProducto.replace(',', '.')) || Infinity;
      const priceB = parseFloat(b.PrecioProducto.replace(',', '.')) || Infinity;

      return priceA - priceB;
    });

    // --- PASO 5: Devolver el número máximo de resultados ---
    console.log(`Paso 6: Proceso completado. Devolviendo las ${Math.min(estacionesCercanas.length, MAX_RESULTS)} estaciones más baratas y cercanas.`);
    return estacionesCercanas.slice(0, MAX_RESULTS);

  } catch (error) {
    console.error('ERROR en gasStationsProductsProvinces:', error);
    const errorMessage = error instanceof Error ? error.message : "Un error inesperado ocurrió en la API.";
    throw new Error(errorMessage);
  }
}