import { supabase, supabaseAdmin } from "@/supabase";
import type { Database } from "@/types/database";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

const client = supabaseAdmin ?? supabase;

export async function listProperties(options?: {
  limit?: number;
  offset?: number;
}): Promise<PropertyRow[]> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  const from = offset;
  const to = offset + Math.max(0, limit - 1);

  const resp = await client!
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);
  const { data, error } = resp as { data: PropertyRow[] | null; error: any };

  if (error) throw new Error(error.message ?? String(error));
  return data ?? [];
}

export async function getPropertyById(id: string): Promise<PropertyRow | null> {
  const resp = await client!
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const { data, error } = resp as { data: PropertyRow | null; error: any };

  if (error) throw new Error(error.message ?? String(error));
  return data ?? null;
}

export async function createProperty(
  payload: PropertyInsert
): Promise<PropertyRow> {
  const resp = await client!
    .from("properties")
    .insert(payload)
    .select()
    .single();
  const { data, error } = resp as { data: PropertyRow | null; error: any };

  if (error) throw new Error(error.message ?? String(error));
  if (!data) throw new Error("Failed to create property");
  return data;
}

export async function updateProperty(
  id: string,
  payload: PropertyUpdate
): Promise<PropertyRow> {
  const resp = await client!
    .from("properties")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  const { data, error } = resp as { data: PropertyRow | null; error: any };

  if (error) throw new Error(error.message ?? String(error));
  if (!data) throw new Error("Failed to update property");
  return data;
}

export async function deleteProperty(id: string): Promise<PropertyRow> {
  const resp = await client!
    .from("properties")
    .delete()
    .eq("id", id)
    .select()
    .single();
  const { data, error } = resp as { data: PropertyRow | null; error: any };

  if (error) throw new Error(error.message ?? String(error));
  if (!data) throw new Error("Failed to delete property");
  return data;
}

export default {
  listProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
