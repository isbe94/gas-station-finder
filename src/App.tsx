// src/App.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Filter } from 'lucide-react';
import { SearchForm } from '@/components/search-form';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-full">
              <Fuel className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              GasFinder
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encuentra de forma sencilla las gasolineras más baratas de España. Filtra por provincia y carburante para ahorrar en cada repostaje.
          </p>
        </header>

        {/* Search Form Card */}
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-gray-800">
              <Filter className="h-6 w-6" />
              <span>Buscar Gasolineras</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} GasFinder. Creado para facilitar tu ahorro en combustible.</p>
          <p>Datos proporcionados por el Ministerio para la Transición Ecológica y el Reto Demográfico.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;