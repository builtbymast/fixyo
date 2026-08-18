import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Landing page for Google OAuth and magic-link redirects. The Supabase
// client picks up the session from the URL automatically
// (detectSessionInUrl). We wait for useAuth -- the same hook the
// protected-route guard reads -- to confirm the session before navigating,
// rather than navigating off a locally-owned listener that could race it.
export default function AuthCallback() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      navigate("/app/dashboard");
    }
  }, [isAuthenticated, user, loading, navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) navigate("/sign-in");
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
