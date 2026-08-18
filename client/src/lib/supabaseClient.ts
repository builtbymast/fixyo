import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // createClient() throws synchronously on an empty URL, which would crash the
  // whole bundle at import time (main.tsx -> AuthProvider -> here) and white-screen
  // every route. Fall back to a well-formed placeholder so the SDK constructs
  // successfully; auth calls will simply fail at the network layer instead.
  console.error(
    "Auth is not configured: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing from this environment."
  );
}

export const supabase = createClient(
  supabaseUrl || "https://misconfigured.supabase.co",
  supabaseAnonKey || "misconfigured-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
