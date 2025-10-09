import React from "react";
import Link from "next/link";
import projects from "../../data/projects";
import DeletePropertyButton from "@/components/dashboard/DeletePropertyButton";

type Property = {
  _id: string;
  title: string;
  price?: string | number;
};

async function getProperties(): Promise<Property[]> {
  // Try API first, but fall back to the local hard-coded projects when empty or on error.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL(`/api/properties`, base).toString();

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) return json;
    }
  } catch (err) {
    // swallow - we'll use fallback below
    console.warn("Could not fetch properties, using local sample data", err);
  }

  // Map the local projects shape to the Property type used by the dashboard
  return projects.map((p) => ({
    _id: p.id,
    title: p.name,
    price: p.price,
  }));
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
        {properties.map((p) => (
          <article key={p._id} className="p-4 border rounded">
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-sm text-muted-foreground">
              Precio: {p.price ?? "—"}
            </p>
            <div className="mt-2 flex gap-2 items-center">
              <Link
                href={`/dashboard/properties/${p._id}`}
                className="text-amber-600"
              >
                Ver
              </Link>
              <Link
                href={`/dashboard/properties/${p._id}/edit`}
                className="text-amber-600"
              >
                Editar
              </Link>
              <DeletePropertyButton id={p._id} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
