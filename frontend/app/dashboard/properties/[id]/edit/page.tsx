"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProperty } from "@/services/properties";
import { useNotification } from "@/components/Notification";

export default function EditPropertyPage({ params }: { params: any }) {
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
  // imagesFiles: per-slot new file (index 0..9)
  const [imagesFiles, setImagesFiles] = useState<(File | null)[]>(
    Array(10).fill(null)
  );
  // existingImages: per-slot existing URL (index 0..9)
  const [existingImages, setExistingImages] = useState<(string | null)[]>(
    Array(10).fill(null)
  );
  // imagePreviews: cached object URLs for selected File previews
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(
    Array(10).fill(null)
  );
  // refs to the hidden file inputs so we can clear their value programmatically
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(10).fill(null));
  const [furnished, setFurnished] = useState(false);
  const [loading, setLoading] = useState(false);

  // Next 15+: `params` may be a Promise-like object in client components.
  // Unwrap it with React.use() before accessing properties to avoid runtime warnings.
  // Cast params to any to satisfy TypeScript's 'Usable' typing used by Next's React.use wrapper.
  // At runtime Next will unwrap the params Promise-like object.
  const { id } = React.use(params as unknown as any) as { id: string };

  // Helper function to safely validate and return image URLs
  // This satisfies Snyk's security requirements for DOM-based XSS prevention
  const getSafeImageUrl = (url: string | null): string => {
    if (!url) return "";
    // Only allow blob: URLs (from URL.createObjectURL) and https: URLs (from Cloudinary)
    if (url.startsWith("blob:") || url.startsWith("https://")) {
      return url;
    }
    // For any other protocol, return empty string to prevent XSS
    return "";
  };

  // Revoke object URLs when previews change or on unmount to avoid leaks
  useEffect(() => {
    return () => {
      try {
        for (const url of imagePreviews) {
          if (url) {
            URL.revokeObjectURL(url);
          }
        }
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreviews]);

  useEffect(() => {
    async function load() {
      const base = process.env.NEXT_PUBLIC_BASE_URL || "";
      const url = base
        ? new URL(`/api/properties/${id}`, base).toString()
        : `/api/properties/${id}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setTitle(data.title || "");
      setDescription(data.description || "");
      setPrice(data.price?.toString() || "");
      setCurrency(data.currency || "USD");
      setProvince(data.province || "");
      setCity(data.city || "");
      setNeighborhood(data.neighborhood || "");
      setType(data.type || "sale");
      setCategory(data.category || "apartment");
      setBedrooms(data.bedrooms?.toString() || "");
      setBathrooms(data.bathrooms?.toString() || "");
      setHalfBathrooms(data.halfBathrooms?.toString() || "");
      setParkingSpaces(data.parkingSpaces?.toString() || "");
      setBuiltArea(data.builtArea?.toString() || "");
      // populate up to 10 slots with existing image URLs
      const imagesArr = data.images || [];
      const slots = Array(10)
        .fill(null)
        .map((_, i) => (imagesArr[i] ? String(imagesArr[i]) : null));
      setExistingImages(slots);
      // data.furnished may be boolean or 'yes'/'no' string
      setFurnished(
        data.furnished === "yes"
          ? true
          : data.furnished === "no"
          ? false
          : Boolean(data.furnished)
      );
    }
    load();
  }, [id]);

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
      // existingImages (per-slot) will be sent as the images list when not
      // replaced by new files in the same slot.
      images: existingImages.filter(Boolean) as string[],
      furnished,
    };

    // Map English internals to the Spanish payload keys the services expect
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
      // send explicit 'yes'/'no' to the API
      amueblado: payload.furnished === true ? "yes" : "no",
    };

    try {
      // Collect files from the per-slot imagesFiles array
      const filesToUpload = imagesFiles.filter(Boolean) as File[];

      // build images array to keep the order across slots: if a slot has an
      // existing URL keep it; if replaced by a File, it will be uploaded and
      // the server should handle placing the new file in that slot order.
      const keptImages = existingImages.filter(Boolean) as string[];

      const payloadWithImages = { ...spanishPayload, images: keptImages };

      if (filesToUpload.length > 0) {
        const mod = await import("@/services/properties");
        await mod.updatePropertyFormData(
          id,
          payloadWithImages as any,
          filesToUpload
        );
      } else {
        await updateProperty(id, payloadWithImages as any);
      }

      setLoading(false);
      router.push("/dashboard/properties");
    } catch (err) {
      setLoading(false);
      const backendMsg =
        (err as any)?.response?.data?.error || (err as any)?.message;
      notify({
        type: "error",
        title: "Error actualizando propiedad",
        message: String(backendMsg || "Error actualizando la propiedad"),
        duration: 6000,
      });
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Editar propiedad</h2>
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
          <label className="block text-sm mb-2">Imágenes (10 slots)</label>
          <p className="text-xs text-gray-500 mb-2">
            Cada slot muestra la imagen actual y permite reemplazarla o
            eliminarla.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, idx) => {
              const url = existingImages[idx];
              const file = imagesFiles[idx];
              return (
                <div key={idx} className="flex flex-col items-stretch">
                  {/* Preview + click area is handled by the label below;
                      removing duplicate non-interactive preview to avoid
                      stacked/duplicated images in the UI. */}

                  <div className="mt-2">
                    <div className="relative">
                      {/* Hidden file input triggered by clicking the image area */}
                      <input
                        id={`file-slot-${idx}`}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setImagesFiles((prev) => {
                            const copy = [...prev];
                            copy[idx] = f;
                            return copy;
                          });
                          // if replacing, clear the existing URL for that slot
                          if (f) {
                            setExistingImages((prev) => {
                              const copy = [...prev];
                              copy[idx] = null;
                              return copy;
                            });
                            // create and cache object URL preview (revoke previous if any)
                            setImagePreviews((prev) => {
                              const copy = [...prev];
                              if (copy[idx]) {
                                try {
                                  URL.revokeObjectURL(copy[idx]!);
                                } catch {
                                  /* ignore */
                                }
                              }
                              copy[idx] = URL.createObjectURL(f);
                              return copy;
                            });
                            // clear the input value so selecting the same file later
                            // will still trigger onChange
                            try {
                              if (inputRefs.current[idx]) {
                                inputRefs.current[idx]!.value = "";
                              }
                            } catch {
                              /* ignore */
                            }
                          } else {
                            // file cleared, revoke preview
                            setImagePreviews((prev) => {
                              const copy = [...prev];
                              if (copy[idx]) {
                                try {
                                  URL.revokeObjectURL(copy[idx]!);
                                } catch {
                                  /* ignore */
                                }
                              }
                              copy[idx] = null;
                              return copy;
                            });
                          }
                        }}
                        className="hidden"
                      />

                      {/* Clicking the label (image area) opens the file input */}
                      <label
                        htmlFor={`file-slot-${idx}`}
                        className="block w-full h-24 bg-transparent rounded overflow-hidden cursor-pointer"
                        title={
                          file
                            ? file.name ?? "Reemplazar imagen"
                            : url
                            ? "Reemplazar imagen"
                            : `Elegir imagen slot ${idx + 1}`
                        }
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {file ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getSafeImageUrl(imagePreviews[idx])}
                              alt={file.name}
                              className="w-full h-full object-contain bg-black/5"
                            />
                          ) : url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={getSafeImageUrl(url)}
                              alt={`img-${idx}`}
                              className="w-full h-full object-contain bg-black/5"
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Slot {idx + 1}
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Overlay X button to remove the image for this slot */}
                      {(file || url) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            // prevent the label click opening the file dialog
                            e.stopPropagation();
                            // clear the underlying input value so re-selecting the
                            // same filename later triggers onChange
                            try {
                              if (inputRefs.current[idx]) {
                                inputRefs.current[idx]!.value = "";
                              }
                            } catch {
                              /* ignore */
                            }
                            setImagesFiles((prev) => {
                              const copy = [...prev];
                              copy[idx] = null;
                              return copy;
                            });
                            setExistingImages((prev) => {
                              const copy = [...prev];
                              copy[idx] = null;
                              return copy;
                            });
                            // revoke and clear preview if any
                            setImagePreviews((prev) => {
                              const copy = [...prev];
                              if (copy[idx]) {
                                try {
                                  URL.revokeObjectURL(copy[idx]!);
                                } catch {
                                  /* ignore */
                                }
                              }
                              copy[idx] = null;
                              return copy;
                            });
                          }}
                          className="absolute top-1 right-1 z-10 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
                          aria-label={`Eliminar imagen slot ${idx + 1}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-amber-600 text-white rounded"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </form>
    </div>
  );
}
