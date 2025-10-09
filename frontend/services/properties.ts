import api from "@/lib/axios";

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
  amueblado?: boolean;
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
    // Let the browser set Content-Type (including boundary)
    headers: { "Content-Type": "multipart/form-data" },
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
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export async function getProperties() {
  const { data } = await api.get("/api/properties");
  return data;
}

export async function getPropertyById(id: string) {
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
  const { data } = await api.delete(`/api/properties/${id}`);
  return data;
}
