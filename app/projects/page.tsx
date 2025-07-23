"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Bed, Bath, Square, ArrowLeft, Search, Filter, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavClick = (href: string) => {
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white hover:text-yellow-400 hover:bg-transparent"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-yellow-500/20 z-40">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <Link
              href="/#inicio"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("/#inicio")}
            >
              Inicio
            </Link>
            <Link
              href="/#servicios"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("/#servicios")}
            >
              Servicios
            </Link>
            <Link
              href="/projects"
              className="text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("/projects")}
            >
              Proyectos
            </Link>
            <Link
              href="/#nosotros"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("/#nosotros")}
            >
              Nosotros
            </Link>
            <Link
              href="/#contacto"
              className="text-white hover:text-yellow-400 transition-colors py-2 border-b border-gray-800"
              onClick={() => handleNavClick("/#contacto")}
            >
              Contacto
            </Link>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-4"
              onClick={() => setIsOpen(false)}
            >
              Consulta Gratis
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}

const projects = [
  {
    id: 1,
    name: "Golden Heights",
    type: "Torre Residencial",
    location: "Zona Premium",
    price: "$180,000",
    bedrooms: "2-3",
    bathrooms: "2-3",
    area: "85-120 m²",
    status: "Disponible",
    statusColor: "bg-green-500",
    image: "/placeholder.svg?height=300&width=400&text=Torre+Residencial+Moderna",
    description: "Torre residencial de lujo con 25 pisos, ubicada en el corazón de la zona premium de la ciudad.",
    features: ["Gimnasio", "Piscina", "Seguridad 24/7", "Parqueadero", "Salón Social"],
  },
  {
    id: 2,
    name: "Property Plaza",
    type: "Complejo Residencial",
    location: "Sector Norte",
    price: "$220,000",
    bedrooms: "3-4",
    bathrooms: "2-3",
    area: "120-180 m²",
    status: "En Construcción",
    statusColor: "bg-blue-500",
    image: "/placeholder.svg?height=300&width=400&text=Complejo+Residencial+Moderno",
    description: "Complejo residencial con amenidades completas y espacios verdes para toda la familia.",
    features: ["Parque Infantil", "Cancha Deportiva", "Zona BBQ", "Senderos", "Club House"],
  },
  {
    id: 3,
    name: "Golden Business",
    type: "Centro Comercial",
    location: "Centro Financiero",
    price: "$95,000",
    bedrooms: "N/A",
    bathrooms: "1-2",
    area: "50-200 m²",
    status: "Pre-venta",
    statusColor: "bg-purple-500",
    image: "/placeholder.svg?height=300&width=400&text=Torre+Comercial+Elegante",
    description: "Centro comercial y oficinas ejecutivas en el distrito financiero más importante.",
    features: ["Locales Comerciales", "Oficinas", "Food Court", "Parqueadero", "Seguridad"],
  },
  {
    id: 4,
    name: "Property Gardens",
    type: "Villas Exclusivas",
    location: "Zona Residencial",
    price: "$350,000",
    bedrooms: "4-5",
    bathrooms: "3-4",
    area: "200-300 m²",
    status: "Últimas Unidades",
    statusColor: "bg-orange-500",
    image: "/placeholder.svg?height=300&width=400&text=Desarrollo+Residencial+Exclusivo",
    description: "Villas exclusivas con jardín privado y acabados de primera calidad.",
    features: ["Jardín Privado", "Garaje Doble", "Terraza", "Estudio", "Cuarto de Servicio"],
  },
  {
    id: 5,
    name: "Golden View",
    type: "Apartamentos",
    location: "Vista Panorámica",
    price: "$125,000",
    bedrooms: "1-2",
    bathrooms: "1-2",
    area: "60-90 m²",
    status: "Disponible",
    statusColor: "bg-green-500",
    image: "/placeholder.svg?height=300&width=400&text=Edificio+Apartamentos+Modernos",
    description: "Apartamentos modernos con vista panorámica de la ciudad y acabados contemporáneos.",
    features: ["Vista Panorámica", "Balcón", "Cocina Integral", "Closets", "Aire Acondicionado"],
  },
  {
    id: 6,
    name: "Golden Lots",
    type: "Terrenos",
    location: "Desarrollo Futuro",
    price: "$75,000",
    bedrooms: "N/A",
    bathrooms: "N/A",
    area: "500-1000 m²",
    status: "Inversión",
    statusColor: "bg-yellow-500",
    image: "/placeholder.svg?height=300&width=400&text=Terrenos+Desarrollo+Premium",
    description: "Terrenos para desarrollo residencial en zona de alta valorización.",
    features: ["Servicios Públicos", "Vías Pavimentadas", "Zona Comercial", "Transporte", "Valorización"],
  },
  {
    id: 7,
    name: "Skyline Towers",
    type: "Torres Gemelas",
    location: "Distrito Moderno",
    price: "$195,000",
    bedrooms: "2-3",
    bathrooms: "2",
    area: "90-130 m²",
    status: "Próximamente",
    statusColor: "bg-gray-500",
    image: "/placeholder.svg?height=300&width=400&text=Torres+Gemelas+Modernas",
    description: "Proyecto de torres gemelas con diseño arquitectónico vanguardista.",
    features: ["Rooftop", "Co-working", "Spa", "Concierge", "Smart Home"],
  },
  {
    id: 8,
    name: "Eco Residences",
    type: "Desarrollo Sostenible",
    location: "Zona Verde",
    price: "$165,000",
    bedrooms: "2-4",
    bathrooms: "2-3",
    area: "80-150 m²",
    status: "En Construcción",
    statusColor: "bg-blue-500",
    image: "/placeholder.svg?height=300&width=400&text=Desarrollo+Ecologico+Sostenible",
    description: "Desarrollo residencial sostenible con tecnologías verdes y espacios naturales.",
    features: ["Paneles Solares", "Jardines Verticales", "Reciclaje", "Huerta Comunitaria", "Ciclovía"],
  },
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || project.type.toLowerCase().includes(filterType.toLowerCase())
    const matchesStatus = filterStatus === "all" || project.status.toLowerCase().includes(filterStatus.toLowerCase())

    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">PG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Property Group</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/#inicio" className="hover:text-yellow-400 transition-colors">
              Inicio
            </Link>
            <Link href="/#servicios" className="hover:text-yellow-400 transition-colors">
              Servicios
            </Link>
            <Link href="/projects" className="text-yellow-400">
              Proyectos
            </Link>
            <Link href="/#nosotros" className="hover:text-yellow-400 transition-colors">
              Nosotros
            </Link>
            <Link href="/#contacto" className="hover:text-yellow-400 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <Button className="hidden md:block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            Consulta Gratis
          </Button>

          {/* Mobile Hamburger Menu */}
          <MobileMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Proyectos</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Descubre nuestra cartera completa de proyectos inmobiliarios. Desde apartamentos modernos hasta
              desarrollos comerciales, tenemos la propiedad perfecta para ti.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-12">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black border-gray-700 text-white focus:border-yellow-500"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-black border-gray-700 text-white focus:border-yellow-500">
                  <SelectValue placeholder="Tipo de Propiedad" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="terrenos">Terrenos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-black border-gray-700 text-white focus:border-yellow-500">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todos los Estados</SelectItem>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="construcción">En Construcción</SelectItem>
                  <SelectItem value="pre-venta">Pre-venta</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-gray-900 border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 group overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${project.statusColor} text-white border-0`}>{project.status}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-yellow-400 font-bold text-lg">{project.price}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-1">{project.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{project.type}</p>
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {project.location}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    {project.bedrooms !== "N/A" && (
                      <div className="text-center">
                        <Bed className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                        <span className="text-gray-300">{project.bedrooms}</span>
                      </div>
                    )}
                    {project.bathrooms !== "N/A" && (
                      <div className="text-center">
                        <Bath className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                        <span className="text-gray-300">{project.bathrooms}</span>
                      </div>
                    )}
                    <div className="text-center">
                      <Square className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <span className="text-gray-300">{project.area}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">No se encontraron proyectos</h3>
              <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">¿No Encontraste lo que Buscabas?</h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de expertos está listo para ayudarte a encontrar la propiedad perfecta según tus necesidades
            específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contacto">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-yellow-400 font-semibold text-lg px-8 py-4">
                Contactar Asesor
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-yellow-400 text-lg px-8 py-4 bg-transparent"
            >
              Solicitar Catálogo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-yellow-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">PG</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Property Group</h3>
                <p className="text-gray-400 text-sm">Tu socio inmobiliario de confianza</p>
              </div>
            </Link>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Property Group. Todos los derechos reservados.</p>
              <p className="text-gray-500 text-sm mt-1">Diseñado con ❤️ para tu éxito inmobiliario</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
