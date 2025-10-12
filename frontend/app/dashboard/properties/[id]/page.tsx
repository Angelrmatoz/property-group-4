import React from "react";
import PropertyGallery from "@/components/dashboard/PropertyGallery";
import { getPropertyById } from "@/services/properties";

type Property = {
  _id: string;
  title: string;
  price?: number;
  description?: string;
  images?: string[];
  habitaciones?: number;
  banos?: number;
  parqueos?: number;
  construccion?: number;
  amueblado?: boolean;
  provincia?: string;
  municipio?: string;
  sector?: string;
};

export default async function PropertyPage({ params }: { params: any }) {
  // params may be a Promise-like in some Next versions; await it before using
  const { id } = (await params) as { id: string };
  const prop = (await getPropertyById(id)) as Property | null;
  if (!prop)
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Propiedad no encontrada</h3>
          <p className="text-sm text-muted-foreground mt-2">
            La propiedad que buscas no existe o no está disponible.
          </p>
          <div className="mt-4">
            <a
              href="/dashboard/properties"
              className="text-amber-600 hover:underline"
            >
              Volver al listado
            </a>
          </div>
        </div>
      </div>
    );
  // Normalize property fields so frontend can accept english or spanish keys
  const propNorm = {
    _id: prop._id ?? (prop as any).id,
    title: prop.title ?? (prop as any).titulo ?? "",
    price: prop.price ?? (prop as any).precio,
    description: prop.description ?? (prop as any).descripcion ?? "",
    images: prop.images ?? (prop as any).images ?? [],
    provincia: prop.provincia ?? (prop as any).province,
    municipio: prop.municipio ?? (prop as any).city,
    sector: prop.sector ?? (prop as any).neighborhood,
    habitaciones: prop.habitaciones ?? (prop as any).bedrooms,
    banos: prop.banos ?? (prop as any).bathrooms,
    parqueos: prop.parqueos ?? (prop as any).parkingSpaces,
    construccion: prop.construccion ?? (prop as any).builtArea,
    amueblado: (prop.amueblado ??
      (prop as any).furnished ??
      (prop as any).amueblado) as boolean,
  } as const;

  return (
    <article>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PropertyGallery images={propNorm.images} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold break-words max-w-full">
            {propNorm.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Precio: {propNorm.price ?? "—"}
          </p>
          <p className="mt-4 break-words whitespace-pre-wrap max-h-48 overflow-auto">
            {propNorm.description}
          </p>

          <div className="mt-4">
            <h4 className="font-medium">Detalles</h4>
            <ul className="mt-2 text-sm space-y-1">
              <li>Provincia: {propNorm.provincia ?? "—"}</li>
              <li>Municipio: {propNorm.municipio ?? "—"}</li>
              <li>Sector: {propNorm.sector ?? "—"}</li>
              <li>Habitaciones: {propNorm.habitaciones ?? "—"}</li>
              <li>Baños: {propNorm.banos ?? "—"}</li>
              <li>Parqueos: {propNorm.parqueos ?? "—"}</li>
              <li>Construcción: {propNorm.construccion ?? "—"} m²</li>
              <li>Amueblado: {propNorm.amueblado ? "Sí" : "No"}</li>
            </ul>
          </div>

          <div className="mt-4">
            <a
              href={`/dashboard/properties/${propNorm._id}/edit`}
              className="text-amber-600"
            >
              Editar
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
