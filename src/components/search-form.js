"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/search-form.tsx
import { useState, useEffect } from "react";
import { provincesList, municipalitiesByProvince, petroleumProducts, gasStationsProductsProvinces } from "@/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GasStationList } from "./gas-station-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function SearchForm() {
    const [address, setAddress] = useState("");
    const [postalCode, setPostalCode] = useState("");
    // Estados para los datos de los selectores
    const [provinces, setProvinces] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);
    const [products, setProducts] = useState([]);
    // Estados para los valores seleccionados
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState("");
    // Estado para los resultados de la búsqueda
    const [filteredStations, setFilteredStations] = useState([]);
    // Estados de UI
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Carga inicial de provincias y productos
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [provincesData, productsData] = await Promise.all([provincesList(), petroleumProducts()]);
                setProvinces(provincesData);
                setProducts(productsData);
            }
            catch (err) {
                console.error(err);
                setError("Error al cargar datos iniciales. Inténtalo de nuevo más tarde.");
            }
        };
        loadInitialData();
    }, []);
    // Carga de municipios cuando cambia la provincia seleccionada
    useEffect(() => {
        // Reseteamos siempre el municipio al cambiar de provincia
        setMunicipalities([]);
        setSelectedMunicipality("");
        if (selectedProvince) {
            const loadMunicipalities = async () => {
                try {
                    const municipalitiesData = await municipalitiesByProvince(selectedProvince);
                    setMunicipalities(municipalitiesData);
                }
                catch (err) {
                    console.error(err);
                    setError("No se pudieron cargar los municipios para la provincia seleccionada.");
                }
            };
            loadMunicipalities();
        }
    }, [selectedProvince]);
    // Cuando cambia municipio, actualizar objeto completo
    const handleMunicipalityChange = (municipalityId) => {
        if (municipalityId === "all") {
            setSelectedMunicipality(null);
        }
        else {
            setSelectedMunicipality(municipalityId);
        }
    };
    const handleSearch = async () => {
        if (!selectedProvince || !selectedProduct || !address) {
            setError("Por favor, complete todos los campos requeridos (*).");
            return;
        }
        setIsLoading(true);
        setError(null);
        setFilteredStations([]);
        // Resetea el municipio para que la nueva búsqueda no esté pre-filtrada
        setSelectedMunicipality("");
        try {
            const municipioObj = municipalities.find((m) => m.IDMunicipio === selectedMunicipality);
            const fullAddress = [address, municipioObj?.Municipio, municipioObj?.CCAA, postalCode, "España"]
                .filter(Boolean) // elimina valores vacíos
                .join(", ");
            console.log("fullAddress", fullAddress);
            const stationsData = await gasStationsProductsProvinces(selectedProvince, selectedProduct, fullAddress);
            if (stationsData.length === 0) {
                setError("No se encontraron gasolineras con los criterios seleccionados.");
            }
            else {
                const sortedStations = stationsData.sort((a, b) => {
                    const priceA = Number.parseFloat(a.PrecioProducto.replace(",", "."));
                    const priceB = Number.parseFloat(b.PrecioProducto.replace(",", "."));
                    return priceA - priceB;
                });
                setFilteredStations(sortedStations);
            }
        }
        catch (err) {
            console.error(err);
            setError("Ocurrió un error durante la búsqueda.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 md:space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "md:col-span-3", children: [_jsx("label", { htmlFor: "address", className: "block text-sm font-medium text-gray-700 mb-2", children: "Direcci\u00F3n *" }), _jsx(Input, { id: "address", placeholder: "Ej: Calle Mayor, 10", value: address, onChange: (e) => setAddress(e.target.value), className: "w-full bg-white h-10" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "postalCode", className: "block text-sm font-medium text-gray-700 mb-2", children: "C\u00F3digo Postal" }), _jsx(Input, { id: "postalCode", placeholder: "Ej: 28018", value: postalCode, onChange: (e) => setPostalCode(e.target.value), className: "w-full bg-white h-10" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "province", className: "block text-sm font-medium text-gray-700 mb-2", children: "Provincia *" }), _jsxs(Select, { value: selectedProvince, onValueChange: setSelectedProvince, children: [_jsx(SelectTrigger, { id: "province", className: "w-full bg-white", children: _jsx(SelectValue, { placeholder: "Selecciona provincia" }) }), _jsx(SelectContent, { className: "bg-white", children: provinces.map((p) => (_jsx(SelectItem, { value: p.IDPovincia, className: "bg-white hover:bg-gray-50", children: p.CCAA }, p.IDPovincia))) })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "municipality", className: "block text-sm font-medium text-gray-700 mb-2", children: "Municipio" }), _jsxs(Select, { value: selectedMunicipality || "", onValueChange: handleMunicipalityChange, disabled: !selectedProvince || municipalities.length === 0, children: [_jsx(SelectTrigger, { id: "municipality", className: "w-full bg-white", children: _jsx(SelectValue, { placeholder: "Todos los municipios" }) }), _jsxs(SelectContent, { className: "bg-white", children: [_jsx(SelectItem, { value: "all", className: "bg-white hover:bg-gray-50", children: "Todos los municipios" }), municipalities.map((m) => (_jsx(SelectItem, { value: m.IDMunicipio, className: "bg-white hover:bg-gray-50", children: m.Municipio }, m.IDMunicipio)))] })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "product", className: "block text-sm font-medium text-gray-700 mb-2", children: "Carburante *" }), _jsxs(Select, { value: selectedProduct, onValueChange: setSelectedProduct, children: [_jsx(SelectTrigger, { id: "product", className: "w-full bg-white", children: _jsx(SelectValue, { placeholder: "Selecciona carburante" }) }), _jsx(SelectContent, { className: "bg-white", children: products.map((p) => (_jsx(SelectItem, { value: p.IDProducto, className: "bg-white hover:bg-gray-50", children: p.NombreProducto }, p.IDProducto))) })] })] })] }), _jsx("div", { className: "flex justify-center pt-2", children: _jsx(Button, { type: "button", onClick: handleSearch, disabled: isLoading || !selectedProvince || !selectedMunicipality || !selectedProduct || !address || !postalCode, className: "bg-emerald-500 w-full sm:w-auto px-8 py-2 hover:bg-emerald-500 text-white font-medium", size: "lg", children: isLoading ? "Buscando..." : "Buscar Gasolineras" }) })] }), error && (_jsx(Alert, { variant: "destructive", className: "bg-red-50 border-red-200", children: _jsx(AlertDescription, { className: "text-red-800", children: error }) })), _jsx(GasStationList, { stations: filteredStations, isLoading: isLoading })] }));
}
