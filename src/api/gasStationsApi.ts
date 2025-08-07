import axios from 'axios';

const GAS_STATIONS_API = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

export async function gasStations() {
  const response = await axios.get(`${GAS_STATIONS_API}/EstacionesTerrestres`);
  return response.data.ListaEESSPrecio;
}

export async function municipalitiesList() {
  const response = await axios.get(`${GAS_STATIONS_API}/Listados/Municipios/`);
  return response.data;
} 

export async function provincesList() {
  const response = await axios.get(`${GAS_STATIONS_API}/Listados/Provincias/`);
  return response.data;
}

export async function petroleumProducts() {
  const response = await axios.get(`${GAS_STATIONS_API}/Listados/ProductosPetroliferos/`);
  return response.data;
}

