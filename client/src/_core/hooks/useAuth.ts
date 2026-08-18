import { supabase } from "@/lib/supabaseClient";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/sign-in" } =
    options ?? {};
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

  const state = useMemo(() => {
    return {
      user: hasSession ? meQuery.data ?? null : null,
      loading: sessionLoading || (hasSession && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: hasSession && Boolean(meQuery.data),
    };
  }, [hasSession, sessionLoading, meQuery.data, meQuery.isLoading, meQuery.error]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
