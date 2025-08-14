import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { ApiGasStationWithDistance, Coordinates } from '@/types';
import { useEffect } from 'react';
import L from 'leaflet';
import { createGoogleMapsUrl } from '@/utils/maps';

// Icono verde para ubicación
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Recentra el mapa cuando cambian las coordenadas
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 13);
  }, [coords, map]);
  return null;
}

// Maneja clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Mueve el mapa y abrir popup de la estación seleccionada
function FlyToSelectedStation({ selectedStation }: { selectedStation: ApiGasStationWithDistance | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStation) {
      const lat = parseFloat(selectedStation['Latitud'].replace(',', '.'));
      const lon = parseFloat(selectedStation['Longitud (WGS84)'].replace(',', '.'));

      if (!isNaN(lat) && !isNaN(lon)) {
        map.flyTo([lat, lon], 15, { duration: 1.0 });

        const marker = L.marker([lat, lon])
          .bindPopup(`
            <b>${selectedStation['Rótulo']}</b><br/>
            ${selectedStation['Dirección']}<br/>
            Horario: ${selectedStation.Horario}
          `);
        marker.openPopup();
      }
    }
  }, [selectedStation, map]);

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
  const mapCenter: [number, number] = [center.lat, center.lng];

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

      <ChangeMapView coords={mapCenter} />
      <FlyToSelectedStation selectedStation={selectedStation} />

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
