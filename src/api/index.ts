import axios from 'axios';
import {
  ApiGasStation,
  ApiPetroleumProduct,
  ApiProvince,
  Coordinates,
  SortByType
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

/**
 * Obtiene la lista completa de gasolineras y extrae una lista de nombres de
 * marcas (Rótulos) únicos y ordenados alfabéticamente.
 * @returns Una promesa que resuelve a un array de strings con los nombres de las marcas.
 */
export async function getBrandsFuel(): Promise<string[]> {
  try {
    const response = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/`
    );

    const allStations = response.data.ListaEESSPrecio;

    if (!allStations || allStations.length === 0) {
      return [];
    }

    // Mapea cada estación a su "Rótulo", pero solo si no es una marca genérica o vacía.
    const brandNames = new Set<string>();
    allStations.forEach(station => {
      const brand = station["Rótulo"]?.trim();
      // Filtra marcas genéricas o que no aportan valor
      if (brand && brand.length > 2 && !brand.toUpperCase().includes('GASOLINERA')) {
        brandNames.add(brand);
      }
    });

    // Convierte el Set a un array y ordena alfabéticamente.
    const sortedUniqueBrands = Array.from(brandNames).sort((a, b) => a.localeCompare(b));

    console.log(`Extracted ${sortedUniqueBrands.length} unique brand names.`);
    return sortedUniqueBrands;

  } catch (error) {
    console.error('Error fetching unique brand names:', error);
    throw new Error('Could not load the list of brands.');
  }
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


/**
 * Orquesta la búsqueda y el filtrado completo de gasolineras.
 * Esta función ahora se encarga de todo: determinar la provincia, llamar a la API,
 * filtrar por distancia, filtrar por marca y ordenar los resultados.
 *
 * @param productId - El ID del carburante.
 * @param userCoords - Las coordenadas del usuario.
 * @param selectedBrands - Un array (opcional) con las marcas a filtrar.
 * @param sortBy - El criterio (opcional) para ordenar la lista ('price' o 'distance').
 * @returns Una promesa que resuelve a un array de gasolineras ya filtrado y ordenado.
 */
export async function gasStationsProductsProvinces(
  productId: string,
  userCoords: Coordinates,
  selectedBrands: string[] = [],
  sortBy: SortByType = 'price',
  maxDistance: number = 30
): Promise<(ApiGasStation & { distance: number })[]> {

  if (!productId || !userCoords) {
    throw new Error('Se requiere un producto y las coordenadas del usuario.');
  }

  try {
    const allProvinces = await provincesList();
    const addressString = await reverseGeocode(userCoords.lat, userCoords.lng);
    const foundProvince = allProvinces.find(p =>
      addressString.toUpperCase().includes(p.Provincia.toUpperCase())
    );
    if (!foundProvince) {
      throw new Error("No se pudo determinar tu provincia desde tu ubicación.");
    }
    const provinceId = foundProvince.IDPovincia;

    const { data } = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
    );

    let processedStations = data.ListaEESSPrecio
      .map((e) => {
        const lat = parseFloat(e['Latitud'].replace(',', '.'));
        const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;
        const distance = haversineDistance(userCoords.lat, userCoords.lng, lat, lon);
        return { ...e, distance };
      })
      .filter((e): e is ApiGasStation & { distance: number } => e !== null)
      .filter((e) => e.distance <= maxDistance);

    if (selectedBrands.length > 0) {
      processedStations = processedStations.filter(station =>
        selectedBrands.some(brand =>
          station["Rótulo"].toLowerCase().includes(brand.toLowerCase())
        )
      );
    }

    if (sortBy === 'price') {
      processedStations.sort((a, b) =>
        (parseFloat(a.PrecioProducto.replace(',', '.')) || Infinity) -
        (parseFloat(b.PrecioProducto.replace(',', '.')) || Infinity)
      );
    } else if (sortBy === 'distance') {
      processedStations.sort((a, b) => a.distance - b.distance);
    }

    return processedStations;

  } catch (error) {
    console.error('ERROR en gasStationsProductsProvinces:', error);
    const errorMessage = error instanceof Error ? error.message : "Un error inesperado ocurrió en la API.";
    throw new Error(errorMessage);
  }
}