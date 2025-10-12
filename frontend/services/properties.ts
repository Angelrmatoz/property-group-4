import api from "@/lib/fetch";

export type CreatePropertyPayload = {
  titulo: string;
  descripcion: string;
  precio: number;
  provincia: string;
  municipio: string;
  sector?: string;
  habitaciones?: number;
  banos?: number;
  mediosBanos?: number;
  parqueos?: number;
  construccion?: number;
  // accept 'yes'|'no' for explicitness, but boolean is still allowed for
  // convenience. The backend will normalize to 'yes'/'no'.
  amueblado?: "yes" | "no" | boolean;
};

export async function createProperty(payload: CreatePropertyPayload) {
  const { data } = await api.post("/api/properties", payload);
  return data;
}

// Create property with files (multipart/form-data). `files` should be an array
// of File objects (images). Backend should accept files under the key `images`.
export async function createPropertyFormData(
  payload: CreatePropertyPayload,
  files?: File[]
) {
  const fd = new FormData();
  // Append scalar fields
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Arrays / objects should be stringified if needed
    fd.append(key, String(value));
  });

  // Append files using the 'images' key multiple times
  if (files && files.length) {
    files.forEach((f) => fd.append("images", f));
  }

  const { data } = await api.post("/api/properties", fd, {
    // Let the browser set Content-Type (including boundary). Do NOT set
    // Content-Type manually or fetch will omit the boundary which breaks
    // multipart requests.
    // headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

// Update property with files (multipart/form-data). Similar to createPropertyFormData
export async function updatePropertyFormData(
  id: string,
  payload: Partial<CreatePropertyPayload>,
  files?: File[]
) {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });

  // If payload.images is an array (existing image URLs), append them as 'images[]' entries
  if ((payload as any).images && Array.isArray((payload as any).images)) {
    (payload as any).images.forEach((img: string) =>
      fd.append("images[]", img)
    );
  }

  if (files && files.length) {
    files.forEach((f) => fd.append("images", f));
  }

  const { data } = await api.put(`/api/properties/${id}`, fd, {
    // Let the browser set the Content-Type header so the multipart boundary
    // is included. See note above in createPropertyFormData.
    // headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getProperties() {
  // When executing on the server (Next server components / SSR), use an absolute
  // URL pointing to the Next.js server (frontend) which will proxy to backend.
  // In the browser, use relative URLs through our fetch wrapper.
  if (typeof window === "undefined") {
    // For SSR, use localhost to call the Next.js frontend API routes
    // which will then proxy to BACKEND_URL
    const base = `http://localhost:${process.env.PORT || 3000}`;
    const url = new URL(`/api/properties`, base).toString();
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch properties");
    }
    return res.json();
  }

  try {
    const { data } = await api.get("/api/properties");
    return data;
  } catch (error: any) {
    // If it's a 502 error, the backend is likely cold starting
    if (error?.status === 502) {
      throw new Error(
        "El servidor está iniciando. Por favor, intenta de nuevo en unos segundos."
      );
    }
    throw error;
  }
}

export async function getPropertyById(id: string) {
  // Use absolute URL on the server (pointing to Next.js frontend) and relative URL in the browser
  if (typeof window === "undefined") {
    // For SSR, use localhost to call the Next.js frontend API routes
    // which will then proxy to BACKEND_URL (https://property-group-4.onrender.com)
    const base = `http://localhost:${process.env.PORT || 3000}`;
    const url = new URL(`/api/properties/${id}`, base).toString();
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch property");
    return res.json();
  }

  const { data } = await api.get(`/api/properties/${id}`);
  return data;
}

export async function updateProperty(
  id: string,
  payload: Partial<CreatePropertyPayload>
) {
  const { data } = await api.put(`/api/properties/${id}`, payload);
  return data;
}

export async function deleteProperty(id: string) {
  // Treat 404 as an idempotent success (resource already removed).
  const res = await api.delete(`/api/properties/${id}`, {
    throwOnError: false,
  });
  // If backend returned 404, return null to indicate nothing to delete
  if (res.status === 404) return null;
  return res.data;
}
