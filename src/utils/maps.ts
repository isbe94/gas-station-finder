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

    // 4. Fallback de último recurso.
    // Si las coordenadas fallan, volvemos a la búsqueda de texto,
    // asumiendo el riesgo de ambigüedad.
    const searchQuery = `Gasolinera ${station["Rótulo"]}, ${station["Dirección"]}, ${station["Localidad"]}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
};


/**
 * Crea la URL de Google Maps más precisa posible combinando una categoría de negocio,
 * una búsqueda de texto y una pista geográfica (coordenadas).
 *
 * Este método le dice a Google: "Busca una 'Gasolinera' con este nombre y dirección,
 * y debería estar muy cerca de este punto geográfico", eliminando toda ambigüedad.
 *
 * @param station - El objeto completo de la estación de servicio.
 * @returns La URL de Google Maps más robusta posible para un único resultado.
 */
// export const createGoogleMapsUrl = (station: ApiGasStationWithDistance): string => {

//     const baseSearchQuery = [
//         "Gasolinera",
//         station["Rótulo"],
//         station["Dirección"],
//         station["C.P."],
//         station["Localidad"],
//         station["Provincia"]
//     ].filter(Boolean).join(', ');


//     const lat = parseFloat(station['Latitud'].replace(',', '.'));
//     const lng = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));

//     let finalSearchQuery: string;

//     if (!isNaN(lat) && !isNaN(lng)) {
//         finalSearchQuery = `${baseSearchQuery} @${lat},${lng}`;
//     } else {
//         // Fallback: Si no hay coordenadas, usa solo la búsqueda de texto base.
//         finalSearchQuery = baseSearchQuery;
//     }
//     // console.log("finalSearchQuery", finalSearchQuery)
//     return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalSearchQuery)}`;
// };