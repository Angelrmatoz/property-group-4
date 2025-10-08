"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/services/properties";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [provincia, setProvincia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [sector, setSector] = useState("");
  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [mediosBanos, setMediosBanos] = useState("");
  const [parqueos, setParqueos] = useState("");
  const [construccion, setConstruccion] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [amueblado, setAmueblado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      titulo,
      descripcion,
      precio: Number(precio),
      provincia,
      municipio,
      sector,
      habitaciones: Number(habitaciones),
      banos: Number(banos),
      mediosBanos: Number(mediosBanos),
      parqueos: Number(parqueos),
      construccion: Number(construccion),
      amueblado,
    };

    try {
      if (images && images.length > 0) {
        // use FormData upload
        // import createPropertyFormData dynamically to avoid circular issues
        const mod = await import("@/services/properties");
        await mod.createPropertyFormData(payload as any, images);
      } else {
        await createProperty(payload);
      }
      setLoading(false);
      router.push("/dashboard/properties");
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Error creando la propiedad");
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Crear propiedad</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Precio</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Provincia</label>
            <input
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Municipio</label>
            <input
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Sector</label>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Habitaciones</label>
            <input
              type="number"
              value={habitaciones}
              onChange={(e) => setHabitaciones(e.target.value)}
              className="w-full rounded border px-3 py-2"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Baños</label>
            <input
              type="number"
              value={banos}
              onChange={(e) => setBanos(e.target.value)}
              className="w-full rounded border px-3 py-2"
              min={0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Medios baños</label>
            <input
              type="number"
              value={mediosBanos}
              onChange={(e) => setMediosBanos(e.target.value)}
              className="w-full rounded border px-3 py-2"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Parqueos</label>
            <input
              type="number"
              value={parqueos}
              onChange={(e) => setParqueos(e.target.value)}
              className="w-full rounded border px-3 py-2"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Construcción (m²)</label>
            <input
              type="number"
              value={construccion}
              onChange={(e) => setConstruccion(e.target.value)}
              className="w-full rounded border px-3 py-2"
              min={0}
            />
          </div>
        </div>

        <div>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">
                Subir imágenes (máx 10)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  // Append but cap at 10
                  const combined = [...images, ...files].slice(0, 10);
                  setImages(combined);
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Puedes subir hasta 10 imágenes. Las imágenes adicionales serán
                ignoradas.
              </p>

              {images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                        aria-label={`Remove image ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Amueblado</label>
          <div className="flex items-center gap-3">
            <label
              className={`inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 ${
                amueblado ? "bg-amber-600 text-white" : "bg-transparent"
              }`}
            >
              <input
                type="radio"
                name="amueblado"
                value="true"
                checked={amueblado === true}
                onChange={() => setAmueblado(true)}
                className="sr-only"
              />
              Sí
            </label>

            <label
              className={`inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 ${
                amueblado ? "bg-transparent" : "bg-amber-600 text-white"
              }`}
            >
              <input
                type="radio"
                name="amueblado"
                value="false"
                checked={amueblado === false}
                onChange={() => setAmueblado(false)}
                className="sr-only"
              />
              No
            </label>
          </div>
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
