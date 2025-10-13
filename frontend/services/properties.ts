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
// When files are present, this function bypasses the Next.js proxy and sends
// directly to the backend to avoid Vercel's 4.5MB function payload limit.
export async function createPropertyFormData(
  payload: CreatePropertyPayload,
  files?: File[]
) {
  console.log("📦 [SERVICE] Creando FormData...");
  const fd = new FormData();

  // Append scalar fields
  console.log("📝 [SERVICE] Agregando campos al FormData:");
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Arrays / objects should be stringified if needed
    const strValue = String(value);
    console.log(`  - ${key}: ${strValue}`);
    fd.append(key, strValue);
  });

  // Append files using the 'images' key multiple times
  if (files && files.length) {
    console.log(`📸 [SERVICE] Agregando ${files.length} archivos al FormData:`);
    files.forEach((f, idx) => {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
      console.log(`  [${idx + 1}] ${f.name} - ${sizeMB} MB - ${f.type}`);
      fd.append("images", f);
    });
  }

  // When uploading files, bypass the Next.js proxy to avoid Vercel's 4.5MB limit
  // and send directly to the backend Express server
  const directBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const useDirectUpload = files && files.length > 0 && directBackendUrl;

  if (useDirectUpload) {
    console.log(
      `🚀 [SERVICE] Usando upload directo al backend: ${directBackendUrl}`
    );
    console.log(
      `   (Bypass del proxy de Next.js para evitar límite de Vercel)`
    );

    const startTime = Date.now();

    try {
      // When doing direct upload, get CSRF token directly from backend
      // (not from Next.js proxy) so the token matches the backend's _csrf cookie
      console.log("🔐 [SERVICE] Obteniendo CSRF token del backend directo...");
      console.log(`📍 [SERVICE] URL del token: ${directBackendUrl}/api/csrf-token`);
      console.log("🍪 [SERVICE] Cookies antes de fetch:", document.cookie);
      
      const csrfRes = await fetch(`${directBackendUrl}/api/csrf-token`, {
        credentials: "include", // Important: receive and store _csrf cookie
      });
      let csrfToken = "";
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken || "";
        console.log("✅ [SERVICE] CSRF token obtenido del backend:", csrfToken);
        console.log("🍪 [SERVICE] Cookies después de fetch:", document.cookie);
      } else {
        console.warn("⚠️ [SERVICE] No se pudo obtener CSRF token");
      }

      // Send directly to backend with credentials
      console.log("🌐 [SERVICE] Enviando POST directo a backend...");
      const response = await fetch(`${directBackendUrl}/api/properties`, {
        method: "POST",
        body: fd,
        credentials: "include", // Important: send cookies with the request
        headers: {
          ...(csrfToken && { "x-csrf-token": csrfToken }),
        },
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (!response.ok) {
        console.error(
          `❌ [SERVICE] Error ${response.status} después de ${duration}s`
        );
        const errorText = await response.text();
        console.error(`❌ [SERVICE] Error body:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP Error: ${response.status}` };
        }

        const error: any = new Error(
          errorData.error || `HTTP Error: ${response.status}`
        );
        error.response = { status: response.status, data: errorData };
        throw error;
      }

      const data = await response.json();
      console.log(`✅ [SERVICE] Respuesta recibida en ${duration}s:`, data);
      return data;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ [SERVICE] Error después de ${duration}s:`, error);
      throw error;
    }
  }

  // Fallback to Next.js proxy for requests without files
  console.log(
    "🌐 [SERVICE] Enviando POST a /api/properties (via proxy Next.js)..."
  );
  const startTime = Date.now();

  try {
    const { data } = await api.post("/api/properties", fd, {
      // Let the browser set Content-Type (including boundary). Do NOT set
      // Content-Type manually or fetch will omit the boundary which breaks
      // multipart requests.
      // headers: { "Content-Type": "multipart/form-data" },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [SERVICE] Respuesta recibida en ${duration}s:`, data);

    return data;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ [SERVICE] Error después de ${duration}s:`, error);
    throw error;
  }
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
  // When executing on the server (Next server components / SSR), call backend directly
  // In the browser, use relative URLs through our fetch wrapper which goes through Next.js proxy
  if (typeof window === "undefined") {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL is not configured");
    }

    try {
      const res = await fetch(`${backendUrl}/api/properties`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[SSR] Failed to fetch properties:", errorData);
        throw new Error(errorData.message || "Failed to fetch properties");
      }
      return res.json();
    } catch (error) {
      console.error("[SSR] Error fetching properties:", error);
      throw error;
    }
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
  // When executing on the server (Next server components / SSR), call backend directly
  // In the browser, use relative URLs through our fetch wrapper which goes through Next.js proxy
  if (typeof window === "undefined") {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      console.error("[SSR] BACKEND_URL is not configured");
      return null as any;
    }

    try {
      const res = await fetch(`${backendUrl}/api/properties/${id}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.error(
          `[SSR] Failed to fetch property ${id}: ${res.status} ${res.statusText}`
        );
        return null as any;
      }
      return res.json();
    } catch (error) {
      console.error(`[SSR] Error fetching property ${id}:`, error);
      return null as any;
    }
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
