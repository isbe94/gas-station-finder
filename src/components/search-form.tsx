"use client"

import { useState, useEffect } from "react"
// Importamos solo lo que el frontend necesita
import { petroleumProducts, gasStationsProductsProvinces } from "@/api/index"
import { reverseGeocode } from "@/utils/geocode"

import type { ApiGasStationWithDistance, ApiPetroleumProduct } from "@/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { GasStationList } from "./gas-station-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin } from "lucide-react"

type Coordinates = { lat: number; lng: number }

export function SearchForm() {
  const [address, setAddress] = useState("") 
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null)
  const [products, setProducts] = useState<ApiPetroleumProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [filteredStations, setFilteredStations] = useState<ApiGasStationWithDistance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await petroleumProducts());
      } catch (err) {
        setError("Error al cargar la lista de carburantes.");
      }
    }
    loadProducts()
  }, [])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por tu navegador.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setAddress(await reverseGeocode(latitude, longitude));
        } catch (err) {
          setError("No se pudo obtener el nombre de la dirección.");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setError("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
        setIsLocating(false);
      }
    );
  }

  const handleSearch = async () => {
    if (!userCoords || !selectedProduct) {
      setError("Por favor, detecta tu ubicación y selecciona un carburante.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFilteredStations([]);
    try {
      // La llamada es simple y correcta: (string, object)
      const stationsData = await gasStationsProductsProvinces(selectedProduct, userCoords);
      if (stationsData.length === 0) {
        setError('No se encontraron gasolineras cercanas que cumplan los criterios.');
      }
      setFilteredStations(stationsData);
    } catch (err) {
      const apiError = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <div className="flex">
              <Input
                id="address"
                placeholder="Pulsa el icono para usar tu ubicación"
                value={address}
                readOnly
                className="w-full bg-gray-100 h-10 cursor-default rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleLocate}
                disabled={isLocating}
                className="h-10 w-10 shrink-0 bg-white rounded-l-none border-l-0"
                aria-label="Usar mi ubicación actual"
              >
                {isLocating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div> : <MapPin className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
              Carburante *
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="w-full bg-white h-10">
                <SelectValue placeholder="Selecciona carburante" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {products.map((p) => (
                  <SelectItem key={p.IDProducto} value={p.IDProducto} className="bg-white hover:bg-gray-50">
                    {p.NombreProducto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || isLocating || !userCoords || !selectedProduct}
            className="bg-emerald-500 w-full sm:w-auto px-8 py-2 hover:bg-emerald-600 text-white font-medium"
            size="lg"
          >
            {isLoading ? "Buscando..." : "Buscar Gasolineras"}
          </Button>
        </div>
      </div>
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 mt-6">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      <div className="pt-4">
        <GasStationList stations={filteredStations} isLoading={isLoading} />
      </div>
    </div>
  )
}