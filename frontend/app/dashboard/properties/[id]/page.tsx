import React from "react";

type Property = {
  _id: string;
  title: string;
  price?: number;
  description?: string;
};

async function getProperty(id: string): Promise<Property | null> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL(`/api/properties/${id}`, base).toString();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const prop = await getProperty(params.id);
  if (!prop) return <p>No encontrada</p>;

  return (
    <article>
      <h2 className="text-2xl font-semibold">{prop.title}</h2>
      <p className="text-sm text-muted-foreground">
        Precio: {prop.price ?? "—"}
      </p>
      <p className="mt-4">{prop.description}</p>
      <div className="mt-4">
        <a
          href={`/dashboard/properties/${prop._id}/edit`}
          className="text-amber-600"
        >
          Editar
        </a>
      </div>
    </article>
  );
}
