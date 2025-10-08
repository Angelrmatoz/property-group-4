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
  imagen?: string;
  amueblado?: boolean;
};

export async function createProperty(payload: CreatePropertyPayload) {
  const { data } = await api.post("/api/properties", payload);
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
