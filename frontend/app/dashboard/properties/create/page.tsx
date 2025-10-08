"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    const url = base
      ? new URL(`/api/properties`, base).toString()
      : `/api/properties`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, price: Number(price) }),
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard/properties");
    else alert("Error creando la propiedad");
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Crear propiedad</h2>
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
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
}
