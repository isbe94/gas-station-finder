"use client";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useProvinces, useMunicipalities } from "@/hooks/useApiData";
import type { Coordinates, FuelType, ApiProvince, ApiMunicipality } from "@/types";
import { geocodeAddress } from "@/utils/geocode";

interface SearchSelectorProps {
  onSearch: (coords: Coordinates | null, fullAddress: string, fuelType: FuelType | null) => void;
  disabled?: boolean;
}

export const SearchSelector = ({ onSearch, disabled }: SearchSelectorProps) => {
  const [address, setAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<ApiProvince | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<ApiMunicipality | null>(null);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { provinces, loading: provincesLoading } = useProvinces();
  const { municipalities, loading: municipalitiesLoading } = useMunicipalities(
    selectedProvince?.IDProvincia || null
  );

  const fuelOptions = [
    { value: "gasolina95" as FuelType, label: "Gasolina 95 E5", icon: "⛽" },
    { value: "gasolina98" as FuelType, label: "Gasolina 98 E5", icon: "🏎️" },
    { value: "diesel" as FuelType, label: "Gasóleo A", icon: "🚛" },
    { value: "dieselPremium" as FuelType, label: "Gasóleo Premium", icon: "🚚" },
  ];

  const handleProvinceChange = (event: SelectChangeEvent<string>) => {
    const provinceId = event.target.value as string;
    const province = provinces.find((p) => p.IDProvincia === provinceId) || null;
    setSelectedProvince(province);
    setSelectedMunicipality(null);
  };

  const handleMunicipalityChange = (event: SelectChangeEvent<string>) => {
    const municipalityId = event.target.value;
    const municipality = municipalities.find((m) => m.IDMunicipio === municipalityId) || null;
    setSelectedMunicipality(municipality);
  };

  const handleFuelChange = (event: SelectChangeEvent<string>) => {
    setSelectedFuel(event.target.value as FuelType);
  };

  const handleSearch = async () => {
    if (!selectedFuel) return;

    let fullAddress = "";
    if (address.trim()) fullAddress = address.trim();
    if (selectedMunicipality)
      fullAddress += fullAddress ? `, ${selectedMunicipality.Municipio}` : selectedMunicipality.Municipio;
    if (selectedProvince) fullAddress += fullAddress ? `, ${selectedProvince.Provincia}` : selectedProvince.Provincia;
    fullAddress += ", España";

    setIsSearching(true);
    try {
      const coords = await geocodeAddress(fullAddress);
      onSearch(coords, fullAddress, selectedFuel);
    } catch (error) {
      console.error("Error geocoding address:", error);
      onSearch(null, fullAddress, selectedFuel);
    } finally {
      setIsSearching(false);
    }
  };

  const canSearch = selectedFuel && (address.trim() || selectedMunicipality || selectedProvince);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Dirección */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MapPin size={16} />
          <Typography variant="subtitle2" component="label" color="text.primary" fontWeight={500}>
            Dirección
          </Typography>
        </Box>
        <TextField
          type="text"
          placeholder="Calle, número, barrio..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={disabled || isSearching}
          fullWidth
          variant="outlined"
          size="medium"
          inputProps={{ style: { height: 48, fontSize: "1rem" } }}
        />
      </Box>

      {/* Municipio, Provincia y Tipo de Combustible */}
      <Grid container spacing={3}>
        {/* Municipio */}
        <Grid container component="div" spacing={3}>
          <FormControl fullWidth variant="outlined" size="medium" disabled={disabled || isSearching || !selectedProvince || municipalitiesLoading}>
            <InputLabel id="municipality-label">Municipio</InputLabel>
            <Select
              labelId="municipality-label"
              value={selectedMunicipality?.IDMunicipio || ""}
              onChange={handleMunicipalityChange}
              label="Municipio"
              displayEmpty
              renderValue={(selected) => {
                if (!selectedProvince) return "Selecciona provincia primero";
                if (municipalitiesLoading) return <CircularProgress size={16} />;
                if (!selected) return "Selecciona municipio";
                const sel = municipalities.find((m) => m.IDMunicipio === selected);
                return sel ? sel.Municipio : "";
              }}
            >
              {municipalities.map((m) => (
                <MenuItem key={m.IDMunicipio} value={m.IDMunicipio}>
                  {m.Municipio}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Provincia */}
        <Grid container component="div" spacing={3}>
          <FormControl fullWidth variant="outlined" size="medium" disabled={disabled || isSearching || provincesLoading}>
            <InputLabel id="province-label">Provincia</InputLabel>
            <Select
              labelId="province-label"
              value={selectedProvince?.IDProvincia || ""}
              onChange={handleProvinceChange}
              label="Provincia"
              displayEmpty
              renderValue={(selected) => {
                if (provincesLoading) return <CircularProgress size={16} />;
                if (!selected) return "Selecciona provincia";
                const sel = provinces.find((p) => p.IDProvincia === selected);
                return sel ? sel.Provincia : "";
              }}
            >
              {provinces.map((p) => (
                <MenuItem key={p.IDProvincia} value={p.IDProvincia}>
                  {p.Provincia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Tipo de Combustible */}
        <Grid container component="div" spacing={3}>
          <FormControl fullWidth variant="outlined" size="medium" disabled={disabled || isSearching}>
            <InputLabel id="fuel-label">Tipo de Combustible</InputLabel>
            <Select
              labelId="fuel-label"
              value={selectedFuel || ""}
              onChange={handleFuelChange}
              label="Tipo de Combustible"
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return "Selecciona combustible";
                const sel = fuelOptions.find((f) => f.value === selected);
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{sel?.icon}</span>
                    <span>{sel?.label}</span>
                  </Box>
                );
              }}
            >
              {fuelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>{option.icon}</span>
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Botón de búsqueda */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={handleSearch}
          disabled={!canSearch || isSearching}
          variant="contained"
          size="medium"
          sx={{ height: 48, px: 4, fontWeight: 500, fontSize: "1rem" }}
          startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <Search size={20} />}
        >
          {isSearching ? "Buscando..." : "Buscar Gasolineras"}
        </Button>
      </Box>

      {/* Preview de dirección */}
      {(address.trim() || selectedMunicipality || selectedProvince) && (
        <Box sx={{ bgcolor: "background.paper", opacity: 0.5, borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} mb={0.5} color="text.primary">
            Dirección de búsqueda:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {[address.trim(), selectedMunicipality?.Municipio, selectedProvince?.Provincia, "España"]
              .filter(Boolean)
              .join(", ")}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
