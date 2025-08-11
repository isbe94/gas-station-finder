"use client"

// src/components/search-form.tsx

import { useState, useEffect } from "react"
import type { ApiGasStationWithDistance, ApiMunicipality, ApiPetroleumProduct, ApiProvince } from "@/types"
import { provincesList, municipalitiesByProvince, petroleumProducts, gasStationsProductsProvinces } from "@/api"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { GasStationList } from "./gas-station-list"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SearchForm() {
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  // Estados para los datos de los selectores
  const [provinces, setProvinces] = useState<ApiProvince[]>([])
  const [municipalities, setMunicipalities] = useState<ApiMunicipality[]>([])
  const [products, setProducts] = useState<ApiPetroleumProduct[]>([])

  // Estados para los valores seleccionados
  const [selectedProvince, setSelectedProvince] = useState<string>("")
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>("")

  // Estado para los resultados de la búsqueda
  const [filteredStations, setFilteredStations] = useState<ApiGasStationWithDistance[]>([])

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carga inicial de provincias y productos
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [provincesData, productsData] = await Promise.all([provincesList(), petroleumProducts()])
        setProvinces(provincesData)
        setProducts(productsData)
      } catch (err) {
        console.error(err)
        setError("Error al cargar datos iniciales. Inténtalo de nuevo más tarde.")
      }
    }
    loadInitialData()
  }, [])

  // Carga de municipios cuando cambia la provincia seleccionada
  useEffect(() => {
    // Reseteamos siempre el municipio al cambiar de provincia
    setMunicipalities([])
    setSelectedMunicipality("")

    if (selectedProvince) {
      const loadMunicipalities = async () => {
        try {
          const municipalitiesData = await municipalitiesByProvince(selectedProvince)
          setMunicipalities(municipalitiesData)
        } catch (err) {
          console.error(err)
          setError("No se pudieron cargar los municipios para la provincia seleccionada.")
        }
      }
      loadMunicipalities()
    }
  }, [selectedProvince])

  // Cuando cambia municipio, actualizar objeto completo
  const handleMunicipalityChange = (municipalityId: string) => {
    if (municipalityId === "all") {
      setSelectedMunicipality(null)
    } else {
      setSelectedMunicipality(municipalityId)
    }
  }

  const handleSearch = async () => {
    if (!selectedProvince || !selectedProduct || !address) {
      setError("Por favor, complete todos los campos requeridos (*).")
      return
    }
    setIsLoading(true)
    setError(null)
    setFilteredStations([])
    // Resetea el municipio para que la nueva búsqueda no esté pre-filtrada
    setSelectedMunicipality("")

    try {
      const municipioObj = municipalities.find((m) => m.IDMunicipio === selectedMunicipality)

      const fullAddress = [address, municipioObj?.Municipio, municipioObj?.CCAA, postalCode, "España"]
        .filter(Boolean) // elimina valores vacíos
        .join(", ")
      console.log("fullAddress", fullAddress)

      const stationsData = await gasStationsProductsProvinces(selectedProvince, selectedProduct, fullAddress)
      if (stationsData.length === 0) {
        setError("No se encontraron gasolineras con los criterios seleccionados.")
      } else {
        const sortedStations = stationsData.sort((a, b) => {
          const priceA = Number.parseFloat(a.PrecioProducto.replace(",", "."))
          const priceB = Number.parseFloat(b.PrecioProducto.replace(",", "."))
          return priceA - priceB
        })
        setFilteredStations(sortedStations)
      }
    } catch (err) {
      console.error(err)
      setError("Ocurrió un error durante la búsqueda.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Formulario de búsqueda */}
      <div className="space-y-4">
        {/* Fila 1: Dirección y Código Postal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <Input
              id="address"
              placeholder="Ej: Calle Mayor, 10"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white h-10"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código Postal
            </label>
            <Input
              id="postalCode"
              placeholder="Ej: 28018"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="w-full bg-white h-10"
            />
          </div>
        </div>

        {/* Fila 2: Selectores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
              Provincia *
            </label>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger id="province" className="w-full bg-white">
                <SelectValue placeholder="Selecciona provincia" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {provinces.map((p) => (
                  <SelectItem key={p.IDPovincia} value={p.IDPovincia} className="bg-white hover:bg-gray-50">
                    {p.CCAA}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-2">
              Municipio
            </label>
            <Select
              value={selectedMunicipality || ""}
              onValueChange={handleMunicipalityChange}
              disabled={!selectedProvince || municipalities.length === 0}
            >
              <SelectTrigger id="municipality" className="w-full bg-white">
                <SelectValue placeholder="Todos los municipios" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all" className="bg-white hover:bg-gray-50">
                  Todos los municipios
                </SelectItem>
                {municipalities.map((m) => (
                  <SelectItem key={m.IDMunicipio} value={m.IDMunicipio} className="bg-white hover:bg-gray-50">
                    {m.Municipio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
              Carburante *
            </label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="w-full bg-white">
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

        {/* Fila 3: Botón de búsqueda */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleSearch}
            disabled={isLoading || !selectedProvince || !selectedMunicipality || !selectedProduct || !address || !postalCode}
            className="bg-emerald-500 w-full sm:w-auto px-8 py-2 hover:bg-emerald-500 text-white font-medium"
            size="lg"
          >
            {isLoading ? "Buscando..." : "Buscar Gasolineras"}
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de resultados */}
      <GasStationList stations={filteredStations} isLoading={isLoading} />
    </div>
  )
}
