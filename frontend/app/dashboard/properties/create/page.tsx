"use client";

import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/services/properties";
import { useNotification } from "@/components/Notification";
import heic2any from "heic2any";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [type, setType] = useState("sale");
  const [category, setCategory] = useState("apartment");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [halfBathrooms, setHalfBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [builtArea, setBuiltArea] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [furnished, setFurnished] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      price: Number(price),
      currency,
      province,
      city,
      neighborhood,
      type,
      category,
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
      currency: payload.currency,
      provincia: payload.province,
      municipio: payload.city,
      sector: payload.neighborhood,
      tipo: payload.type,
      category: payload.category,
      habitaciones: payload.bedrooms,
      banos: payload.bathrooms,
      mediosBanos: payload.halfBathrooms,
      parqueos: payload.parkingSpaces,
      construccion: payload.builtArea,
      // send explicit 'yes'/'no' string to backend; backend accepts booleans too
      amueblado: payload.furnished === true ? "yes" : "no",
    };

    try {
      if (images && images.length > 0) {
        // use FormData upload
        // import createPropertyFormData dynamically to avoid circular issues
        const mod = await import("@/services/properties");
        await mod.createPropertyFormData(
          spanishPayload as any,
          images.map((i) => i.file)
        );
      } else {
        await createProperty(spanishPayload as any);
      }
      setLoading(false);
      // notify success
      try {
        notify({
          type: "success",
          title: "Propiedad creada",
          message: "La propiedad se creó correctamente.",
        });
      } catch {}
      router.push("/dashboard/properties");
    } catch (err) {
      setLoading(false);
      // Prefer backend-provided message when available
      const backendMsg =
        (err as any)?.response?.data?.error || (err as any)?.message;
      try {
        notify({
          type: "error",
          title: "Error creando propiedad",
          message: String(backendMsg || "Error creando la propiedad"),
          duration: 6000,
        });
      } catch {
        // fallback to alert if notification fails
        alert(String(backendMsg || "Error creando la propiedad"));
      }
    }
  }

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      for (const it of images) {
        try {
          if (it.preview) URL.revokeObjectURL(it.preview);
        } catch {}
      }
    };
  }, [images]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Crear propiedad</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length > 100) {
                try {
                  notify({
                    type: "error",
                    title: "Título demasiado largo",
                    message: "El título no puede superar los 100 caracteres.",
                  });
                } catch {}
                return;
              }
              setTitle(val);
            }}
            className="w-full rounded border px-3 py-2 bg-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Máx 100 caracteres. {title.length}/100
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length > 2000) {
                try {
                  notify({
                    type: "error",
                    title: "Descripción demasiado larga",
                    message:
                      "La descripción no puede superar los 2,000 caracteres.",
                  });
                } catch {}
                return;
              }
              setDescription(val);
            }}
            className="w-full rounded border px-3 py-2 bg-transparent"
            rows={4}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Máx 2,000 caracteres. {description.length}/2000
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-background text-foreground cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="sale">Venta</option>
              <option value="rent">Alquiler</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-background text-foreground cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="apartment">Apartamento</option>
              <option value="house">Casa/Residencial</option>
              <option value="land">Terreno</option>
              <option value="commercial">Comercial</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-sm mb-1">Moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-background text-foreground cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="USD">Dólares (USD)</option>
              <option value="DOP">Pesos Dominicanos (RD$)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm mb-1">Sector</label>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full rounded border px-3 py-2 bg-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Amueblado</label>
            <select
              value={furnished ? "true" : "false"}
              onChange={(e) => setFurnished(e.target.value === "true")}
              className="w-full rounded border px-3 py-2 bg-background text-foreground cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.75rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const accepted: { file: File; preview: string }[] = [];
                  const maxBytes = 10 * 1024 * 1024; // 10 MB
                  const maxImages = 10;
                  const remainingSlots = Math.max(0, maxImages - images.length);

                  if (files.length > remainingSlots) {
                    try {
                      notify({
                        type: "error",
                        title: "Límite de imágenes",
                        message: `Solo se permiten hasta ${maxImages} imágenes. Se rechazaron ${
                          files.length - remainingSlots
                        } imagen(es) extra.`,
                      });
                    } catch {}
                  }

                  // Only process up to the remaining slots
                  const toProcess = files.slice(0, remainingSlots);

                  for (const f of toProcess) {
                    // Allow files that either have an image/* mimetype or
                    // have a known image extension (covers cases where some
                    // browsers/devices send an empty or generic mimetype).
                    const nameLower = (f.name || "").toLowerCase();
                    const hasImageMime = Boolean(
                      f.type && f.type.startsWith("image/")
                    );
                    const hasImageExt =
                      /\.(jpg|jpeg|png|gif|webp|avif|heic|heif|tiff|tif|bmp|svg|ico)$/i.test(
                        nameLower
                      );
                    if (!hasImageMime && !hasImageExt) {
                      try {
                        notify({
                          type: "error",
                          title: "Formato no permitido",
                          message: `El archivo ${f.name} no es una imagen y ha sido rechazado.`,
                        });
                      } catch {}
                      continue;
                    }

                    // Check if it's HEIF/HEIC and convert to JPEG automatically
                    let processedFile = f;
                    const isHEIF =
                      f.type === "image/heif" ||
                      f.type === "image/heic" ||
                      f.name.toLowerCase().endsWith(".heif") ||
                      f.name.toLowerCase().endsWith(".heic");

                    if (isHEIF) {
                      try {
                        notify({
                          type: "info",
                          title: "Convirtiendo imagen",
                          message: `Convirtiendo ${f.name} de HEIF a JPEG...`,
                          duration: 3000,
                        });

                        // Convert HEIF to JPEG blob
                        const convertedBlob = await heic2any({
                          blob: f,
                          toType: "image/jpeg",
                          quality: 0.9,
                        });

                        // heic2any can return Blob or Blob[] depending on input
                        const finalBlob = Array.isArray(convertedBlob)
                          ? convertedBlob[0]
                          : convertedBlob;

                        // Create new File from converted blob
                        const newFileName = f.name.replace(
                          /\.(heif|heic)$/i,
                          ".jpg"
                        );
                        processedFile = new File([finalBlob], newFileName, {
                          type: "image/jpeg",
                        });

                        notify({
                          type: "success",
                          title: "Conversión exitosa",
                          message: `${f.name} convertido a JPEG correctamente.`,
                          duration: 3000,
                        });
                      } catch (conversionError) {
                        console.error(
                          "HEIF conversion failed:",
                          conversionError
                        );
                        notify({
                          type: "error",
                          title: "Error de conversión",
                          message: `No se pudo convertir ${f.name}. Por favor intenta con otra imagen.`,
                          duration: 5000,
                        });
                        continue;
                      }
                    }

                    if (processedFile.size > maxBytes) {
                      try {
                        notify({
                          type: "error",
                          title: "Imagen demasiado grande",
                          message: `El archivo ${processedFile.name} supera los 10 MB y ha sido rechazado.`,
                        });
                      } catch {}
                      continue;
                    }

                    accepted.push({
                      file: processedFile,
                      preview: URL.createObjectURL(processedFile),
                    });
                  }

                  if (accepted.length === 0) return;

                  // Append accepted files but cap at maxImages total
                  const combined = [...images, ...accepted].slice(0, maxImages);
                  setImages(combined);
                }}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Puedes subir hasta 10 imágenes. Las imágenes en formato
                HEIF/HEIC (iPhone) se convertirán automáticamente a JPEG.
              </p>

              {images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {images.map((it, idx) => {
                    const safePreview =
                      typeof it.preview === "string" &&
                      (it.preview.startsWith("blob:") ||
                        it.preview.startsWith("data:"))
                        ? it.preview
                        : undefined;
                    return (
                      <div key={idx} className="relative">
                        {safePreview ? (
                          <>
                            {/* eslint-disable-next-line */}
                            <div
                              role="img"
                              aria-label={it.file.name}
                              style={{ backgroundImage: `url(${safePreview})` }}
                              className="w-full h-24 bg-cover bg-center rounded"
                            />
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            // revoke url to avoid memory leaks
                            try {
                              const removed = images[idx];
                              if (removed && removed.preview)
                                URL.revokeObjectURL(removed.preview);
                            } catch {}
                            setImages(images.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                          aria-label={`Remove image ${it.file.name}`}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
