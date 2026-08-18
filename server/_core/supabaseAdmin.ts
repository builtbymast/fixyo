import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

// Lazy, same reasoning as getStripe(): a missing key shouldn't crash the
// process at import time, only when auth is actually exercised.
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
      throw new Error(
        "Auth is not configured: VITE_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are missing."
      );
    }
    _supabaseAdmin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}
