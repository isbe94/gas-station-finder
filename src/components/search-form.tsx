import { useState, useEffect, useMemo } from "react"
import { petroleumProducts, gasStationsProductsProvinces } from "@/api/index"
import { reverseGeocode } from "@/utils/geocode"

import type { ApiGasStationWithDistance, ApiPetroleumProduct, Coordinates, SortByType } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { GasStationList } from "./gas-station-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, ArrowDownUp, DollarSign, Route } from "lucide-react"


const STATIONS_PER_PAGE = 6; // Número de estaciones a mostrar por página

export function SearchForm() {
  // --- Estados de Búsqueda y Datos ---
  const [address, setAddress] = useState("") 
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null)
  const [products, setProducts] = useState<ApiPetroleumProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  
  // --- Estados de Resultados y UI ---
  // Almacena TODOS los resultados de la API para poder ordenar y paginar
  const [allNearbyStations, setAllNearbyStations] = useState<ApiGasStationWithDistance[]>([])
  // Gestiona el criterio de ordenación
  const [sortBy, setSortBy] = useState<SortByType>('price')
  // Gestiona la paginación (cuántas páginas se han cargado)
  const [currentPage, setCurrentPage] = useState(1)

  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carga inicial de productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await petroleumProducts());
      } catch (err) {
        console.error(err);
        setError("Error al cargar la lista de carburantes.");
      }
    }
    loadProducts()
  }, [])

  // --- Lógica de Búsqueda ---
  const handleLocate = async () => {
    setIsLocating(true);
    setError(null);
    try {
      if (!navigator.geolocation) throw new Error("La geolocalización no es soportada por tu navegador.");
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const { latitude, longitude } = position.coords;
      setUserCoords({ lat: latitude, lng: longitude });
      setAddress(await reverseGeocode(latitude, longitude));
    } catch (err) {
      const apiError = err instanceof Error ? err.message : "No se pudo obtener la ubicación.";
      setError(apiError);
    } finally {
      setIsLocating(false);
    }
  }

  const handleSearch = async () => {
    if (!userCoords || !selectedProduct) {
      setError("Por favor, detecta tu ubicación y selecciona un carburante.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAllNearbyStations([]); // Limpia resultados anteriores
    setCurrentPage(1); // Resetea la paginación
    try {
      const stationsData = await gasStationsProductsProvinces(selectedProduct, userCoords);
      if (stationsData.length === 0) {
        setError('No se encontraron gasolineras cercanas que cumplan los criterios.');
      }
      setAllNearbyStations(stationsData);
    } catch (err) {
      const apiError = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Lógica de Visualización (Ordenación y Paginación) ---
  // `useMemo` recalcula la lista a mostrar solo cuando cambian los datos, la ordenación o la página.
  const displayedStations = useMemo(() => {
    // Copiamos para no mutar el estado original
    const stationsToSort = [...allNearbyStations];

    if (sortBy === 'price') {
      stationsToSort.sort((a, b) => {
        const priceA = parseFloat(a.PrecioProducto.replace(',', '.')) || Infinity;
        const priceB = parseFloat(b.PrecioProducto.replace(',', '.')) || Infinity;
        return priceA - priceB;
      });
    } else if (sortBy === 'distance') {
      stationsToSort.sort((a, b) => a.distance - b.distance);
    }
    
    // Devuelve solo la porción de la lista correspondiente a las páginas cargadas
    return stationsToSort.slice(0, currentPage * STATIONS_PER_PAGE);
  }, [allNearbyStations, sortBy, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  }

  // Determina si el botón "Cargar más" debe mostrarse
  const hasMoreStations = allNearbyStations.length > displayedStations.length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* --- FORMULARIO DE BÚSQUEDA --- */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Ubicación *</label>
            <div className="flex">
              <Input id="address" placeholder="Pulsa el icono para usar tu ubicación" value={address} readOnly className="w-full bg-gray-100 h-10 cursor-default rounded-r-none"/>
              <Button type="button" variant="outline" size="icon" onClick={handleLocate} disabled={isLocating} className="h-10 w-10 shrink-0 bg-white rounded-l-none border-l-0" aria-label="Usar mi ubicación actual">
                {isLocating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">Carburante *</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="w-full bg-white h-10"><SelectValue placeholder="Selecciona carburante" /></SelectTrigger>
              <SelectContent className="bg-white">
                {products.map((p) => <SelectItem key={p.IDProducto} value={p.IDProducto}>{p.NombreProducto}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button type="button" onClick={handleSearch} disabled={isLoading || isLocating || !userCoords || !selectedProduct} className="bg-emerald-500 w-full sm:w-auto px-8 py-2 hover:bg-emerald-600 text-white font-medium" size="lg">
            {isLoading ? "Buscando..." : "Buscar Gasolineras"}
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 mt-6">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* --- SECCIÓN DE RESULTADOS CON FILTRO DE ORDENACIÓN --- */}
      {allNearbyStations.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Resultados Cercanos</h3>
            <div className="w-48">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)}>
                <SelectTrigger className="w-full bg-white">
                  <ArrowDownUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="price"><DollarSign className="h-4 w-4 mr-2 inline-block"/>Precio</SelectItem>
                  <SelectItem value="distance"><Route className="h-4 w-4 mr-2 inline-block"/>Distancia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <GasStationList stations={displayedStations} isLoading={isLoading} />
          {hasMoreStations && (
            <div className="text-center">
              <Button onClick={handleLoadMore} variant="outline" className="bg-white">
                Cargar más estaciones
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}