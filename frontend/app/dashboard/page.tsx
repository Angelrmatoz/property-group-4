"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  Search,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { transformCloudinaryUrl } from "@/lib/utils";

type Property = {
  id?: string;
  _id?: string; // legacy support
  titulo?: string;
  title?: string;
  imagen?: string;
  tipo?: string;
  type?: string;
  provincia?: string;
  province?: string;
  municipio?: string;
  city?: string;
  sector?: string;
  neighborhood?: string;
  precio?: number;
  price?: number;
  habitaciones?: number;
  bedrooms?: number;
  banos?: number;
  bathrooms?: number;
  construccion?: number;
  builtArea?: number;
  descripcion?: string;
  description?: string;
  imagenes?: string[];
  images?: string[];
};

// Helper function to normalize image arrays
function normalizeImageArray(images: any): string[] {
  if (!images) return [];

  // If it's already an array, return it (filtered for valid strings)
  if (Array.isArray(images)) {
    return images.filter((img) => img && typeof img === "string");
  }

  // If it's a string, check if it contains comma-separated URLs
  if (typeof images === "string") {
    if (images.includes(",")) {
      return images
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
    }
    return [images];
  }

  return [];
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      (property.title || property.titulo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (property.province || property.provincia || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (property.city || property.municipio || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    import("@/services/properties")
      .then((m) => {
        m.getProperties()
          .then((data: any) => {
            if (!mounted) return;

            // Removed debug logs: previously logged sample property for debugging

            // Normalize properties data
            const normalizedProperties = Array.isArray(data)
              ? data.map((property) => ({
                  ...property,
                  images: normalizeImageArray(
                    property.images || property.imagenes || property.imagen
                  ),
                  imagenes: normalizeImageArray(
                    property.images || property.imagenes || property.imagen
                  ),
                }))
              : [];

            setProperties(normalizedProperties);
          })
          .catch(() => {
            if (!mounted) return;
            setProperties([]);
          })
          .finally(() => {
            if (!mounted) return;
            setLoading(false);
          });
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bienvenido al Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Desde aquí puedes administrar tus propiedades.
          </p>
        </div>
        <Link href="/dashboard/properties/create">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar propiedades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Propiedades
                </p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponibles</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Venta</p>
                <p className="text-2xl font-bold">
                  {
                    properties.filter((p) => {
                      const type = (p.type || p.tipo || "").toLowerCase();
                      return type.includes("venta") || type.includes("sale");
                    }).length
                  }
                </p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alquiler</p>
                <p className="text-2xl font-bold">
                  {
                    properties.filter((p) => {
                      const type = (p.type || p.tipo || "").toLowerCase();
                      return type.includes("alquiler") || type.includes("rent");
                    }).length
                  }
                </p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Todas las Propiedades</h2>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando propiedades...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? "Intenta ajustar tu búsqueda"
                  : "Comienza creando tu primera propiedad"}
              </p>
              <Link href="/dashboard/properties/create">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Propiedad
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => {
              const propertyId = property.id || property._id;

              // Get the first image and ensure it's a single URL
              let firstImage =
                property.images?.[0] ||
                property.imagenes?.[0] ||
                property.imagen ||
                "/placeholder.svg";

              // Safety check: if it's an array or contains commas, take only the first part
              if (Array.isArray(firstImage)) {
                firstImage = firstImage[0] || "/placeholder.svg";
              } else if (
                typeof firstImage === "string" &&
                firstImage.includes(",")
              ) {
                firstImage = firstImage.split(",")[0].trim();
              }

              // Transform Cloudinary URLs to ensure HEIF/HEIC are served as JPEG
              const transformedImage = transformCloudinaryUrl(firstImage);

              const location = [
                property.neighborhood || property.sector,
                property.city || property.municipio,
                property.province || property.provincia,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <Card
                  key={propertyId}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={transformedImage}
                      alt={property.title || property.titulo || "Propiedad"}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-600 text-white border-0">
                        {property.type || property.tipo || "N/A"}
                      </Badge>
                    </div>
                    {(property.price || property.precio) && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-amber-400 font-bold text-sm">
                          $
                          {(
                            property.price || property.precio
                          )?.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {property.title || property.titulo || "Sin título"}
                    </h3>

                    {location && (
                      <div className="flex items-start text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                      {(property.bedrooms !== undefined ||
                        property.habitaciones !== undefined) && (
                        <div
                          key={`bed-${propertyId}`}
                          className="flex items-center justify-center gap-1"
                        >
                          <Bed className="w-4 h-4 text-amber-600" />
                          <span>
                            {property.bedrooms ?? property.habitaciones}
                          </span>
                        </div>
                      )}
                      {(property.bathrooms !== undefined ||
                        property.banos !== undefined) && (
                        <div
                          key={`bath-${propertyId}`}
                          className="flex items-center justify-center gap-1"
                        >
                          <Bath className="w-4 h-4 text-amber-600" />
                          <span>{property.bathrooms ?? property.banos}</span>
                        </div>
                      )}
                      {(property.builtArea !== undefined ||
                        property.construccion !== undefined) && (
                        <div
                          key={`sq-${propertyId}`}
                          className="flex items-center justify-center gap-1"
                        >
                          <Square className="w-4 h-4 text-amber-600" />
                          <span className="text-xs">
                            {property.builtArea ?? property.construccion}m²
                          </span>
                        </div>
                      )}
                    </div>

                    {(property.description || property.descripcion) && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {property.description || property.descripcion}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {propertyId ? (
                        <>
                          <Link
                            href={`/dashboard/properties/${propertyId}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              className="w-full text-sm"
                              size="sm"
                            >
                              Ver Detalles
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/properties/${propertyId}/edit`}
                            className="flex-1"
                          >
                            <Button
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm"
                              size="sm"
                            >
                              Editar
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          disabled
                          className="w-full text-sm"
                          size="sm"
                        >
                          ID no disponible
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
