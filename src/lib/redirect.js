/**
 * Safe post-login redirect target.
 * -------------------------------------------------------------------------
 * `/login?next=…` must only ever send people back into the admin area.
 * Anything else — absolute URLs, protocol-relative `//evil.site`, backslash
 * tricks, other paths — falls back to /admin. This prevents an "open
 * redirect" where a crafted login link forwards users to a phishing site.
 * The backend must apply the same rule if it ever handles redirects.
 *
 * @param {string|null|undefined} next
 * @returns {string}
 */
export function safeAdminPath(next) {
  const fallback = "/admin";
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/admin")) return fallback;
  if (next.startsWith("//") || next.includes("\\")) return fallback;
  // "/administrator" etc. must not slip through
  const rest = next.slice("/admin".length);
  if (rest && !/^[/?#]/.test(rest)) return fallback;
  return next;
}
