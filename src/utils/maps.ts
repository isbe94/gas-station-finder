import type { ApiGasStationWithDistance } from "@/types";

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
export const createGoogleMapsUrl = (station: ApiGasStationWithDistance): string => {

    const baseSearchQuery = [
        "Gasolinera",
        station["Rótulo"],
        station["Dirección"],
        station["C.P."],
        station["Localidad"],
        station["Provincia"]
    ].filter(Boolean).join(', ');


    const lat = parseFloat(station['Latitud'].replace(',', '.'));
    const lng = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));

    let finalSearchQuery: string;

    if (!isNaN(lat) && !isNaN(lng)) {
        finalSearchQuery = `${baseSearchQuery} @${lat},${lng}`;
    } else {
        // Fallback: Si no hay coordenadas, usa solo la búsqueda de texto base.
        finalSearchQuery = baseSearchQuery;
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalSearchQuery)}`;
};