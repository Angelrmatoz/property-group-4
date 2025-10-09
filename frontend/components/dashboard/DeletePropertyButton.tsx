"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProperty } from "@/services/properties";

export default function DeletePropertyButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer."))
      return;
    setLoading(true);
    try {
      await deleteProperty(id);
      // refresh the current route to reflect deletion
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error eliminando la propiedad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500"
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
