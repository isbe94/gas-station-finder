// src/components/gas-station-card.tsx

import { ApiGasStation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GasStationCardProps {
    station: ApiGasStation;
}

export function GasStationCard({ station }: GasStationCardProps) {
    const formatPrice = (price: string) => {
        const numericPrice = parseFloat(price.replace(',', '.'));
        return isNaN(numericPrice) ? 'No disponible' : `${numericPrice.toFixed(3)} €/L`;
    }

    return (
        <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex justify-between items-start">
                    <span>{station['Rótulo']}</span>
                    <Badge variant={station['Margen'] === 'D' ? 'default' : 'secondary'}>
                        {station['Margen'] === 'D' ? 'Autopista' : 'Carretera'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-primary font-black text-2xl">
                    <Tag className="h-6 w-6"/>
                    <span>{formatPrice(station.PrecioProducto)}</span>
                </div>
                <div className="text-gray-600 space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>{station['Dirección']}, {station['C.P.']} {station.Localidad} ({station.Provincia})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>{station.Horario}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Componente Skeleton para la tarjeta
export function GasStationCardSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-8 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </CardContent>
        </Card>
    )
}