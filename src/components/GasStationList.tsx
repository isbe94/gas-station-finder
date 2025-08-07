"use client";
import { Card, CardContent, Badge } from '@mui/material'
import { GasStation, FuelType } from '@/types';
import { MapPin, Star, Clock, Euro, Calendar } from 'lucide-react';

interface GasStationListProps {
  stations: GasStation[];
  fuelType: FuelType | null;
  loading: boolean;
}

export const GasStationList = ({ stations, fuelType, loading }: GasStationListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-lg">Buscando gasolineras en un radio de 30km...</span>
        </div>
        {/* Skeleton cards */}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          No se encontraron gasolineras en un radio de 30km
        </div>
        <p className="text-sm text-muted-foreground">
          Intenta con una dirección diferente o selecciona otro tipo de combustible
        </p>
      </div>
    );
  }

  const getFuelLabel = (fuel: FuelType) => {
    const labels = {
      gasolina95: 'Gasolina 95 E5',
      gasolina98: 'Gasolina 98 E5',
      diesel: 'Gasóleo A',
      dieselPremium: 'Gasóleo Premium'
    };
    return labels[fuel];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Gasolineras Encontradas ({stations.length})
        </h2>
        <div className="flex gap-2">
          {fuelType && (
            <Badge className="text-sm px-3 py-1">
              {getFuelLabel(fuelType)}
            </Badge>
          )}
          <Badge className="text-sm px-3 py-1">
            Radio: 30km
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-4">
        {stations.map((station, index) => (
          <Card key={station.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        {station.name}
                        {index === 0 && (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Más Barata
                          </Badge>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{station.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({Math.floor(Math.random() * 200) + 50} reseñas)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {station.isOpen ? (
                        <Badge className="text-green-600 border-green-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Abierto
                        </Badge>
                      ) : (
                        <Badge className="text-red-600 border-red-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Cerrado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{station.address}</span>
                      <span className="text-sm">• {station.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{station.schedule}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {fuelType && station.prices[fuelType] && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary flex items-center">
                        {station.prices[fuelType].toFixed(3)}
                        <Euro className="h-5 w-5 ml-1" />
                      </div>
                      <div className="text-sm text-muted-foreground">por litro</div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 text-xs">
                    {station.prices.gasolina95 && (
                      <div className="text-center">
                        <div className="font-medium">⛽ {station.prices.gasolina95.toFixed(3)}€</div>
                        <div className="text-muted-foreground">95 E5</div>
                      </div>
                    )}
                    {station.prices.diesel && (
                      <div className="text-center">
                        <div className="font-medium">🚛 {station.prices.diesel.toFixed(3)}€</div>
                        <div className="text-muted-foreground">Gasóleo A</div>
                      </div>
                    )}
                    {station.prices.gasolina98 && (
                      <div className="text-center">
                        <div className="font-medium">🏎️ {station.prices.gasolina98.toFixed(3)}€</div>
                        <div className="text-muted-foreground">98 E5</div>
                      </div>
                    )}
                    {station.prices.dieselPremium && (
                      <div className="text-center">
                        <div className="font-medium">🚚 {station.prices.dieselPremium.toFixed(3)}€</div>
                        <div className="text-muted-foreground">G. Premium</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
