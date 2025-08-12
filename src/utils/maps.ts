import type { ApiGasStationWithDistance } from "@/types";
/**
 * Crea la URL de Google Maps más robusta y precisa posible para iniciar la
 * navegación directamente.
 *
 * Utiliza el esquema de URL de "directions" (cómo llegar), que es una orden
 * directa y no una búsqueda. Esto garantiza que NUNCA se mostrará una lista
 * de resultados, solucionando el problema de la ambigüedad de una vez por todas.
 *
 * @param station - El objeto completo de la estación de servicio.
 * @returns Una URL de Google Maps inequívoca, que abre la vista de navegación.
 */
export const createGoogleMapsUrl = (station: ApiGasStationWithDistance): string => {
    const lat = parseFloat(station['Latitud'].replace(',', '.'));
    const lng = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));

    if (!isNaN(lat) && !isNaN(lng)) {
        // El parámetro `destination=lat,lng` es una orden directa.
        // El `api=1` asegura que se intente abrir la app de Google Maps en móviles.
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    // Si las coordenadas fallan, ejecuta búsqueda por texto,
    // asumiendo el riesgo de ambigüedad.
    const searchQuery = `Gasolinera ${station["Rótulo"]}, ${station["Dirección"]}, ${station["Localidad"]}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
};