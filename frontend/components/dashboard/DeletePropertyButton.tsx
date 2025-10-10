"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProperty } from "@/services/properties";
import { useNotification } from "@/components/Notification";

export default function DeletePropertyButton({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer."))
      return;
    setLoading(true);
    try {
      await deleteProperty(id);
      notify({
        type: "success",
        title: "Propiedad eliminada",
        message: "La propiedad se eliminó correctamente.",
      });
      // refresh the current route to reflect deletion
      router.refresh();
    } catch (err) {
      console.error(err);
      const backendMsg =
        (err as any)?.response?.data?.error || (err as any)?.message;
      notify({
        type: "error",
        title: "Error eliminando propiedad",
        message: String(backendMsg || "Error eliminando la propiedad"),
        duration: 6000,
      });
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
