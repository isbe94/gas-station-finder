import { useState, useEffect } from 'react';
import { GasStation, Coordinates, FuelType, ApiGasStation } from '@/types';
import { calculateDistance } from '@/utils/geocode';

// Datos simulados basados en la estructura real de la API
const mockApiGasStations: ApiGasStation[] = [
  {
    "C.P.": "28001",
    "Dirección": "CALLE GRAN VÍA, 123",
    "Horario": "L-D: 06:00-22:00",
    "Latitud": "40,420000",
    "Localidad": "MADRID",
    "Longitud (WGS84)": "-3,700000",
    "Margen": "I",
    "Municipio": "Madrid",
    "Precio Gasoleo A": "1,479",
    "Precio Gasolina 95 E5": "1,519",
    "Precio Gasolina 98 E5": "1,669",
    "Precio Gasoleo Premium": "1,579",
    "Provincia": "MADRID",
    "Remisión": "OM",
    "Rótulo": "REPSOL",
    "Tipo Venta": "P",
    "% BioEtanol": "0,0",
    "% Éster metílico": "0,0",
    "IDEESS": "12054",
    "IDMunicipio": "28079",
    "IDProvincia": "28",
    "IDCCAA": "13"
  },
  {
    "C.P.": "28002",
    "Dirección": "AVENIDA DE LA CASTELLANA, 456",
    "Horario": "L-D: 24H",
    "Latitud": "40,415000",
    "Localidad": "MADRID",
    "Longitud (WGS84)": "-3,695000",
    "Margen": "D",
    "Municipio": "Madrid",
    "Precio Gasoleo A": "1,459",
    "Precio Gasolina 95 E5": "1,499",
    "Precio Gasolina 98 E5": "1,649",
    "Precio Gasoleo Premium": "1,559",
    "Provincia": "MADRID",
    "Remisión": "OM",
    "Rótulo": "CEPSA",
    "Tipo Venta": "P",
    "% BioEtanol": "0,0",
    "% Éster metílico": "0,0",
    "IDEESS": "12055",
    "IDMunicipio": "28079",
    "IDProvincia": "28",
    "IDCCAA": "13"
  },
  {
    "C.P.": "28003",
    "Dirección": "CALLE ALCALÁ, 789",
    "Horario": "L-V: 07:00-21:00; S-D: 08:00-20:00",
    "Latitud": "40,418000",
    "Localidad": "MADRID",
    "Longitud (WGS84)": "-3,710000",
    "Margen": "I",
    "Municipio": "Madrid",
    "Precio Gasoleo A": "1,489",
    "Precio Gasolina 95 E5": "1,529",
    "Precio Gasolina 98 E5": "1,679",
    "Precio Gasoleo Premium": "1,589",
    "Provincia": "MADRID",
    "Remisión": "OM",
    "Rótulo": "BP",
    "Tipo Venta": "P",
    "% BioEtanol": "0,0",
    "% Éster metílico": "0,0",
    "IDEESS": "12056",
    "IDMunicipio": "28079",
    "IDProvincia": "28",
    "IDCCAA": "13"
  },
  {
    "C.P.": "28004",
    "Dirección": "PASEO DE LA REFORMA, 321",
    "Horario": "L-D: 06:30-22:30",
    "Latitud": "40,422000",
    "Localidad": "MADRID",
    "Longitud (WGS84)": "-3,698000",
    "Margen": "D",
    "Municipio": "Madrid",
    "Precio Gasoleo A": "1,469",
    "Precio Gasolina 95 E5": "1,509",
    "Precio Gasolina 98 E5": "1,659",
    "Precio Gasoleo Premium": "1,569",
    "Provincia": "MADRID",
    "Remisión": "OM",
    "Rótulo": "SHELL",
    "Tipo Venta": "P",
    "% BioEtanol": "0,0",
    "% Éster metílico": "0,0",
    "IDEESS": "12057",
    "IDMunicipio": "28079",
    "IDProvincia": "28",
    "IDCCAA": "13"
  },
  {
    "C.P.": "28005",
    "Dirección": "CALLE SERRANO, 654",
    "Horario": "L-D: 07:00-23:00",
    "Latitud": "40,416000",
    "Localidad": "MADRID",
    "Longitud (WGS84)": "-3,702000",
    "Margen": "I",
    "Municipio": "Madrid",
    "Precio Gasoleo A": "1,499",
    "Precio Gasolina 95 E5": "1,539",
    "Precio Gasolina 98 E5": "1,689",
    "Precio Gasoleo Premium": "1,599",
    "Provincia": "MADRID",
    "Remisión": "OM",
    "Rótulo": "GALP",
    "Tipo Venta": "P",
    "% BioEtanol": "0,0",
    "% Éster metílico": "0,0",
    "IDEESS": "12058",
    "IDMunicipio": "28079",
    "IDProvincia": "28",
    "IDCCAA": "13"
  }
];

// Mapeo de tipos de combustible a campos de la API
const fuelFieldMapping: { [key in FuelType]: string } = {
  gasolina95: 'Precio Gasolina 95 E5',
  gasolina98: 'Precio Gasolina 98 E5',
  diesel: 'Precio Gasoleo A',
  dieselPremium: 'Precio Gasoleo Premium'
};

// Función para convertir datos de la API al formato interno
const convertApiGasStation = (apiStation: ApiGasStation, userCoords: Coordinates): GasStation => {
  const lat = parseFloat(apiStation.Latitud.replace(',', '.'));
  const lng = parseFloat(apiStation["Longitud (WGS84)"].replace(',', '.'));
  const stationCoords = { lat, lng };
  
  const prices: { [key: string]: number } = {};
  
  // Convertir precios de string a number
  if (apiStation["Precio Gasolina 95 E5"]) {
    prices.gasolina95 = parseFloat(apiStation["Precio Gasolina 95 E5"].replace(',', '.'));
  }
  if (apiStation["Precio Gasolina 98 E5"]) {
    prices.gasolina98 = parseFloat(apiStation["Precio Gasolina 98 E5"].replace(',', '.'));
  }
  if (apiStation["Precio Gasoleo A"]) {
    prices.diesel = parseFloat(apiStation["Precio Gasoleo A"].replace(',', '.'));
  }
  if (apiStation["Precio Gasoleo Premium"]) {
    prices.dieselPremium = parseFloat(apiStation["Precio Gasoleo Premium"].replace(',', '.'));
  }

  // Determinar si está abierto basado en el horario
  const isOpen = apiStation.Horario.includes('24H') || 
                 apiStation.Horario.includes('L-D') || 
                 new Date().getHours() >= 7 && new Date().getHours() <= 22;

  return {
    id: apiStation.IDEESS,
    name: apiStation.Rótulo,
    address: `${apiStation.Dirección}, ${apiStation.Localidad}`,
    distance: calculateDistance(userCoords, stationCoords),
    prices,
    rating: 3.5 + Math.random() * 1.5, // Rating simulado
    isOpen,
    coordinates: stationCoords,
    schedule: apiStation.Horario,
    postalCode: apiStation["C.P."],
    municipality: apiStation.Municipio,
    province: apiStation.Provincia
  };
};

export const useGasStations = (
  userCoords: Coordinates | null, 
  fuelType: FuelType | null,
  fullAddress: string = ''
) => {
  const [gasStations, setGasStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userCoords || !fuelType) {
      setGasStations([]);
      return;
    }

    setLoading(true);

    const loadGasStations = async () => {
      try {
        // En un entorno real, usarías: const data = await gasStations();
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Convertir datos de la API al formato interno
        const convertedStations = mockApiGasStations.map(station => 
          convertApiGasStation(station, userCoords)
        );

        // Filtrar estaciones en un radio de 30km que tengan el combustible seleccionado
        const filteredStations = convertedStations
          .filter(station => 
            station.distance <= 30 && // Radio de 30km
            station.prices[fuelType] !== undefined && // Tiene el combustible
            station.prices[fuelType] > 0 // Precio válido
          )
          .sort((a, b) => a.prices[fuelType] - b.prices[fuelType]); // Ordenar por precio

        setGasStations(filteredStations);
      } catch (error) {
        console.error('Error loading gas stations:', error);
        setGasStations([]);
      } finally {
        setLoading(false);
      }
    };

    loadGasStations();
  }, [userCoords, fuelType, fullAddress]);

  return { gasStations, loading };
};
