/**
 * AUTH, USERS & SETTINGS API (mock)
 * =========================================================================
 * ⚠️ MOCK — NOT SECURE. Everything here runs in the browser on localStorage
 * so the admin UI can be built before the backend. Function names and shapes
 * match the real endpoints (BACKEND.md), so swapping to fetch() changes only
 * this file — callers stay the same.
 *
 * Future backend mapping:
 *   login(email, password)          -> POST   /api/auth/login        (sets HTTP-only cookie)
 *   logout()                        -> POST   /api/auth/logout
 *   getSession()                    -> GET    /api/auth/session
 *   requestPasswordReset(email)     -> POST   /api/auth/password/forgot
 *   changePassword(current, next)   -> POST   /api/auth/password/change
 *   updateProfile({ name })         -> PATCH  /api/me
 *   listUsers()                     -> GET    /api/users               (users.view)
 *   inviteUser({ email,name,role }) -> POST   /api/users/invite        (users.manage)
 *   updateUser(id, { role,status }) -> PATCH  /api/users/:id           (users.manage)
 *   getSettings()                   -> GET    /api/settings
 *   saveSettings(settings)          -> PUT    /api/settings            (settings.business)
 *
 * @typedef {import('@/types').User} User
 * @typedef {import('@/types').Role} Role
 * @typedef {import('@/types').AppSettings} AppSettings
 */
import { assignableRoles, canManageUser } from "../lib/permissions.js";
import {
  USERS_KEY,
  SESSION_KEY,
  hasLS,
  readJSON,
  writeJSON,
  toPublicUser,
  currentUserSync,
  requireUser,
  assertCan,
} from "./session.js";
import { logActivity } from "./activityApi.js";

const SETTINGS_KEY = "envelope:settings";
const SESSION_HOURS = 8;
const MIN_PASSWORD = 8;
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const nowISO = () => new Date().toISOString();
const randomHex = (bytes) =>
  [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const normEmail = (e) =>
  String(e ?? "")
    .trim()
    .toLowerCase();

/* ---------------------------------------------------------------- */
/* DEMO ACCOUNTS (mock only — shown on the login page)               */
/* ---------------------------------------------------------------- */

export const DEMO_PASSWORD = "envelope123";
export const DEMO_ACCOUNTS = [
  { email: "owner@envelope.test", name: "Olivia Owner", role: "owner" },
  { email: "admin@envelope.test", name: "Adam Admin", role: "admin" },
  { email: "designer@envelope.test", name: "Dana Designer", role: "designer" },
];

/** True while the app runs on these mocks (used for warning banners). */
export const IS_MOCK_AUTH = true;

/**
 * Mock password hash: salted SHA-256 so the store never holds plaintext.
 * NOT acceptable in production — the backend must use argon2id or bcrypt.
 */
async function hashPassword(password, salt) {
  // crypto.subtle exists only in secure contexts (https or localhost). Opening
  // the dev server via a LAN address like http://192.168.x.x has no subtle.
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Mock sign-in needs https or http://localhost (not a network IP address).",
    );
  }
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function makeRecord({ email, name, role, status, password, invitedBy }) {
  const salt = randomHex(16);
  return {
    id: `usr_${randomHex(6)}`,
    email: normEmail(email),
    name: name.trim(),
    role,
    status,
    createdAt: nowISO(),
    invitedBy,
    salt,
    passwordHash: await hashPassword(password, salt),
  };
}

let seeding = null;
/** Seed the demo accounts on first use (async: hashing is async). */
function ensureUsers() {
  if (!hasLS()) return Promise.resolve();
  if (readJSON(USERS_KEY, []).length) return Promise.resolve();
  seeding ??= (async () => {
    const records = [];
    for (const a of DEMO_ACCOUNTS) {
      records.push(
        await makeRecord({ ...a, status: "active", password: DEMO_PASSWORD }),
      );
    }
    writeJSON(USERS_KEY, records);
  })();
  return seeding;
}

const readUsers = () => readJSON(USERS_KEY, []);
const writeUsers = (users) => writeJSON(USERS_KEY, users);

/* ---------------------------------------------------------------- */
/* SESSION                                                           */
/* ---------------------------------------------------------------- */

/**
 * Sign in. The same error is used for "no such user", "wrong password" and
 * "disabled" so the form never reveals which emails have accounts.
 * @returns {Promise<User>}
 */
export async function login(email, password) {
  await ensureUsers();
  await delay(400);
  const users = readUsers();
  const record = users.find((u) => u.email === normEmail(email));
  const ok =
    record &&
    record.status !== "disabled" &&
    (await hashPassword(String(password ?? ""), record.salt)) ===
      record.passwordHash;
  if (!ok) throw new Error("Incorrect email or password.");

  // first sign-in of an invited user activates the account
  if (record.status === "invited") record.status = "active";
  record.lastLoginAt = nowISO();
  writeUsers(users);

  const issued = Date.now();
  writeJSON(SESSION_KEY, {
    userId: record.id,
    issuedAt: new Date(issued).toISOString(),
    expiresAt: new Date(issued + SESSION_HOURS * 3600_000).toISOString(),
  });
  const user = toPublicUser(record);
  logActivity({ action: "auth.login" }, user);
  return user;
}

export async function logout() {
  await delay(100);
  const user = currentUserSync();
  if (user) logActivity({ action: "auth.logout" }, user);
  if (hasLS()) localStorage.removeItem(SESSION_KEY);
}

/** The signed-in user, or null. @returns {Promise<User|null>} */
export async function getSession() {
  await ensureUsers();
  await delay(80);
  return currentUserSync();
}

/**
 * Always "succeeds" — whether or not the email exists — so attackers can't
 * use it to discover accounts. The backend emails a one-time reset link.
 */
export async function requestPasswordReset(email) {
  await delay(500);
  void email;
  return { ok: true };
}

export async function changePassword(currentPassword, newPassword) {
  await delay();
  const me = requireUser();
  if (String(newPassword ?? "").length < MIN_PASSWORD) {
    throw new Error(
      `New password must be at least ${MIN_PASSWORD} characters.`,
    );
  }
  const users = readUsers();
  const record = users.find((u) => u.id === me.id);
  if (
    (await hashPassword(String(currentPassword ?? ""), record.salt)) !==
    record.passwordHash
  ) {
    throw new Error("Your current password is incorrect.");
  }
  record.salt = randomHex(16);
  record.passwordHash = await hashPassword(newPassword, record.salt);
  writeUsers(users);
  logActivity({
    action: "auth.password_changed",
    targetKind: "user",
    targetId: me.id,
    targetTitle: me.name,
  });
  return { ok: true };
}

/** @returns {Promise<User>} */
export async function updateProfile({ name }) {
  await delay();
  const me = requireUser();
  const clean = String(name ?? "").trim();
  if (!clean) throw new Error("Name can't be empty.");
  const users = readUsers();
  const record = users.find((u) => u.id === me.id);
  record.name = clean;
  writeUsers(users);
  logActivity({
    action: "profile.updated",
    targetKind: "user",
    targetId: me.id,
    targetTitle: clean,
  });
  return toPublicUser(record);
}

/* ---------------------------------------------------------------- */
/* USERS (team management)                                           */
/* ---------------------------------------------------------------- */

/** @returns {Promise<User[]>} */
export async function listUsers() {
  await ensureUsers();
  await delay();
  assertCan("users.view");
  return readUsers().map(toPublicUser);
}

/**
 * Invite a teammate. The mock returns a temporary password to show once;
 * the backend instead emails a one-time "set your password" link.
 * @returns {Promise<{ user: User, tempPassword: string }>}
 */
export async function inviteUser({ email, name, role }) {
  await delay();
  const actor = assertCan("users.manage");
  const cleanEmail = normEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("Enter a valid email address.");
  }
  if (!String(name ?? "").trim()) throw new Error("Enter a name.");
  if (!assignableRoles(actor).includes(role)) {
    throw new Error("You can't assign that role.");
  }
  const users = readUsers();
  if (users.some((u) => u.email === cleanEmail)) {
    throw new Error("Someone with that email is already on the team.");
  }
  const tempPassword = `tmp-${randomHex(5)}`;
  const record = await makeRecord({
    email: cleanEmail,
    name,
    role,
    status: "invited",
    password: tempPassword,
    invitedBy: actor.id,
  });
  users.push(record);
  writeUsers(users);
  const user = toPublicUser(record);
  logActivity({
    action: "user.invited",
    targetKind: "user",
    targetId: user.id,
    targetTitle: user.name,
    detail: role,
  });
  return { user, tempPassword };
}

/**
 * Change a teammate's role and/or status. Users are never deleted —
 * disabling keeps their history in the activity log.
 * @param {string} id
 * @param {{ role?: Role, status?: 'active'|'disabled' }} patch
 * @returns {Promise<User>}
 */
export async function updateUser(id, { role, status }) {
  await delay();
  const actor = requireUser();
  const users = readUsers();
  const record = users.find((u) => u.id === id);
  if (!record) throw new Error("User not found.");
  if (!canManageUser(actor, toPublicUser(record))) {
    throw new Error("You can't change this user.");
  }
  if (role && !assignableRoles(actor).includes(role)) {
    throw new Error("You can't assign that role.");
  }

  // never leave the workspace without an active owner
  const wasActiveOwner = record.role === "owner" && record.status === "active";
  const willBeActiveOwner =
    (role ?? record.role) === "owner" && (status ?? record.status) === "active";
  if (wasActiveOwner && !willBeActiveOwner) {
    const owners = users.filter(
      (u) => u.role === "owner" && u.status === "active",
    );
    if (owners.length <= 1)
      throw new Error("There must be at least one active owner.");
  }

  if (role && role !== record.role) {
    logActivity({
      action: "user.role_changed",
      targetKind: "user",
      targetId: id,
      targetTitle: record.name,
      detail: `${record.role} → ${role}`,
    });
    record.role = role;
  }
  if (status && status !== record.status) {
    logActivity({
      action: status === "disabled" ? "user.disabled" : "user.enabled",
      targetKind: "user",
      targetId: id,
      targetTitle: record.name,
    });
    record.status = status;
  }
  writeUsers(users);
  return toPublicUser(record);
}

/* ---------------------------------------------------------------- */
/* SETTINGS                                                          */
/* ---------------------------------------------------------------- */

/** @type {AppSettings} */
const DEFAULT_SETTINGS = {
  business: { brandName: "The Envelope", contactEmail: "", phone: "" },
  sharing: { defaultLinkDays: null },
};

/** @returns {Promise<AppSettings>} */
export async function getSettings() {
  await delay(120);
  requireUser();
  const saved = readJSON(SETTINGS_KEY, {});
  return {
    business: { ...DEFAULT_SETTINGS.business, ...saved.business },
    sharing: { ...DEFAULT_SETTINGS.sharing, ...saved.sharing },
  };
}

/** @param {AppSettings} settings @returns {Promise<AppSettings>} */
export async function saveSettings(settings) {
  await delay();
  assertCan("settings.business");
  const email = settings.business.contactEmail.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid contact email.");
  }
  const days = settings.sharing.defaultLinkDays;
  if (days !== null && !(Number.isInteger(days) && days > 0 && days <= 3650)) {
    throw new Error("Link lifetime must be a whole number of days (1–3650).");
  }
  writeJSON(SETTINGS_KEY, settings);
  logActivity({
    action: "settings.updated",
    targetKind: "settings",
    targetTitle: "Workspace settings",
  });
  return settings;
}
