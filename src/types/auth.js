/**
 * AUTH, USERS, ACTIVITY & SETTINGS INTERFACES
 * =========================================================================
 * JSDoc typedefs for the admin (staff) user system. These describe exactly
 * what the future backend returns — see BACKEND.md for the database schema
 * and endpoints that implement them.
 *
 * Reference with:  @type {import('@/types').User}
 * Nothing is exported at runtime.
 */

/**
 * Staff role. Permissions per role live in lib/permissions.js.
 *   owner    — everything, including users and business settings
 *   admin    — templates, projects, sharing, users (except owners)
 *   designer — edit templates/projects; cannot publish, share, or roll back
 * @typedef {('owner'|'admin'|'designer')} Role
 */

/**
 * @typedef {('active'|'invited'|'disabled')} UserStatus
 *   invited  — account created, has not signed in yet
 *   disabled — cannot sign in; history is kept (users are never deleted)
 */

/**
 * A staff user as the API returns it. Never includes password data.
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email        unique, stored lowercase
 * @property {string} name
 * @property {Role} role
 * @property {UserStatus} status
 * @property {string} createdAt    ISO
 * @property {string} [lastLoginAt] ISO
 * @property {string} [invitedBy]  user id of the inviter
 */

/**
 * A signed-in session. Backend: an HTTP-only cookie holding an opaque id;
 * the server stores this record.
 * @typedef {Object} Session
 * @property {string} userId
 * @property {string} issuedAt   ISO
 * @property {string} expiresAt  ISO
 */

/**
 * Something a staff user did. Append-only, recorded server-side.
 * @typedef {('auth.login'|'auth.logout'|'auth.password_changed'|
 *   'user.invited'|'user.role_changed'|'user.disabled'|'user.enabled'|
 *   'profile.updated'|'settings.updated'|
 *   'template.created'|'template.saved'|'template.published'|
 *   'project.created'|'project.saved'|'version.rolled_back'|
 *   'share.created'|'share.regenerated'|'share.stopped')} ActivityAction
 */

/**
 * @typedef {Object} ActivityEvent
 * @property {string} id
 * @property {string} at            ISO
 * @property {string} actorId
 * @property {string} actorName     denormalized for display
 * @property {ActivityAction} action
 * @property {('user'|'template'|'project'|'settings')} [targetKind]
 * @property {string} [targetId]
 * @property {string} [targetTitle]
 * @property {string} [detail]      short human note, e.g. "designer → admin"
 */

/**
 * Workspace-wide settings (owner-editable).
 * @typedef {Object} AppSettings
 * @property {{brandName:string, contactEmail:string, phone:string}} business
 * @property {{defaultLinkDays:(number|null)}} sharing  null = links never expire
 */

/**
 * A permission key checked by can(). See lib/permissions.js.
 * @typedef {('templates.edit'|'templates.publish'|'projects.edit'|
 *   'projects.share'|'versions.rollback'|'users.view'|'users.manage'|
 *   'activity.view'|'settings.business')} Permission
 */

export {};
