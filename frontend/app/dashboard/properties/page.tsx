import React from "react";
import Link from "next/link";
import DeletePropertyButton from "@/components/dashboard/DeletePropertyButton";
import { getProperties as getPropertiesService } from "@/services/properties";

// Esta página depende de datos que cambian con frecuencia; declarar como
// force-dynamic hace explícito que Next debe renderizarla en cada petición
// y evita advertencias durante la fase de build sobre fetch con no-store.
export const dynamic = "force-dynamic";

type Property = {
  _id: string;
  title: string;
  price?: string | number;
};

async function getProperties(): Promise<Property[]> {
  // Intentamos la API a través del servicio Axios compartido; si falla o
  // devuelve vacío usamos el fallback local `projects`.
  try {
    const data = await getPropertiesService();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    // swallow - we'll use fallback below
    // Mantener la advertencia en console puede ayudar en dev.
    // eslint-disable-next-line no-console
    console.warn(
      "Could not fetch properties via service, using local sample data",
      err
    );
  }

  // If the API call failed or returned nothing, return an empty list.
  return [];
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <section>
      {/* Responsive header: stack on small screens to avoid clipping with mobile sidebar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <h2 className="text-2xl font-semibold">Mis propiedades</h2>
        <Link
          href="/dashboard/properties/create"
          className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded self-start sm:self-auto"
        >
          Crear
        </Link>
      </div>

      <div className="grid gap-4">
        {properties.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay propiedades aún.
          </p>
        )}
        {properties.map((p, idx) => {
          const id = p._id ?? (p as any).id ?? idx;
          return (
            <article key={id} className="p-4 border rounded">
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-muted-foreground">
                Precio: {p.price ?? "—"}
              </p>
              <div className="mt-2 flex gap-2 items-center">
                <Link
                  href={`/dashboard/properties/${id}`}
                  className="text-amber-600"
                >
                  Ver
                </Link>
                <Link
                  href={`/dashboard/properties/${id}/edit`}
                  className="text-amber-600"
                >
                  Editar
                </Link>
                <DeletePropertyButton id={String(id)} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
