// src/components/search-form.tsx

import { useState, useEffect } from 'react';
import {
  ApiGasStation,
  ApiMunicipality,
  ApiPetroleumProduct,
  ApiProvince,
} from '@/types';
import {
  provincesList,
  municipalitiesByProvince,
  petroleumProducts,
  gasStationsProductsProvinces,
} from '@/api';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GasStationList } from './gas-station-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function SearchForm() {
  // Estados para los datos de los selectores
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [municipalities, setMunicipalities] = useState<ApiMunicipality[]>([]);
  const [products, setProducts] = useState<ApiPetroleumProduct[]>([]);

  // Estados para los valores seleccionados
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Estado para los resultados de la búsqueda
  const [foundStations, setFoundStations] = useState<ApiGasStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ApiGasStation[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de provincias y productos
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [provincesData, productsData] = await Promise.all([
          provincesList(),
          petroleumProducts(),
        ]);
        setProvinces(provincesData);
        setProducts(productsData);
      } catch (err) {
        setError('Error al cargar datos iniciales. Inténtalo de nuevo más tarde.');
      }
    };
    loadInitialData();
  }, []);

  // Carga de municipios cuando cambia la provincia seleccionada
  useEffect(() => {
    // Reseteamos siempre el municipio al cambiar de provincia
    setMunicipalities([]);
    setSelectedMunicipality('');

    if (selectedProvince) {
      const loadMunicipalities = async () => {
        try {
          const municipalitiesData = await municipalitiesByProvince(selectedProvince);
          setMunicipalities(municipalitiesData);
        } catch (err) {
          setError('No se pudieron cargar los municipios para la provincia seleccionada.');
        }
      };
      loadMunicipalities();
    }
  }, [selectedProvince]);
  
  // Filtra las estaciones cuando el municipio seleccionado cambia
  useEffect(() => {
    // Si se selecciona un municipio específico (y no es 'todos')
    if (selectedMunicipality && selectedMunicipality !== 'all') {
      const filtered = foundStations.filter(station => station.IDMunicipio === selectedMunicipality);
      setFilteredStations(filtered);
    } else {
      // Si no hay municipio seleccionado o se selecciona "Todos", muestra todas las encontradas
      setFilteredStations(foundStations);
    }
  }, [selectedMunicipality, foundStations]);


  const handleSearch = async () => {
    if (!selectedProvince || !selectedProduct) {
      setError('Por favor, selecciona una provincia y un tipo de carburante.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setFoundStations([]);
    setFilteredStations([]);
    // Reseteamos el municipio para que la nueva búsqueda no esté pre-filtrada
    setSelectedMunicipality('');

    try {
      const stationsData = await gasStationsProductsProvinces(selectedProvince, selectedProduct);
      if (stationsData.length === 0) {
        setError('No se encontraron gasolineras con los criterios seleccionados.');
      } else {
        const sortedStations = stationsData.sort((a, b) => {
            const priceA = parseFloat(a.PrecioProducto.replace(',', '.'));
            const priceB = parseFloat(b.PrecioProducto.replace(',', '.'));
            return priceA - priceB;
        });
        setFoundStations(sortedStations);
        setFilteredStations(sortedStations);
      }
    } catch (err) {
      setError('Ocurrió un error durante la búsqueda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
          <Input id="address" placeholder="Ej: Calle Mayor, 10, Madrid" disabled />
          <p className="text-xs text-gray-500 mt-1">La búsqueda por dirección no está implementada. Utiliza los filtros.</p>
        </div>
        
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger id="province"><SelectValue placeholder="Selecciona provincia" /></SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.IDPovincia} value={p.IDPovincia}>
                  {p.Provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
          <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality} disabled={!selectedProvince || municipalities.length === 0}>
            <SelectTrigger id="municipality"><SelectValue placeholder="Todos los municipios" /></SelectTrigger>
            <SelectContent>
              {/* CAMBIO 1: El valor ya no es una cadena vacía */}
              <SelectItem value="all">Todos los municipios</SelectItem>
              {municipalities.map((m) => (
                <SelectItem key={m.IDMunicipio} value={m.IDMunicipio}>
                  {m.Municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
           <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Carburante *</label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger id="product"><SelectValue placeholder="Selecciona carburante" /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.IDProducto} value={p.IDProducto}>
                  {p.NombreProducto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} disabled={isLoading || !selectedProvince || !selectedProduct} className="w-full">
          {isLoading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GasStationList stations={filteredStations} isLoading={isLoading} />
    </div>
  );
}