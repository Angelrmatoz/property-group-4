import dotenv from "dotenv";
dotenv.config();

export const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://yokkrjigfidiywdwonhx.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");
if (!SUPABASE_ANON_KEY)
  throw new Error("Missing SUPABASE_ANON_KEY (or SUPABASE_KEY)");
if (!DATABASE_URL)
  console.warn("DATABASE_URL is not set (some features may fail)");

export { PORT };