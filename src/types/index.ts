export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ApiAllGasStation {
  "C.P.": string;
  "Dirección": string;
  "Horario": string;
  "Latitud": string;
  "Localidad": string;
  "Longitud (WGS84)": string;
  "Margen": string;
  "Municipio": string;
  "Precio Adblue": string;
  "Precio Amoniaco": string;
  "Precio Biodiesel": string;
  "Precio Bioetanol": string;
  "Precio Biogas Natural Comprimido": string;
  "Precio Biogas Natural Licuado": string;
  "Precio Diésel Renovable": string;
  "Precio Gas Natural Comprimido": string;
  "Precio Gas Natural Licuado": string;
  "Precio Gases licuados del petróleo": string;
  "Precio Gasoleo A": string;
  "Precio Gasoleo B": string;
  "Precio Gasoleo Premium": string;
  "Precio Gasolina 95 E10": string;
  "Precio Gasolina 95 E25": string;
  "Precio Gasolina 95 E5": string;
  "Precio Gasolina 95 E5 Premium": string;
  "Precio Gasolina 95 E85": string;
  "Precio Gasolina 98 E10": string;
  "Precio Gasolina 98 E5": string;
  "Precio Gasolina Renovable": string;
  "Precio Hidrogeno": string;
  "Precio Metanol": string;
  "Provincia": string;
  "Remisión": string;
  "Rótulo": string;
  "Tipo Venta": string;
  "% BioEtanol": string;
  "% Éster metílico": string;
  "IDEESS": string;
  "IDMunicipio": string;
  "IDProvincia": string;
  "IDCCAA": string;
}

export interface ApiGasStation {
  "C.P.": string;
  "Dirección": string;
  "Horario": string;
  "Latitud": string;
  "Localidad": string;
  "Longitud (WGS84)": string;
  "Margen": string;
  "Municipio": string;
  "PrecioProducto": string;
  "Provincia": string;
  "Remisión": string;
  "Rótulo": string;
  "Tipo Venta": string;
  "IDEESS": string;
  "IDMunicipio": string;
  "IDProvincia": string;
  "IDCCAA": string;
}

// Se crea a partir de la funcion gasStationsProductsProvinces que calcula la distancia
export interface ApiGasStationWithDistance extends ApiGasStation {
  distance: number;
}

export interface ApiProvince {
  IDPovincia: string; // Nota: La API real puede tener un typo "IDPovincia". Lo mantenemos para que coincida.
  IDCCAA: string;
  Provincia: string;
  CCAA: string;
}

export interface ApiMunicipality {
  IDMunicipio: string;
  Municipio: string;
  Provincia: string;
  IDCCAA: string;
  IDProvincia: string;
  CCAA: string;
}

export interface ApiPetroleumProduct {
  IDProducto: string;
  NombreProducto: string;
  NombreProductoAbreviatura: string;
}

export type SortByType = 'price' | 'distance';