import type { ApiGasStationWithDistance } from "@/types";

/**
 * Crea una URL de Google Maps para una estación de servicio específica.
 * Da prioridad al uso de coordenadas para la máxima precisión en móviles.
 * Si las coordenadas no son válidas, utiliza la dirección como fallback.
 * @param station - El objeto completo de la estación de servicio.
 * @returns Una URL de Google Maps como string.
 */
export const createGoogleMapsUrl = (station: ApiGasStationWithDistance): string => {
    // Intenta obtener las coordenadas numéricas desde el objeto station.
    const lat = parseFloat(station['Latitud'].replace(',', '.'));
    const lng = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));

    // Si existen coordenadas válidas, se buscan.
    if (!isNaN(lat) && !isNaN(lng)) {
        // La URL 'query=lat,lng' abre un pin exacto en el mapa.
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }

    // (FALLBACK): Si no hay coordenadas, usa la dirección de texto.
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${station["Dirección"]}, ${station["C.P."]} ${station.Localidad} (${station.Provincia})`
    )}`;
};