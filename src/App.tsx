import { useState } from 'react'
import { Card, CardHeader, CardContent, Typography } from '@mui/material'
import { Fuel, Filter } from 'lucide-react';
import { SearchSelector } from '@/components/SearchSelector';
import { GasStationList } from '@/components/GasStationList';
import { useGasStations } from '@/hooks/useGasStations';
import { Coordinates, FuelType } from '@/types';

import './App.css'

function App() {

  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [fullAddress, setFullAddress] = useState<string>('');
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { gasStations, loading } = useGasStations(userCoords, selectedFuel, fullAddress);

  const handleSearch = (coords: Coordinates | null, address: string, fuelType: FuelType | null) => {
    setUserCoords(coords);
    setFullAddress(address);
    setSelectedFuel(fuelType);
    setHasSearched(true);
  };

  const showResults = hasSearched && userCoords && selectedFuel;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Fuel className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              GasFinder
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra las gasolineras más baratas cerca de ti. Compara precios y ahorra en cada repostaje.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <Typography className="text-2xl text-center flex items-center justify-center gap-2">
              <Filter className="h-6 w-6" />
              Buscar Gasolineras
            </Typography >
          </CardHeader>
          <CardContent>
            <SearchSelector
              onSearch={handleSearch}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <GasStationList
              stations={gasStations}
              fuelType={selectedFuel}
              loading={loading}
            />
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⛽</div>
            <h3 className="text-2xl font-semibold mb-2">¡Encuentra tu gasolinera ideal!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Completa los campos de arriba y haz clic en "Buscar Gasolineras" para encontrar las mejores ofertas cerca de ti.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© 2025 GasFinder. Encuentra las mejores ofertas de combustible en España.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
