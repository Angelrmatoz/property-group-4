"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/services/properties";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [halfBathrooms, setHalfBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [builtArea, setBuiltArea] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [furnished, setFurnished] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      price: Number(price),
      province,
      city,
      neighborhood,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      halfBathrooms: Number(halfBathrooms),
      parkingSpaces: Number(parkingSpaces),
      builtArea: Number(builtArea),
      furnished,
    };

    // Map English internal fields to the Spanish payload expected by the API
    const spanishPayload = {
      titulo: payload.title,
      descripcion: payload.description,
      precio: payload.price,
      provincia: payload.province,
      municipio: payload.city,
      sector: payload.neighborhood,
      habitaciones: payload.bedrooms,
      banos: payload.bathrooms,
      mediosBanos: payload.halfBathrooms,
      parqueos: payload.parkingSpaces,
      construccion: payload.builtArea,
      amueblado: payload.furnished,
    };

    try {
      if (images && images.length > 0) {
        // use FormData upload
        // import createPropertyFormData dynamically to avoid circular issues
        const mod = await import("@/services/properties");
        await mod.createPropertyFormData(spanishPayload as any, images);
      } else {
        await createProperty(spanishPayload as any);
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border px-3 py-2 bg-transparent"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Precio</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              required
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Provincia</label>
            <input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Municipio</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Sector</label>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Habitaciones</label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Baños</label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              min={0}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Medios baños</label>
            <input
              type="number"
              value={halfBathrooms}
              onChange={(e) => setHalfBathrooms(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Parqueos</label>
            <input
              type="number"
              value={parkingSpaces}
              onChange={(e) => setParkingSpaces(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Construcción (m²)</label>
            <input
              type="number"
              value={builtArea}
              onChange={(e) => setBuiltArea(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
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
                furnished ? "bg-amber-600 text-white" : "bg-transparent"
              }`}
            >
              <input
                type="radio"
                name="furnished"
                value="true"
                checked={furnished === true}
                onChange={() => setFurnished(true)}
                className="sr-only"
              />
              Sí
            </label>

            <label
              className={`inline-flex items-center gap-2 cursor-pointer rounded px-3 py-1 ${
                furnished ? "bg-transparent" : "bg-amber-600 text-white"
              }`}
            >
              <input
                type="radio"
                name="furnished"
                value="false"
                checked={furnished === false}
                onChange={() => setFurnished(false)}
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
