"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper function to translate category to Spanish
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      apartment: "Apartamento",
      house: "Casa/Residencial",
      land: "Terreno",
      commercial: "Comercial",
    };
    return categoryMap[category] || category;
  };

  // Helper function to translate type to Spanish
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      sale: "Venta",
      rent: "Alquiler",
    };
    return typeMap[type] || type;
  };

  // Projects are now loaded from the properties service
  type Project = {
    id?: string;
    name?: string;
    image?: string;
    type?: string;
    location?: string;
    status?: string;
    statusColor?: string;
    price?: string;
    bedrooms?: string | number;
    bathrooms?: string | number;
    area?: string | number;
    description?: string;
    fullData?: any;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.name || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (project.location || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    // Filter by category (apartment, house, land, commercial)
    const matchesCategory =
      filterCategory === "all" ||
      (project.fullData?.category || "").toString().toLowerCase() ===
        filterCategory.toLowerCase();

    // Filter by type (sale, rent)
    const matchesType =
      filterType === "all" ||
      (project.fullData?.type || project.type || "")
        .toString()
        .toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesCategory && matchesType;
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // lazy-load properties from service
    import("@/services/properties").then((m) => {
      m.getProperties()
        .then((data: any) => {
          if (!mounted) return;
          // Map backend properties to project format
          const mappedProjects = (Array.isArray(data) ? data : []).map(
            (prop: any) => {
              const categoryLabel = getCategoryLabel(prop.category || "");
              const typeLabel = getTypeLabel(prop.type || "");

              return {
                id: prop.id || prop._id,
                name: prop.title || prop.titulo || "Sin título",
                image:
                  prop.images?.[0] ||
                  prop.imagenes?.[0] ||
                  prop.imagen ||
                  "/placeholder.svg",
                type: `${categoryLabel} en ${typeLabel}`,
                location:
                  [
                    prop.neighborhood || prop.sector,
                    prop.city || prop.municipio,
                    prop.province || prop.provincia,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Ubicación no disponible",
                status: prop.furnished ? "Amueblado" : "Disponible",
                statusColor: prop.furnished ? "bg-blue-500" : "bg-green-500",
                price:
                  prop.price || prop.precio
                    ? `${prop.currency === "DOP" ? "RD$" : "USD$"}${(
                        prop.price || prop.precio
                      ).toLocaleString("en-US")}`
                    : "Consultar",
                bedrooms: prop.bedrooms ?? prop.habitaciones ?? "N/A",
                bathrooms: prop.bathrooms ?? prop.banos ?? "N/A",
                area:
                  prop.builtArea || prop.construccion
                    ? `${prop.builtArea || prop.construccion}m²`
                    : "N/A",
                description:
                  prop.description ||
                  prop.descripcion ||
                  "Sin descripción disponible",
                // Store full property data for modal
                fullData: prop,
              };
            }
          );
          setProjects(mappedProjects);
        })
        .catch(() => {
          if (!mounted) return;
          setProjects([]);
        })
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-background text-foreground dark:bg-black dark:text-foreground">
      {/* Header */}

      <Header />

      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-12 transition-colors duration-300 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8 mt-4">
            <Link
              href="/"
              className="flex items-center transition-colors mr-4 text-gray-600 hover:text-yellow-400 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm md:text-base">Volver al Inicio</span>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Nuestros <span className="text-yellow-400">Proyectos</span>
            </h1>
            <p className="text-lg md:text-xl max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
              Descubre nuestra cartera completa de proyectos inmobiliarios.
              Desde apartamentos modernos hasta desarrollos comerciales, tenemos
              la propiedad perfecta para ti.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="rounded-2xl p-6 mb-12 bg-white shadow-lg dark:bg-gray-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-black dark:border-gray-700 dark:text-white`}
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-black dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  <SelectItem value="apartment">Apartamentos</SelectItem>
                  <SelectItem value="house">Casas</SelectItem>
                  <SelectItem value="land">Terrenos</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-black dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Tipo de Operación" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Venta y Alquiler</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="rent">Alquiler</SelectItem>
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
      <section className="py-12 bg-white dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">Cargando...</div>
            ) : (
              filteredProjects.map((project) => (
                <Card
                  key={project.id || project.name}
                  className="transition-all duration-300 group overflow-hidden bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-gray-900 dark:border-yellow-500/20 dark:hover:border-yellow-500/50"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={(project.image as string) || "/placeholder.svg"}
                      alt={(project.name as string) || "Proyecto"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        className={`${project.statusColor} text-white border-0`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-yellow-400 font-bold text-lg">
                        {project.price}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1 text-yellow-600 dark:text-yellow-400">
                        {project.name}
                      </h3>
                      <p className="text-sm mb-2 text-gray-500 dark:text-gray-400">
                        {project.type}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      {project.bedrooms !== "N/A" && (
                        <div className="text-center">
                          <Bed className="w-4 h-4 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {project.bedrooms}
                          </span>
                        </div>
                      )}
                      {project.bathrooms !== "N/A" && (
                        <div className="text-center">
                          <Bath className="w-4 h-4 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {project.bathrooms}
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <Square className="w-4 h-4 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {project.area}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>

                    <div>
                      <Button
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setSelectedProject(project);
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <h3 className="text-2xl font-bold mb-2 text-gray-600 dark:text-gray-400">
                No se encontraron proyectos
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Property Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setCurrentImageIndex(0);
            setSelectedProject(null);
          }}
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setCurrentImageIndex(0);
                setSelectedProject(null);
              }}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors text-xl font-bold"
            >
              ✕
            </button>

            {/* Image Gallery with Carousel */}
            <div className="relative h-72 bg-gray-200 dark:bg-gray-800">
              {(() => {
                const images = selectedProject.fullData?.images ||
                  selectedProject.fullData?.imagenes || [selectedProject.image];

                return (
                  <>
                    <Image
                      src={images[currentImageIndex] || "/placeholder.svg"}
                      alt={selectedProject.name || "Propiedad"}
                      fill
                      className="object-contain bg-gray-100 dark:bg-gray-800"
                    />

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                      <Badge
                        className={`${selectedProject.statusColor} text-white border-0 px-3 py-1`}
                      >
                        {selectedProject.status}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 right-3 bg-yellow-500 rounded-lg px-4 py-2">
                      <span className="text-black font-bold text-xl">
                        {selectedProject.price}
                      </span>
                    </div>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? images.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev === images.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                        >
                          →
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-5">
                <h2 className="text-3xl font-bold mb-2 text-yellow-600 dark:text-yellow-400">
                  {selectedProject.name}
                </h2>
                <p className="text-base mb-2 text-gray-600 dark:text-gray-400">
                  {selectedProject.type}
                </p>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2 text-yellow-600" />
                  <span className="text-sm">{selectedProject.location}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                {selectedProject.bedrooms !== "N/A" && (
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.bedrooms}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Habitaciones
                    </p>
                  </div>
                )}
                {selectedProject.bathrooms !== "N/A" && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedProject.bathrooms}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Baños
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <Square className="w-6 h-6 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedProject.area}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Área
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  Descripción
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Additional Details */}
              {selectedProject.fullData && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    Detalles Adicionales
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProject.fullData.lotArea && (
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Área del terreno:
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedProject.fullData.lotArea}m²
                        </span>
                      </div>
                    )}
                    {selectedProject.fullData.parkingSpaces !== undefined && (
                      <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Estacionamientos:
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedProject.fullData.parkingSpaces}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div>
                <Link href="/#contacto" className="block">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3">
                    Contactar Asesor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-6">
            ¿No Encontraste lo que Buscabas?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Nuestro equipo de expertos está listo para ayudarte a encontrar la
            propiedad perfecta según tus necesidades específicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contacto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-yellow-400 font-semibold text-lg px-8 py-4"
              >
                Contactar Asesor
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-black text-black hover:bg-black hover:text-yellow-400 text-lg px-8 py-4 bg-transparent"
            >
              Solicitar Catálogo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
