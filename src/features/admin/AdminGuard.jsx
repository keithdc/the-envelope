"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider.jsx";

/**
 * Renders admin pages only for a signed-in user; otherwise sends them to
 * /login?next=<this page>.
 *
 * ⚠️ This is a UX guard, not security: it runs in the browser and can be
 * bypassed. The backend must also check the session server-side — in Next.js
 * middleware for /admin/* and in every admin API route (see BACKEND.md).
 */
export default function AdminGuard({ children }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anon") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status !== "authed") {
    return (
      <div className="builder-loading" role="status">
        {status === "loading" ? "Checking your session…" : "Redirecting to sign in…"}
      </div>
    );
  }
  return children;
}

/**
 * Shows `children` only if the user has `permission`; otherwise a friendly
 * "no access" message. Use for whole admin pages (Users, Activity…).
 */
export function RequirePermission({ permission, children }) {
  const { can } = useAuth();
  if (can(permission)) return children;
  return (
    <div className="a-empty" role="status">
      <p className="a-empty-title">You don't have access to this page</p>
      <p>Ask an owner or admin if you need it.</p>
    </div>
  );
}
