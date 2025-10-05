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
import { useState } from "react";
import projects from "@/app/data/projects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" ||
      project.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      project.status.toLowerCase().includes(filterStatus.toLowerCase());

    return matchesSearch && matchesType && matchesStatus;
  });

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

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-black dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Tipo de Propiedad" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="terrenos">Terrenos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 dark:bg-black dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
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
      <section className="py-12 bg-white dark:bg-black">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="transition-all duration-300 group overflow-hidden bg-white border-gray-200 hover:border-yellow-500/50 shadow-lg hover:shadow-xl dark:bg-gray-900 dark:border-yellow-500/20 dark:hover:border-yellow-500/50"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
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
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
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
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
