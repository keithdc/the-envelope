"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "./AuthProvider.jsx";
import { ROLES } from "../../lib/permissions.js";
import { IS_MOCK_AUTH } from "../../services/authApi.js";
import "./admin.css";

const NAV = [
  { href: "/admin", label: "Designs", icon: LayoutGrid },
  { href: "/admin/users", label: "Team", icon: Users, permission: "users.view" },
  { href: "/admin/activity", label: "Activity", icon: Activity, permission: "activity.view" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "?";

/**
 * Admin chrome: sidebar navigation (filtered by permission), the signed-in
 * user with sign-out, and a mock-auth warning. Collapses to a top bar with
 * a menu button on small screens. The full-screen builder does NOT use it.
 */
export default function AdminShell({ children }) {
  const { user, can, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const active = (href) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="a-shell">
      <header className="a-topbar">
        <button
          type="button"
          className="a-icon-btn"
          aria-expanded={open}
          aria-controls="admin-sidebar"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="a-brand">✉ Studio</span>
      </header>

      <aside id="admin-sidebar" className={`a-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/admin" className="a-brand a-brand--side">
          <span className="a-brand-mark" aria-hidden="true">✉</span> Studio
        </Link>

        <nav className="a-nav" aria-label="Admin">
          {NAV.filter((n) => !n.permission || can(n.permission)).map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active(n.href) ? "is-active" : ""}
                aria-current={active(n.href) ? "page" : undefined}
              >
                <Icon size={17} aria-hidden="true" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {IS_MOCK_AUTH && (
          <p className="a-mock">
            <ShieldAlert size={14} aria-hidden="true" />
            Mock sign-in · not secure. Data stays in this browser.
          </p>
        )}

        {user && (
          <div className="a-me">
            <span className="a-avatar" aria-hidden="true">{initials(user.name)}</span>
            <span className="a-me-text">
              <strong>{user.name}</strong>
              <span>{ROLES[user.role]?.label}</span>
            </span>
            <button
              type="button"
              className="a-icon-btn"
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </aside>

      {open && <div className="a-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="a-main">{children}</div>
    </div>
  );
}
