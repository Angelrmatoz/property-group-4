"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/properties/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTitle(data.title || "");
      setPrice(data.price?.toString() || "");
    }
    load();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/properties/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, price: Number(price) }),
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard/properties");
    else alert("Error actualizando");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Editar propiedad</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Precio</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
