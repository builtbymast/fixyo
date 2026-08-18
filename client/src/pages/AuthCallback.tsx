import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

// Landing page for Google OAuth and magic-link redirects. The Supabase
// client picks up the session from the URL automatically
// (detectSessionInUrl), we just wait for it and move on.
export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    let cancelled = false;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session) navigate("/app/dashboard");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) navigate("/app/dashboard");
    });

    const timeout = setTimeout(() => {
      if (!cancelled) navigate("/sign-in");
    }, 8000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
