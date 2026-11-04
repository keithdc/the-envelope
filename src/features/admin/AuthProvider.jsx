"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSession, logout } from "../../services/authApi.js";
import { can as canFn } from "../../lib/permissions.js";

/**
 * Admin session context.
 *   status: "loading" | "authed" | "anon"
 *   user:   the signed-in User (never password data)
 *   can(permission), refresh(), signOut()
 *
 * Re-checks the session when the tab regains focus, every minute (expiry),
 * and when another tab signs in/out (storage event) — so a session that
 * ends anywhere ends here too. With the backend, refresh() calls
 * GET /api/auth/session; nothing else here changes.
 */
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    const user = await getSession();
    setState({ status: user ? "authed" : "anon", user });
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onStorage = (e) => {
      if (!e.key || e.key.startsWith("envelope:session") || e.key.startsWith("envelope:users")) {
        refresh();
      }
    };
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await logout();
    setState({ status: "anon", user: null });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refresh,
      signOut,
      can: (permission) => canFn(state.user, permission),
    }),
    [state, refresh, signOut],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** @returns {{status:string, user:any, can:(p:string)=>boolean, refresh:()=>Promise<void>, signOut:()=>Promise<void>}} */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
