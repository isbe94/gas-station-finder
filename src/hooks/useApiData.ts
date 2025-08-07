import { useState, useEffect } from 'react';
import type { ApiProvince, ApiMunicipality, ApiPetroleumProduct } from '@/types';

// Simulamos las llamadas a la API ya que no podemos hacer llamadas reales en el entorno
const mockProvinces: ApiProvince[] = [
  { IDProvincia: "02", Provincia: "ALBACETE", CCAA: "CASTILLA-LA MANCHA" },
  { IDProvincia: "03", Provincia: "ALICANTE", CCAA: "COMUNIDAD VALENCIANA" },
  { IDProvincia: "04", Provincia: "ALMERÍA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "01", Provincia: "ARABA/ÁLAVA", CCAA: "PAÍS VASCO" },
  { IDProvincia: "33", Provincia: "ASTURIAS", CCAA: "ASTURIAS" },
  { IDProvincia: "05", Provincia: "ÁVILA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "06", Provincia: "BADAJOZ", CCAA: "EXTREMADURA" },
  { IDProvincia: "07", Provincia: "ILLES BALEARS", CCAA: "ILLES BALEARS" },
  { IDProvincia: "08", Provincia: "BARCELONA", CCAA: "CATALUÑA" },
  { IDProvincia: "48", Provincia: "BIZKAIA", CCAA: "PAÍS VASCO" },
  { IDProvincia: "09", Provincia: "BURGOS", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "10", Provincia: "CÁCERES", CCAA: "EXTREMADURA" },
  { IDProvincia: "11", Provincia: "CÁDIZ", CCAA: "ANDALUCÍA" },
  { IDProvincia: "39", Provincia: "CANTABRIA", CCAA: "CANTABRIA" },
  { IDProvincia: "12", Provincia: "CASTELLÓN", CCAA: "COMUNIDAD VALENCIANA" },
  { IDProvincia: "13", Provincia: "CIUDAD REAL", CCAA: "CASTILLA-LA MANCHA" },
  { IDProvincia: "14", Provincia: "CÓRDOBA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "15", Provincia: "A CORUÑA", CCAA: "GALICIA" },
  { IDProvincia: "16", Provincia: "CUENCA", CCAA: "CASTILLA-LA MANCHA" },
  { IDProvincia: "20", Provincia: "GIPUZKOA", CCAA: "PAÍS VASCO" },
  { IDProvincia: "17", Provincia: "GIRONA", CCAA: "CATALUÑA" },
  { IDProvincia: "18", Provincia: "GRANADA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "19", Provincia: "GUADALAJARA", CCAA: "CASTILLA-LA MANCHA" },
  { IDProvincia: "21", Provincia: "HUELVA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "22", Provincia: "HUESCA", CCAA: "ARAGÓN" },
  { IDProvincia: "23", Provincia: "JAÉN", CCAA: "ANDALUCÍA" },
  { IDProvincia: "24", Provincia: "LEÓN", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "25", Provincia: "LLEIDA", CCAA: "CATALUÑA" },
  { IDProvincia: "27", Provincia: "LUGO", CCAA: "GALICIA" },
  { IDProvincia: "28", Provincia: "MADRID", CCAA: "MADRID" },
  { IDProvincia: "29", Provincia: "MÁLAGA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "30", Provincia: "MURCIA", CCAA: "MURCIA" },
  { IDProvincia: "31", Provincia: "NAVARRA", CCAA: "NAVARRA" },
  { IDProvincia: "32", Provincia: "OURENSE", CCAA: "GALICIA" },
  { IDProvincia: "34", Provincia: "PALENCIA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "35", Provincia: "LAS PALMAS", CCAA: "CANARIAS" },
  { IDProvincia: "36", Provincia: "PONTEVEDRA", CCAA: "GALICIA" },
  { IDProvincia: "26", Provincia: "LA RIOJA", CCAA: "LA RIOJA" },
  { IDProvincia: "37", Provincia: "SALAMANCA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "38", Provincia: "SANTA CRUZ DE TENERIFE", CCAA: "CANARIAS" },
  { IDProvincia: "40", Provincia: "SEGOVIA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "41", Provincia: "SEVILLA", CCAA: "ANDALUCÍA" },
  { IDProvincia: "42", Provincia: "SORIA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "43", Provincia: "TARRAGONA", CCAA: "CATALUÑA" },
  { IDProvincia: "44", Provincia: "TERUEL", CCAA: "ARAGÓN" },
  { IDProvincia: "45", Provincia: "TOLEDO", CCAA: "CASTILLA-LA MANCHA" },
  { IDProvincia: "46", Provincia: "VALENCIA", CCAA: "COMUNIDAD VALENCIANA" },
  { IDProvincia: "47", Provincia: "VALLADOLID", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "49", Provincia: "ZAMORA", CCAA: "CASTILLA Y LEÓN" },
  { IDProvincia: "50", Provincia: "ZARAGOZA", CCAA: "ARAGÓN" }
];

const mockMunicipalities: { [provinceId: string]: ApiMunicipality[] } = {
  "28": [
    { IDMunicipio: "28079", Municipio: "Madrid", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28074", Municipio: "Leganés", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28065", Municipio: "Getafe", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28092", Municipio: "Móstoles", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28006", Municipio: "Alcalá de Henares", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28014", Municipio: "Alcorcón", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
    { IDMunicipio: "28058", Municipio: "Fuenlabrada", Provincia: "MADRID", IDCCAA: "13", IDProvincia: "28" },
  ],
  "08": [
    { IDMunicipio: "08019", Municipio: "Barcelona", Provincia: "BARCELONA", IDCCAA: "09", IDProvincia: "08" },
    { IDMunicipio: "08096", Municipio: "L'Hospitalet de Llobregat", Provincia: "BARCELONA", IDCCAA: "09", IDProvincia: "08" },
    { IDMunicipio: "08015", Municipio: "Badalona", Provincia: "BARCELONA", IDCCAA: "09", IDProvincia: "08" },
    { IDMunicipio: "08187", Municipio: "Sabadell", Provincia: "BARCELONA", IDCCAA: "09", IDProvincia: "08" },
    { IDMunicipio: "08194", Municipio: "Terrassa", Provincia: "BARCELONA", IDCCAA: "09", IDProvincia: "08" },
  ],
  "46": [
    { IDMunicipio: "46250", Municipio: "Valencia", Provincia: "VALENCIA", IDCCAA: "10", IDProvincia: "46" },
    { IDMunicipio: "46131", Municipio: "Gandia", Provincia: "VALENCIA", IDCCAA: "10", IDProvincia: "46" },
    { IDMunicipio: "46184", Municipio: "Sagunto", Provincia: "VALENCIA", IDCCAA: "10", IDProvincia: "46" },
  ]
};

export const useProvinces = () => {
  const [provinces, setProvinces] = useState<ApiProvince[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        // En un entorno real, usarías: const data = await provincesList();
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
        setProvinces(mockProvinces);
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProvinces();
  }, []);

  return { provinces, loading };
};

export const useMunicipalities = (provinceId: string | null) => {
  const [municipalities, setMunicipalities] = useState<ApiMunicipality[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provinceId) {
      setMunicipalities([]);
      return;
    }

    const loadMunicipalities = async () => {
      setLoading(true);
      try {
        // En un entorno real, usarías: const data = await municipalitiesList();
        await new Promise(resolve => setTimeout(resolve, 300));
        setMunicipalities(mockMunicipalities[provinceId] || []);
      } catch (error) {
        console.error('Error loading municipalities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMunicipalities();
  }, [provinceId]);

  return { municipalities, loading };
};

export const usePetroleumProducts = () => {
  const [products, setProducts] = useState<ApiPetroleumProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Simulamos los productos más comunes
        const mockProducts: ApiPetroleumProduct[] = [
          { IDProducto: "1", NombreProducto: "Gasolina 95 E5", NombreProductoAbreviatura: "G95E5" },
          { IDProducto: "3", NombreProducto: "Gasolina 98 E5", NombreProductoAbreviatura: "G98E5" },
          { IDProducto: "4", NombreProducto: "Gasoleo A", NombreProductoAbreviatura: "GOA" },
          { IDProducto: "5", NombreProducto: "Gasoleo Premium", NombreProductoAbreviatura: "GOP" },
        ];
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setProducts(mockProducts);
      } catch (error) {
        console.error('Error loading petroleum products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return { products, loading };
};
