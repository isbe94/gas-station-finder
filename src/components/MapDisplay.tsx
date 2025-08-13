import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { ApiGasStationWithDistance, Coordinates } from '@/types';
import { useEffect, useRef } from 'react';
import L, { Marker as LeafletMarker } from 'leaflet';
import { createGoogleMapsUrl } from '@/utils/maps';

// Icono por defecto de Leaflet
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icono verde para la UBICACIÓN DEL USUARIO
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Pequeño componente para recentrar el mapa cuando las coordenadas cambian
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

interface MapDisplayProps {
  stations: ApiGasStationWithDistance[];
  center: Coordinates;
  zoom?: number;
  hoveredStationId: string | null;
}

function MapMarkersLogic({ stations, hoveredStationId }: { stations: ApiGasStationWithDistance[], hoveredStationId: string | null }) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: LeafletMarker }>({});

  useEffect(() => {
    map.closePopup();
    if (hoveredStationId) {
      const markerRef = markerRefs.current[hoveredStationId];
      if (markerRef) {
        markerRef.openPopup();
        map.panTo(markerRef.getLatLng());
      }
    }
    // else {
    //   // Si no hay ninguna estación con hover, cerramos cualquier popup que esté abierto.
    //   map.closePopup();
    // }
  }, [hoveredStationId, map]);

  return (
    <>
      {/* .map() para las gasolineras */}
      {stations.map(station => {
        const lat = parseFloat(station['Latitud'].replace(',', '.'));
        const lon = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;

        const mapsUrl = createGoogleMapsUrl(station);

        return (
          <Marker
            key={station.IDEESS}
            position={[lat, lon]}
            icon={defaultIcon}
            ref={(ref) => { if (ref) markerRefs.current[station.IDEESS] = ref; }}
            eventHandlers={{
              mouseover: (event) => event.target.openPopup(),
              mouseout: (event) => event.target.closePopup(),
            }}
          >
            <Popup>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#333', textDecoration: 'none' }}>
                <b>{station['Rótulo']}</b><br />
                {station['Dirección']}<br />
                Precio: {station.PrecioProducto} €/L
              </a>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function MapDisplay({ stations, center, zoom = 13, hoveredStationId }: MapDisplayProps) {
  const mapCenter: [number, number] = [center.lat, center.lng];

  return (
    <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeMapView coords={mapCenter} />

      {/* Marcador de la ubicación del usuario */}
      <Marker position={mapCenter} icon={userLocationIcon}>
        <Popup>Ubicación de búsqueda</Popup>
      </Marker>

      {/* 
        * El componente de lógica ahora es un "hermano" de los otros componentes del mapa.
        * El .map() duplicado ha sido eliminado de aquí.
      */}
      <MapMarkersLogic stations={stations} hoveredStationId={hoveredStationId} />
    </MapContainer>
  );
}