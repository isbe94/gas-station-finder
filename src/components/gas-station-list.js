import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GasStationCard, GasStationCardSkeleton } from './gas-station-card';
export function GasStationList({ stations, isLoading }) {
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 6 }).map((_, index) => (_jsx(GasStationCardSkeleton, {}, index))) }));
    }
    if (stations.length === 0) {
        return (_jsxs("div", { className: "text-center py-16 border-2 border-dashed rounded-lg", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-700", children: "No hay resultados que mostrar" }), _jsx("p", { className: "text-gray-500 mt-2", children: "Realiza una b\u00FAsqueda para encontrar gasolineras." })] }));
    }
    return (_jsx("div", { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: stations.map((station) => (_jsx(GasStationCard, { station: station }, station.IDEESS))) }) }));
}
