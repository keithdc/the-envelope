/**
 * SESSION + STORAGE CORE (mock)
 * =========================================================================
 * ⚠️ MOCK — NOT SECURE. Users and the session live in this browser's
 * localStorage, so anyone with dev tools can edit them. This exists only so
 * the admin UI can be built and reviewed before the backend. In production
 * the session is an HTTP-only cookie the browser JavaScript cannot read, and
 * every check below happens on the server (see BACKEND.md).
 *
 * Shared by authApi.js and activityApi.js (and invitationApi.js for
 * permission checks) so none of them import each other in a cycle.
 *
 * @typedef {import('@/types').User} User
 * @typedef {import('@/types').Permission} Permission
 */
import { can } from "../lib/permissions.js";

export const USERS_KEY = "envelope:users";
export const SESSION_KEY = "envelope:session";

export const hasLS = () =>
  typeof window !== "undefined" && !!window.localStorage;

export const readJSON = (key, fallback) => {
  if (!hasLS()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
export const writeJSON = (key, value) => {
  if (hasLS()) localStorage.setItem(key, JSON.stringify(value));
};

/** Strip password data — the only shape that ever leaves the services. */
export function toPublicUser(record) {
  if (!record) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, salt, ...user } = record;
  return user;
}

/**
 * The signed-in user, synchronously, or null if there's no valid session
 * (missing, expired, or the user is no longer active).
 * @returns {User|null}
 */
export function currentUserSync() {
  const session = readJSON(SESSION_KEY, null);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) return null;
  const users = readJSON(USERS_KEY, []);
  const record = users.find((u) => u.id === session.userId);
  if (!record || record.status !== "active") return null;
  return toPublicUser(record);
}

/** Throws unless signed in. @returns {User} */
export function requireUser() {
  const user = currentUserSync();
  if (!user) throw new Error("Please sign in again.");
  return user;
}

/**
 * Throws unless the signed-in user has `permission`. Mirrors the server-side
 * check the backend must perform on every request.
 * @param {Permission} permission
 * @returns {User}
 */
export function assertCan(permission) {
  const user = requireUser();
  if (!can(user, permission)) {
    throw new Error("You don't have permission to do that.");
  }
  return user;
}
