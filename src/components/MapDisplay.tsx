import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { ApiGasStationWithDistance, Coordinates } from '@/types';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { createGoogleMapsUrl } from '@/utils/maps';

// Icono azul para ubicación
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Maneja clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapController({ center, station }: { center: [number, number], station: ApiGasStationWithDistance | null }) {
  const map = useMap();

  useEffect(() => {
    // Se obtiene el centro actual del mapa y su nivel de zoom
    const mapCenter = map.getCenter();
    const mapZoom = map.getZoom();

    // Lógica para volar a la estación seleccionada
    if (station) {
      const lat = parseFloat(station['Latitud'].replace(',', '.'));
      const lon = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));

      if (!isNaN(lat) && !isNaN(lon)) {
        // Se mueve si la estación no es ya el centro del mapa
        if (mapCenter.lat !== lat || mapCenter.lng !== lon) {
          map.flyTo([lat, lon], 15, { duration: 1.0 });
        }

        const popupContent = `<b>${station['Rótulo']}</b><br/>${station['Dirección']}<br/>Horario: ${station.Horario}`;
        L.popup({ offset: [0, -25] })
          .setLatLng([lat, lon])
          .setContent(popupContent)
          .openOn(map);
      }
    }
    // Lógica para centrarse en la ubicación de búsqueda
    else {
      const targetCoords = L.latLng(center[0], center[1]);

      // Compara si el destino (centro de búsqueda) es prácticamente el mismo que el centro actual del mapa.
      // Usa una pequeña tolerancia (0.0001) porque las coordenadas de punto flotante pueden no ser exactas.
      const isAlreadyCentered = mapCenter.distanceTo(targetCoords) < 1; // 1 metro de tolerancia

      // Si el mapa NO está ya centrado en la ubicación de búsqueda, se mueve.
      if (!isAlreadyCentered || mapZoom !== 13) {
        map.flyTo(center, 13);
      }
    }
  }, [center, station, map]);

  return null;
}

interface MapDisplayProps {
  stations: ApiGasStationWithDistance[];
  center: Coordinates;
  zoom?: number;
  selectedStationId: string | null;
  hoveredStationId: string | null;

  onMapClick: (coords: Coordinates) => void;
  onMarkerHover: (stationId: string | null) => void;
  onStationClick: (stationId: string) => void;
}

export function MapDisplay({
  stations,
  center,
  zoom = 13,
  selectedStationId,
  hoveredStationId,
  onMapClick,
  onMarkerHover,
  onStationClick
}: MapDisplayProps) {

  const mapCenter: [number, number] = useMemo(
    () => [center.lat, center.lng],
    [center.lat, center.lng]
  );

  const hoveredStation = hoveredStationId
    ? stations.find(s => s.IDEESS === hoveredStationId) ?? null
    : null;

  const selectedStation = selectedStationId
    ? stations.find(s => s.IDEESS === selectedStationId) ?? null
    : null;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '100%', minHeight: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController center={mapCenter} station={selectedStation} />

      <Marker position={mapCenter} icon={userLocationIcon}>
        <Popup>Ubicación de búsqueda</Popup>
      </Marker>

      {stations.map(station => {
        const lat = parseFloat(station['Latitud'].replace(',', '.'));
        const lon = parseFloat(station['Longitud (WGS84)'].replace(',', '.'));
        if (isNaN(lat) || isNaN(lon)) return null;

        const mapsUrl = createGoogleMapsUrl(station);
        const price = parseFloat(station.PrecioProducto.replace(',', '.')).toFixed(3);

        const priceIcon = new L.DivIcon({
          html: `<div>${price}€</div>`,
          className: 'price-marker',
          iconSize: [60, 30],
          iconAnchor: [30, 40]
        });

        return (
          <Marker
            key={station.IDEESS}
            position={[lat, lon]}
            icon={priceIcon}
            eventHandlers={{
              mouseover: () => { onMarkerHover(station.IDEESS) },
              mouseout: () => { onMarkerHover(null) },
              click: () => {
                onStationClick(station.IDEESS);
                window.open(mapsUrl, '_blank', 'noopener,noreferrer');
              },
            }}
          />
        );
      })}

      {hoveredStation && (
        <Popup
          position={[
            parseFloat(hoveredStation['Latitud'].replace(',', '.')),
            parseFloat(hoveredStation['Longitud (WGS84)'].replace(',', '.'))
          ]}
          offset={[0, -25]}
          // Desactiva el auto-paneo. Esto es CRUCIAL para evitar que el mapa se mueva y cause el temblor.
          autoPan={false}
        >
          <a
            href={createGoogleMapsUrl(hoveredStation)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#333', textDecoration: 'none' }}
          >
            <b>{hoveredStation['Rótulo']}</b><br />
            {hoveredStation['Dirección']}<br />
            Horario: <span>{hoveredStation.Horario}</span>
          </a>
        </Popup>
      )}

      <MapClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}
