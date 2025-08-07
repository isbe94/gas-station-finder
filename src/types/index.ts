export interface Coordinates {
    lat: number;
    lng: number;
}

// Tipos para la API real
export interface ApiGasStation {
    "C.P.": string;
    "Dirección": string;
    "Horario": string;
    "Latitud": string;
    "Localidad": string;
    "Longitud (WGS84)": string;
    "Margen": string;
    "Municipio": string;
    "Precio Gasoleo A": string;
    "Precio Gasolina 95 E5": string;
    "Precio Gasolina 98 E5": string;
    "Precio Gasoleo Premium": string;
    "Provincia": string;
    "Rótulo": string;
    "Tipo Venta": string;
    "IDEESS": string;
    "IDMunicipio": string;
    "IDProvincia": string;
    "IDCCAA": string;
}

export interface GasStation {
    id: string;
    name: string;
    address: string;
    distance: number;
    prices: {
        [key: string]: number;
    };
    rating: number;
    isOpen: boolean;
    coordinates: Coordinates;
    schedule: string;
    postalCode: string;
    municipality: string;
    province: string;
}

export interface ApiProvince {
    IDProvincia: string;
    Provincia: string;
    CCAA: string;
}

export interface ApiMunicipality {
    IDMunicipio: string;
    Municipio: string;
    Provincia: string;
    IDCCAA: string;
    IDProvincia: string;
}

export interface ApiPetroleumProduct {
    IDProducto: string;
    NombreProducto: string;
    NombreProductoAbreviatura: string;
}

export type FuelType = 'gasolina95' | 'gasolina98' | 'diesel' | 'dieselPremium';

export interface FuelOption {
    value: FuelType;
    label: string;
    icon: string;
    apiField: string;
}

export interface Province {
    code: string;
    name: string;
}

export interface Municipality {
    code: string;
    name: string;
    province: string;
}
;
