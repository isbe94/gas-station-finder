import type { ApiGasStationWithDistance } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface GasStationCardProps {
    station: ApiGasStationWithDistance
}

export function GasStationCard({ station }: GasStationCardProps) {
    const formatPrice = (price: string) => {
        const numericPrice = Number.parseFloat(price.replace(",", "."))
        return isNaN(numericPrice) ? "No disponible" : `${numericPrice.toFixed(3)} €/L`
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${station["Dirección"]}, ${station["C.P."]} ${station.Localidad} (${station.Provincia})`
    )}`;

    return (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border border-gray-200 text-black">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg font-bold">
                        <div className="flex flex-col gap-3">
                            <span className="break-words leading-tight text-gray-800">{station["Rótulo"]}</span>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    {station.distance.toFixed(1)} km
                                </Badge>
                                <Badge
                                    className={station["Margen"] === "D" ? "bg-black text-white" : ""}
                                    variant={station["Margen"] === "D" ? "default" : "secondary"}
                                >
                                    {station["Margen"] === "D" ? "Autopista" : "Carretera"}
                                </Badge>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm flex-grow">
                    <div className="flex items-center gap-3 text-primary font-black text-xl md:text-2xl p-2 rounded-lg">
                        <Tag className="h-5 w-5 md:h-6 md:w-6" />
                        <span>{formatPrice(station.PrecioProducto)}</span>
                    </div>
                    <div className="text-gray-600 space-y-3">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                            <span className="text-xs md:text-sm leading-relaxed">
                                {station["Dirección"]}, {station["C.P."]} {station.Localidad} ({station.Provincia})
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                            <span className="text-xs md:text-sm leading-relaxed">{station.Horario}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </a>
    )
}

export function GasStationCardSkeleton() {
    return (
        <Card className="h-full bg-white border border-gray-200">
            <CardHeader className="pb-3">
                <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-200" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 bg-gray-200" />
                        <Skeleton className="h-6 w-20 bg-gray-200" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <Skeleton className="h-8 w-32 bg-gray-200" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-gray-200" />
                    <Skeleton className="h-4 w-5/6 bg-gray-200" />
                    <Skeleton className="h-4 w-4/5 bg-gray-200" />
                </div>
            </CardContent>
        </Card>
    )
}