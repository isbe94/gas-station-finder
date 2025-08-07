"use client";

import { useState } from 'react';
import { TextField, Button, CircularProgress } from '@mui/material'
import { MapPin, Search } from 'lucide-react';
import { geocodeAddress } from '@/utils/geocode';
import { Coordinates } from '@/types/index';

interface AddressInputProps {
  onAddressChange: (coords: Coordinates | null) => void;
  loading?: boolean;
}

export const AddressInput = ({ onAddressChange, loading }: AddressInputProps) => {
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(address);
      onAddressChange(coords);
    } catch (error) {
      console.error('Error geocoding address:', error);
      onAddressChange(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <TextField
          type="text"
          placeholder="Ingresa tu dirección (ej: Madrid, Barcelona, Valencia...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isGeocoding || loading}
          fullWidth
          variant="outlined"
          size="medium"
          InputProps={{
            style: { paddingLeft: 40, height: 48, fontSize: '1rem' },
          }}
        />
      </div>
      <Button
        type="submit"
        disabled={!address.trim() || isGeocoding || loading}
        variant="contained"
        fullWidth
        size="medium"
        sx={{ height: 48, fontWeight: '500', fontSize: '1rem', mt: 2 }}
      >
        {isGeocoding ? (
          <>
            <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            Buscando ubicación...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" /> 
            Buscar Gasolineras
          </>
        )}
      </Button>
    </form>
  );
};
