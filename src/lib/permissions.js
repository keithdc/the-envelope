/**
 * ROLES & PERMISSIONS (pure, no React, no storage)
 * -------------------------------------------------------------------------
 * The single source of truth for who may do what. The UI uses it to hide or
 * disable actions; the mock services use it to reject calls. The backend MUST
 * enforce the same matrix on every request — UI checks are convenience only.
 * (Mirrored as a table in BACKEND.md.)
 *
 * @typedef {import('@/types').User} User
 * @typedef {import('@/types').Role} Role
 * @typedef {import('@/types').Permission} Permission
 */

/** Display info per role, ordered most → least powerful. */
export const ROLES = {
  owner: {
    label: "Owner",
    description: "Everything, including users and business settings.",
  },
  admin: {
    label: "Admin",
    description: "Templates, projects, sharing and team members (not owners).",
  },
  designer: {
    label: "Designer",
    description: "Edits templates and projects. Can't publish, share or roll back.",
  },
};

/** @type {Record<Permission, Role[]>} */
export const PERMISSIONS = {
  "templates.edit": ["owner", "admin", "designer"],
  "templates.publish": ["owner", "admin"],
  "projects.edit": ["owner", "admin", "designer"],
  "projects.share": ["owner", "admin"],
  "versions.rollback": ["owner", "admin"],
  "users.view": ["owner", "admin"],
  "users.manage": ["owner", "admin"],
  "activity.view": ["owner", "admin"],
  "settings.business": ["owner"],
};

/**
 * May this user perform `permission`? Disabled/invited users may not.
 * @param {User|null|undefined} user
 * @param {Permission} permission
 */
export function can(user, permission) {
  if (!user || user.status !== "active") return false;
  return (PERMISSIONS[permission] ?? []).includes(user.role);
}

/**
 * May `actor` change `target`'s role or status?
 *  - needs users.manage
 *  - nobody changes their own role/status (prevents self-lockout)
 *  - only an owner may change an owner
 * @param {User|null|undefined} actor
 * @param {User} target
 */
export function canManageUser(actor, target) {
  if (!can(actor, "users.manage")) return false;
  if (actor.id === target.id) return false;
  if (target.role === "owner" && actor.role !== "owner") return false;
  return true;
}

/**
 * Roles `actor` may assign. Only owners can create/promote owners.
 * @param {User|null|undefined} actor
 * @returns {Role[]}
 */
export function assignableRoles(actor) {
  if (!can(actor, "users.manage")) return [];
  return actor.role === "owner"
    ? ["owner", "admin", "designer"]
    : ["admin", "designer"];
}
