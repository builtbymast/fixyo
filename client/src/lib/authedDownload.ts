import { supabase } from "@/lib/supabaseClient";

// GET download links (PDF export) can't carry an Authorization header, so
// the access token goes as a query param instead (server/_core/auth.ts
// accepts both).
export async function openAuthedDownload(path: string) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const url = token ? `${path}?token=${encodeURIComponent(token)}` : path;
  window.open(url, "_blank", "noopener,noreferrer");
}
