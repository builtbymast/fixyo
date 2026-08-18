import { supabase } from "@/lib/supabaseClient";
import { trpc } from "@/lib/trpc";
import type { User } from "../../../../drizzle/schema";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: unknown;
  isAuthenticated: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

// Single source of truth for auth state: one Supabase session subscription,
// one trpc.auth.me query. Every useAuth() call reads the SAME state object,
// so there's no risk of two independent listeners (e.g. one on the sign-in
// page, one in the route guard) updating on different render ticks.
export function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
      setSessionLoading(false);
      utils.auth.me.invalidate();
    });

    return () => listener.subscription.unsubscribe();
  }, [utils]);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: hasSession,
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.auth.me.setData(undefined, null);
    await logoutMutation.mutateAsync().catch(() => {});
  }, [logoutMutation, utils]);

  const state = useMemo<AuthState>(() => {
    return {
      user: hasSession ? meQuery.data ?? null : null,
      loading: sessionLoading || (hasSession && meQuery.isPending),
      error: meQuery.error ?? null,
      isAuthenticated: hasSession && Boolean(meQuery.data),
      refresh: () => meQuery.refetch(),
      logout,
    };
  }, [hasSession, sessionLoading, meQuery.data, meQuery.isPending, meQuery.error, logout]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/sign-in" } =
    options ?? {};
  const state = useContext(AuthContext);
  if (!state) {
    throw new Error("useAuth() must be used within <AuthProvider>");
  }

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return state;
}
