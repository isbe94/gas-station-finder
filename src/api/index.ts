// src/api/index.ts

import axios from 'axios';
import { ApiGasStation, ApiMunicipality, ApiPetroleumProduct, ApiProvince } from '@/types';

const GAS_STATIONS_API = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

// Interfaz para la respuesta de la API que contiene la lista de gasolineras
interface GasStationApiResponse {
  Fecha: string;
  ListaEESSPrecio: ApiGasStation[];
  Nota: string;
  ResultadoConsulta: string;
}

export async function provincesList(): Promise<ApiProvince[]> {
  try {
    const response = await axios.get<ApiProvince[]>(`${GAS_STATIONS_API}/Listados/Provincias/`);
    // Ordenar alfabéticamente por el nombre de la provincia
    return response.data.sort((a, b) => a.Provincia.localeCompare(b.Provincia));
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw new Error("No se pudieron cargar las provincias.");
  }
}

export async function municipalitiesByProvince(provinceId: string): Promise<ApiMunicipality[]> {
  if (!provinceId) return [];
  try {
    const response = await axios.get<ApiMunicipality[]>(`${GAS_STATIONS_API}/Listados/MunicipiosPorProvincia/${provinceId}`);
    // Ordenar alfabéticamente por el nombre del municipio
    return response.data.sort((a, b) => a.Municipio.localeCompare(b.Municipio));
  } catch (error) {
    console.error(`Error fetching municipalities for province ${provinceId}:`, error);
    throw new Error("No se pudieron cargar los municipios.");
  }
}

export async function petroleumProducts(): Promise<ApiPetroleumProduct[]> {
  try {
    const response = await axios.get<ApiPetroleumProduct[]>(`${GAS_STATIONS_API}/Listados/ProductosPetroliferos/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching petroleum products:", error);
    throw new Error("No se pudieron cargar los tipos de carburante.");
  }
}

export async function gasStationsProductsProvinces(provinceId: string, productId: string): Promise<ApiGasStation[]> {
  if (!provinceId || !productId) return [];
  try {
    const response = await axios.get<GasStationApiResponse>(
      `${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`
    );
    return response.data.ListaEESSPrecio;
  } catch (error) {
    console.error("Error fetching gas stations by province and product:", error);
    throw new Error("No se pudieron encontrar gasolineras con los filtros seleccionados.");
  }
}