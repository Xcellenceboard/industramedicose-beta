import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "./config";

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient must only be executed on the server side.");
  }

  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
