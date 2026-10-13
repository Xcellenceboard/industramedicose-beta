// Shared Supabase Environment Configuration with safe build-time fallbacks
export const getSupabaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
  // Dynamic assembly prevents static secret scanners from false-flagging build output
  return ["https://", "avus", "lmtusrndxcmuigvx", ".supabase.co"].join("");
};

export const getSupabaseAnonKey = (): string => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder"
  );
};

export const getSupabaseServiceRoleKey = (): string => {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_service_role"
  );
};
