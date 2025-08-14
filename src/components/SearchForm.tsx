import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react"
import { petroleumProducts, gasStationsProductsProvinces } from "@/api/index"
import { getCurrentLocation, getCoordinatesFromAddress, reverseGeocode } from "@/utils/geocode"

import type { ApiGasStationWithDistance, ApiPetroleumProduct, Coordinates, SortByType } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { GasStationList } from "./GasStationList"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, DollarSign, Route, X } from "lucide-react"

const MapDisplay = lazy(() => import('@/components/MapDisplay').then(module => ({ default: module.MapDisplay })));

const STATIONS_PER_PAGE = 6;
const PREDEFINED_BRANDS = ['Repsol', 'Plenergy', 'Ballenoil', 'Petroprix'];
const DISTANCE_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_CENTER: Coordinates = { lat: 40.416775, lng: -3.703790 };

export function SearchForm() {
  const [searchCoords, setSearchCoords] = useState<Coordinates | null>(DEFAULT_CENTER) // Coordenadas finales para la búsqueda
  const [locatedAddress, setLocatedAddress] = useState(""); // Almacena la dirección de la geolocalización
  const [address, setAddress] = useState("")
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  const [products, setProducts] = useState<ApiPetroleumProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")

  const [brands] = useState<string[]>(PREDEFINED_BRANDS);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const [selectedDistance, setSelectedDistance] = useState<number>(30);
  const [sortBy, setSortBy] = useState<SortByType>('price')

  const [allStations, setAllStations] = useState<ApiGasStationWithDistance[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await petroleumProducts());
      } catch (err) {
        console.error(err)
        setError("Error al cargar la lista de carburantes.");
      }
    }
    loadProducts()
  }, [])

  const handleLocate = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setSearchCoords(coords);
      const locatedAddr = await reverseGeocode(coords.lat, coords.lng);
      setAddress(locatedAddr);
      setLocatedAddress(locatedAddr); // Guarda la dirección original de la geolocalización
    } catch (err) {
      console.error(err)
      setError("No se pudo obtener tu ubicación. Revisa los permisos.");
    } finally {
      setIsLocating(false);
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchCoords || !selectedProduct) return;
    setIsLoading(true);
    setError(null);
    try {
      const stationsData = await gasStationsProductsProvinces(
        selectedProduct,
        searchCoords,
        selectedBrands,
        sortBy,
        selectedDistance
      );
      if (stationsData.length === 0 && hasSearched) {
        setError('No se encontraron gasolineras que cumplan los criterios.');
      }
      setAllStations(stationsData);
    } catch (err) {
      const apiError = err instanceof Error ? err.message : "Ocurrió un error.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [searchCoords, selectedProduct, selectedBrands, sortBy, selectedDistance, hasSearched]);

  const handleSearchClick = async () => {
    setHasSearched(true);
    setCurrentPage(1);
    setAllStations([]);
    setError(null);

    if (address && address !== locatedAddress) {
      setIsLoading(true);
      try {
        const coords = await getCoordinatesFromAddress(address);
        if (coords) {
          setSearchCoords(coords); // Esto disparará el useEffect que llama a performSearch
        } else {
          setError('No se encontraron coordenadas para la dirección introducida.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err)
        setError('Error al buscar la dirección.');
        setIsLoading(false);
      }
    } else {
      // Si el input está vacío o no ha cambiado, se usan las coordenadas existentes.
      if (!searchCoords) {
        setError('Por favor, proporciona una ubicación.');
        return;
      }
      performSearch();
    }
  }

  useEffect(() => {
    if (hasSearched) {
      setCurrentPage(1);
      performSearch();
    }
  }, [selectedBrands, sortBy, selectedDistance, performSearch, hasSearched]);

  useEffect(() => {
    if (searchCoords && hasSearched) {
      performSearch();
    }
  }, [searchCoords, hasSearched, performSearch]);

  useEffect(() => {
    if (hasSearched) {
      performSearch();
    }
  }, [selectedBrands, sortBy, selectedDistance, hasSearched, performSearch]);

  const handleBrandSelect = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  const removeSelectedBrand = (brand: string) => setSelectedBrands(prev => prev.filter(b => b !== brand));
  const displayedStations = useMemo(() => allStations.slice(0, currentPage * STATIONS_PER_PAGE), [allStations, currentPage]);
  const hasMoreStations = useMemo(() => allStations.length > displayedStations.length, [allStations, displayedStations]);
  const handleLoadMore = () => setCurrentPage(prev => prev + 1);

  const handleMapClick = useCallback(async (coords: Coordinates) => {
    setIsLocating(true); // Reutilizamos el estado de carga para feedback visual
    setError(null);
    try {
      setSearchCoords(coords);
      const clickedAddress = await reverseGeocode(coords.lat, coords.lng);
      setAddress(clickedAddress);
      setLocatedAddress(clickedAddress); // Actualizamos ambas direcciones
    } catch (err) {
      console.error(err)
      setError("No se pudo obtener la dirección para el punto seleccionado.");
    } finally {
      setIsLocating(false);
    }
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ubicación */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Ubicación *
            </label>
            <div className="flex">
              <Input
                id="address"
                placeholder="Pulsa el icono"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-50 h-10 cursor-default rounded-r-none border-r-0  text-base font-medium placeholder:text-base 
                focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLocate}
                disabled={isLocating}
                className="h-10 w-11 shrink-0 bg-white rounded-l-none hover:bg-gray-50"
                aria-label="Usar mi ubicación actual"
              >
                {isLocating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500"></div>
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {/* Carburante */}
          <div className="space-y-2">
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Carburante *
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="w-full bg-white h-11 px-3 py-2">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[1001]">
                {products.map((p) => (
                  <SelectItem key={p.IDProducto} value={p.IDProducto}>
                    {p.NombreProducto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Marcas */}
          <div className="space-y-2">
            <label htmlFor="brands" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              Marca
            </label>
            <Select onValueChange={handleBrandSelect} value="">
              <SelectTrigger id="brands" className="w-full bg-white h-11 px-3 py-2">
                <SelectValue placeholder="Selecciona marca" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[1001]">
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand} disabled={selectedBrands.includes(brand)}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedBrands.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Marcas seleccionadas:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <Badge
                  key={brand}
                  variant="secondary"
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  {brand}
                  <button
                    onClick={() => removeSelectedBrand(brand)}
                    className="rounded-full hover:bg-emerald-200 p-0.5 ml-1"
                    aria-label={`Eliminar ${brand}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* --- SECCIÓN DE MAPA (debajo del botón de búsqueda) --- */}
        <div className="pt-4">
          <Suspense fallback={<div className="h-[400px] w-full bg-gray-200 rounded-md animate-pulse"></div>}>
            {searchCoords && (
              <MapDisplay
                stations={allStations}
                center={searchCoords}
                hoveredStationId={hoveredStationId}
                onMapClick={handleMapClick}
              />
            )}
          </Suspense>
        </div>

        <div className="flex justify-center pt-4">
          <Button type="button"
            onClick={handleSearchClick}
            disabled={isLoading || isLocating || !selectedProduct}
            className="bg-emerald-500 w-full sm:w-auto px-8 py-2 hover:bg-emerald-600 text-white font-medium" size="lg">
            {isLoading || isLocating ? "Buscando..." : "Buscar Gasolineras"}
          </Button>
        </div>
      </div>

      {error &&
        <Alert variant="destructive" className="bg-red-50 border-red-200 mt-6">
          <AlertDescription className="text-red-800">{error}
          </AlertDescription>
        </Alert>
      }

      {/* --- SECCIÓN DE LISTA DE RESULTADOS (debajo del mapa) --- */}
      {hasSearched && !isLoading && (
        <div className="space-y-6 pt-4">
          {allStations.length > 0 && (
            <>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-gray-800 shrink-0">Gasolineras Encontradas</h3>
                <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
                  <Select value={String(selectedDistance)} onValueChange={(value) => setSelectedDistance(Number(value))}>
                    <SelectTrigger className="w-[120px] bg-white h-11"><div className="flex items-center gap-1 justify-center"><Route className="h-4 w-4" /><SelectValue /></div></SelectTrigger>
                    <SelectContent className="bg-white">{DISTANCE_OPTIONS.map((dist) => <SelectItem key={dist} value={String(dist)}>{dist} km</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByType)}>
                    <SelectTrigger className="w-[150px] bg-white h-11"><div className="flex items-center gap-1 justify-center"><SelectValue placeholder="Ordenar por..." /></div></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="price"><div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />Precio</div></SelectItem>
                      <SelectItem value="distance"><div className="flex items-center gap-1.5"><Route className="h-4 w-4" />Distancia</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <GasStationList
                stations={displayedStations}
                isLoading={isLoading}
                onStationHover={setHoveredStationId}
              />
              {hasMoreStations && (
                <div className="text-center">
                  <Button onClick={handleLoadMore} variant="outline" className="bg-white">
                    Cargar más estaciones
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isLoading && <GasStationList stations={[]} isLoading={true} onStationHover={() => { }} />}
    </div>
  )
}