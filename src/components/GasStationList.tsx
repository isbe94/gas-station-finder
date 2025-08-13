import { ApiGasStation } from '@/types';
import { GasStationCard, GasStationCardSkeleton } from './GasStationCard';

interface ApiGasStationWithDistance extends ApiGasStation {
  distance: number;
}

interface GasStationListProps {
  stations: ApiGasStationWithDistance[];
  isLoading: boolean;
  onStationHover: (id: string | null) => void; // para funciones de hover del mapa
}

export function GasStationList({ stations, isLoading, onStationHover }: GasStationListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <GasStationCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700">No hay resultados que mostrar</h3>
        <p className="text-gray-500 mt-2">Realiza una búsqueda para encontrar gasolineras.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station) => (
          <GasStationCard
            key={station.IDEESS}
            station={station}
            onMouseEnter={() => onStationHover(station.IDEESS)}
            onMouseLeave={() => onStationHover(null)}
          />
        ))}
      </div>
    </div>
  );
}