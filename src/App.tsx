import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Fuel, Filter } from "lucide-react"
import { SearchForm } from "@/components/SearchForm"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-full">
              <Fuel className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              GasFinder
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto px-4">
            Encuentra de forma sencilla las gasolineras más baratas de España. Filtra por provincia y carburante para
            ahorrar en cada repostaje.
          </p>
        </header>

        {/* Search Form Card */}
        <Card className="shadow-lg border-t-4 border-t-blue-600 mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl md:text-2xl flex items-center justify-center gap-2 text-gray-800 mt-3">
              <Filter className="h-5 w-5 md:h-6 md:w-6" />
              <span>Buscar Gasolineras</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <SearchForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 md:mt-16 text-center text-xs md:text-sm text-gray-500 px-4">
          <p className="mb-2">
            © {new Date().getFullYear()} GasFinder. Creado para facilitar tu ahorro en combustible.
          </p>
          <p>Datos proporcionados por el Ministerio para la Transición Ecológica y el Reto Demográfico.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
