// src/api/index.ts
import axios from 'axios';
import { getCoordinatesFromAddress, haversineDistance } from '@/utils/geocode';
const GAS_STATIONS_API = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';
// Obtener lista de provincias
export async function provincesList() {
    try {
        const response = await axios.get(`${GAS_STATIONS_API}/Listados/Provincias/`);
        return response.data.sort((a, b) => a.Provincia.localeCompare(b.Provincia));
    }
    catch (error) {
        console.error('Error fetching provinces:', error);
        throw new Error('No se pudieron cargar las provincias.');
    }
}
// Obtener lista de municipios según provincia
export async function municipalitiesByProvince(provinceId) {
    if (!provinceId)
        return [];
    try {
        const response = await axios.get(`${GAS_STATIONS_API}/Listados/MunicipiosPorProvincia/${provinceId}`);
        return response.data.sort((a, b) => a.Municipio.localeCompare(b.Municipio));
    }
    catch (error) {
        console.error(`Error fetching municipalities for province ${provinceId}:`, error);
        throw new Error('No se pudieron cargar los municipios.');
    }
}
// Obtener lista de carburantes
export async function petroleumProducts() {
    try {
        const response = await axios.get(`${GAS_STATIONS_API}/Listados/ProductosPetroliferos/`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching petroleum products:', error);
        throw new Error('No se pudieron cargar los tipos de carburante.');
    }
}
const MAX_DISTANCE_KM = 30;
const MAX_RESULTS = 10;
export async function gasStationsProductsProvinces(provinceId, productId, userAddress) {
    if (!provinceId || !productId) {
        console.warn('No se recibió provincia o producto');
        return [];
    }
    try {
        console.log(`Buscando gasolineras para provincia ${provinceId}, producto ${productId}`);
        const { data } = await axios.get(`${GAS_STATIONS_API}/EstacionesTerrestres/FiltroProvinciaProducto/${provinceId}/${productId}`);
        // console.log(`Gasolineras recibidas: ${ JSON.stringify(data.ListaEESSPrecio)}`);
        let estaciones = data.ListaEESSPrecio.map((e) => ({
            ...e,
            distancia: 0,
        }));
        if (userAddress) {
            console.log(`Calculando distancias para la dirección: ${userAddress}`);
            const userCoords = await getCoordinatesFromAddress(userAddress);
            console.log('User coords:', userCoords);
            if (!userCoords || isNaN(userCoords.lat) || isNaN(userCoords.lng)) {
                throw new Error('No se pudo obtener la ubicación del usuario.');
            }
            estaciones = estaciones
                .filter(e => {
                const lat = parseFloat(e['Latitud'].replace(',', '.'));
                const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
                return !isNaN(lat) && !isNaN(lon);
            })
                .map((e) => {
                const lat = parseFloat(e['Latitud'].replace(',', '.'));
                const lon = parseFloat(e['Longitud (WGS84)'].replace(',', '.'));
                const distancia = haversineDistance(userCoords.lat, userCoords.lng, lat, lon);
                // console.log(`Distancia a estación ${e['Dirección']}: ${distancia} km`);
                return { ...e, distancia };
            })
                .filter((e) => e.distancia <= MAX_DISTANCE_KM);
            console.log(`Gasolineras dentro de ${MAX_DISTANCE_KM} km: ${estaciones.length}`);
            estaciones = estaciones
                .sort((a, b) => a.distancia - b.distancia)
                .slice(0, MAX_RESULTS);
        }
        estaciones.sort((a, b) => {
            const priceA = parseFloat(a.PrecioProducto.replace(',', '.')) || Infinity;
            const priceB = parseFloat(b.PrecioProducto.replace(',', '.')) || Infinity;
            return priceA - priceB;
        });
        console.log(`Gasolineras retornadas: ${estaciones.length}`);
        if (estaciones.length === 0) {
            throw new Error('No hay gasolineras que cumplan los criterios.');
        }
        return estaciones;
    }
    catch (error) {
        console.error('Error fetching gas stations:', error);
        throw error; // Propaga el error para que React lo capture y muestre mensaje
    }
}
