import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/utils/config";

// Runtime sanity check: `config.ts` already throws on missing values, but
// TypeScript still types them as possibly undefined. Ensure they're present
// before creating clients in environments where `config.ts` might be bypassed.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase configuration missing (SUPABASE_URL or SUPABASE_ANON_KEY)"
  );
}

// Recreate clients with definite (string) types to satisfy TypeScript.
export const supabase = createClient(
  SUPABASE_URL as string,
  SUPABASE_ANON_KEY as string
);

export const supabaseAdmin = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : undefined;
