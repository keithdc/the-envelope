# Backend handoff

Everything the backend must provide so the app can drop its browser mocks.
The UI already talks to **service modules** whose function names and shapes
match the endpoints below. Moving to the backend means rewriting those service
files to call `fetch()`. Components don't change.

> **Today: everything is a mock.** Data, users, sessions and permission checks
> run in the browser on `localStorage`. That is **not secure** (anyone can
> edit it in dev tools) and **not shared** (each browser has its own copy,
> which is also why a client can't open a share link on their own phone).
> Every rule marked **[server]** below must be enforced on the server. UI checks
> exist only for convenience.

---

## 1. Service map (mock → backend)

| Mock file (`src/services/`) | Owns | Swap to |
|---|---|---|
| `invitationApi.js` | templates, projects, versions, sharing, assets, categories | `/api/templates`, `/api/projects`, `/api/documents`, `/api/invite`, `/api/assets`, `/api/categories` |
| `authApi.js` | login/logout/session, password, profile, users, settings | `/api/auth/*`, `/api/me`, `/api/users`, `/api/settings` |
| `activityApi.js` | activity log (read) | `/api/activity` |
| `session.js` | mock-only storage + `currentUserSync` / `assertCan` | **deleted**. The server reads the session cookie instead |
| `mockStore.js`, `mockDocument.js`, `categories.js` | seed data | database seed / migration |

Interfaces for every payload: `src/types/` (`document.js`, `auth.js`,
`invitation.js`). Permission matrix: `src/lib/permissions.js` (import the same
logic on the server, or mirror the table in §4).

---

## 2. Data model (PostgreSQL sketch)

```sql
-- staff users (never deleted; disable instead)
create table users (
  id            text primary key,              -- e.g. usr_…
  email         citext unique not null,        -- stored lowercase
  name          text not null,
  role          text not null check (role in ('owner','admin','designer')),
  status        text not null check (status in ('active','invited','disabled')),
  password_hash text,                          -- argon2id; null until invite accepted
  invited_by    text references users(id),
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- server-side sessions (cookie holds only the opaque id)
create table sessions (
  id          text primary key,                -- 256-bit random
  user_id     text not null references users(id),
  issued_at   timestamptz not null default now(),
  expires_at  timestamptz not null,
  ip          inet,
  user_agent  text
);

-- one-time tokens for invites and password resets (store HASHES only)
create table auth_tokens (
  token_hash  text primary key,
  user_id     text not null references users(id),
  purpose     text not null check (purpose in ('invite','reset')),
  expires_at  timestamptz not null,            -- invite 7d, reset 1h
  used_at     timestamptz
);

create table categories (
  id     text primary key,                     -- "wedding"
  label  text not null,
  icon   text,
  "order" int not null default 0
);

-- templates AND projects (InvitationDocument), discriminated by kind
create table documents (
  id                 text primary key,
  kind               text not null check (kind in ('template','project')),
  category_id        text not null references categories(id),
  title              text not null,
  status             text not null,            -- template: draft|published; project: draft|done
  source_template_id text references documents(id),
  body               jsonb not null,           -- theme, envelope, couple, sections, scratch
  created_by         text references users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- append-only version history (no UPDATE/DELETE grants)
create table document_versions (
  document_id text not null references documents(id),
  version     int  not null,
  label       text,
  snapshot    jsonb not null,
  saved_by    text references users(id),
  saved_at    timestamptz not null default now(),
  primary key (document_id, version)
);

-- private client links (projects only)
create table shares (
  document_id text primary key references documents(id),
  token_hash  text unique not null,            -- store a HASH; compare hashes
  enabled     boolean not null,
  created_at  timestamptz not null,
  expires_at  timestamptz                      -- from settings.sharing.defaultLinkDays
);

-- append-only activity log
create table activity (
  id           text primary key,
  at           timestamptz not null default now(),
  actor_id     text not null references users(id),
  action       text not null,                  -- ActivityAction (types/auth.js)
  target_kind  text,
  target_id    text,
  target_title text,
  detail       text
);

create table settings (                          -- single row
  id        int primary key default 1 check (id = 1),
  business  jsonb not null,                      -- { brandName, contactEmail, phone }
  sharing   jsonb not null                       -- { defaultLinkDays: int | null }
);

create table assets (
  id          text primary key,
  url         text not null,                     -- object storage (S3 / Supabase Storage)
  kind        text not null,                     -- image | svg | video
  alt         text,
  uploaded_by text references users(id),
  created_at  timestamptz not null default now()
);
```

---

## 3. Endpoints

All admin endpoints require a valid session cookie **[server]** and the listed
permission **[server]**. JSON in/out. Errors: `{ "error": "message" }` with
`400` (validation), `401` (no/expired session), `403` (permission),
`404`, `409` (conflict, e.g. duplicate email), `429` (rate limit).

### Auth & me

| Method | Path | Mock function | Permission | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | `login(email, password)` | none | sets session cookie; generic error on any failure; rate-limited |
| POST | `/api/auth/logout` | `logout()` | session | deletes session row + clears cookie |
| GET | `/api/auth/session` | `getSession()` | none | `User` or `null` |
| POST | `/api/auth/password/forgot` | `requestPasswordReset(email)` | none | **always 200**; emails a 1h reset link if the account exists |
| POST | `/api/auth/password/reset` | (new: reset page) | token | `{ token, newPassword }` |
| POST | `/api/auth/invite/accept` | (new: accept page) | token | `{ token, password }` → activates user, signs in |
| POST | `/api/auth/password/change` | `changePassword(current, next)` | session | verify current; revoke other sessions |
| PATCH | `/api/me` | `updateProfile({ name })` | session | |

### Team & activity & settings

| Method | Path | Mock function | Permission |
|---|---|---|---|
| GET | `/api/users` | `listUsers()` | `users.view` |
| POST | `/api/users/invite` | `inviteUser({ email, name, role })` | `users.manage` |
| PATCH | `/api/users/:id` | `updateUser(id, { role, status })` | `users.manage` + `canManageUser` |
| GET | `/api/activity?limit=&action=` | `listActivity()` | `activity.view` |
| GET | `/api/settings` | `getSettings()` | session |
| PUT | `/api/settings` | `saveSettings(settings)` | `settings.business` |

### Designs (templates & projects)

| Method | Path | Mock function | Permission |
|---|---|---|---|
| GET | `/api/categories` | `listCategories()` | none (public) |
| GET | `/api/templates?status=published` | `listPublishedTemplates()` | none (public) |
| GET | `/api/templates/:id/public` | `getPublishedTemplate(id)` | none: **published only**, else 404 |
| GET | `/api/templates` | `listTemplates()` | session |
| POST | `/api/templates` | `createTemplate(title, category)` | `templates.edit` |
| POST | `/api/templates/:id/publish` | `publishTemplate(id)` | `templates.publish` |
| GET | `/api/projects` | `listProjects()` | session |
| POST | `/api/projects` | `createProjectFromTemplate(templateId, title)` | `projects.edit` |
| GET | `/api/documents/:id` | `getDocument(id)` | session |
| PUT | `/api/documents/:id` | `saveDocument(doc)` | `templates.edit` / `projects.edit` by kind |
| GET | `/api/documents/:id/versions` | `listVersions(id)` | session |
| POST | `/api/documents/:id/rollback` | `rollbackTo(id, version)` | `versions.rollback` |
| POST | `/api/assets` (multipart) | `uploadAsset(file)` | `templates.edit` or `projects.edit` |

### Client sharing

| Method | Path | Mock function | Permission |
|---|---|---|---|
| GET | `/api/projects/:id/share` | `getShare(id)` | `projects.share` |
| POST | `/api/projects/:id/share` | `shareProject(id)` | `projects.share` |
| POST | `/api/projects/:id/share/rotate` | `regenerateShareLink(id)` | `projects.share` |
| DELETE | `/api/projects/:id/share` | `stopSharing(id)` | `projects.share` |
| GET | `/api/invite/:token` | `getSharedInvitation(token)` | none (**token is the key**) |

---

## 4. Permission matrix  **[server]**

Source of truth: `src/lib/permissions.js`.

| Permission | Owner | Admin | Designer |
|---|:-:|:-:|:-:|
| `templates.edit` | ✓ | ✓ | ✓ |
| `templates.publish` | ✓ | ✓ | |
| `projects.edit` | ✓ | ✓ | ✓ |
| `projects.share` | ✓ | ✓ | |
| `versions.rollback` | ✓ | ✓ | |
| `users.view` | ✓ | ✓ | |
| `users.manage` | ✓ | ✓ | |
| `activity.view` | ✓ | ✓ | |
| `settings.business` | ✓ | | |

Extra team rules (`canManageUser`, `assignableRoles`, `updateUser`):
- Only **active** users have any permission (`invited`/`disabled` → none).
- Nobody changes **their own** role or status.
- Only an **owner** can change an owner, or grant the owner role.
- There must always be **at least one active owner**.
- Users are **never deleted**. Disable them, so the activity log keeps meaning.

---

## 5. Auth & session flow

**Login**: `POST /api/auth/login`
1. Normalize email (trim + lowercase). Rate-limit by IP **and** by email
   (e.g. 5 failures / 15 min → lock briefly). **[server]**
2. Verify with **argon2id** (or bcrypt cost ≥ 12). Same error and similar timing
   for unknown email, wrong password, or disabled account. **[server]**
3. Create a `sessions` row; set cookie
   `session=<id>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800` (8 h,
   matching the mock). Optionally slide expiry on activity.
4. Write `auth.login` to `activity`. Update `last_login_at`.

**Every admin request**: Next.js `middleware.ts` matches `/admin/:path*` and
redirects to `/login?next=…` without a valid session (this replaces the
browser-only `AdminGuard`). API routes check the session and permission again.
Never trust the client. **[server]**

**Logout**: delete the session row, clear the cookie, log `auth.logout`.

**Invite**: `POST /api/users/invite` creates `status='invited'` with no password
and emails a one-time link (`auth_tokens`, purpose `invite`, 7-day expiry,
**hash stored**). Accepting sets the password, flips the user to `active`, and
signs them in. *(The mock shows a temporary password on screen instead. Remove
that.)*

**Forgot / reset password**: forgot always returns 200 (no account
enumeration). Reset tokens last 1 h, are single-use, and are stored hashed. A
successful reset or password change **revokes all other sessions**.

**Redirect after login**: only to `/admin…` paths. Reuse
`src/lib/redirect.js` `safeAdminPath()` (blocks open redirects).

---

## 6. Rules carried over from the mock  **[server]**

- **Public reads are narrow.** Only published templates are public. Projects
  are never listed or returned publicly. `getPublishedTemplate` returns 404 for
  anything else, with no fallback document.
- **Share tokens**: 24+ random bytes, base64url. Store only a **hash**, look up
  by hash, return a **render-only** copy (strip id, admin title, versions, share,
  source template, meta). Unknown / disabled / expired → 404. Stopping and
  re-sharing issues a **new** token. Rollback must **not** restore an old token.
  Respect `settings.sharing.defaultLinkDays` via `shares.expires_at`.
- **Versions are append-only.** Every save inserts a version; rollback inserts
  a *new* version. No update/delete of `document_versions`.
- **Activity is append-only and server-written.** It's inserted in the same
  transaction as the change it describes. The client never posts activity.
- **Uploads**: validate MIME type and size, store in object storage, return a
  permanent URL. The mock's `blob:` URLs vanish on reload.
- **`/i/[slug]` (client invitation)**: render on the server from
  `GET /api/invite/:token`, keep `robots: noindex` and `referrer: no-referrer`.

---

## 7. Security checklist

- [ ] argon2id/bcrypt password hashing (mock uses salted SHA-256, which is **not acceptable**)
- [ ] HTTP-only, Secure, SameSite session cookie. No tokens in `localStorage`
- [ ] CSRF protection on state-changing requests (SameSite=Lax + Origin check, or CSRF token)
- [ ] Rate limiting: login, forgot-password, invite, share-token lookups
- [ ] Every admin route checks session **and** permission on the server
- [ ] Generic auth errors (no user enumeration)
- [ ] Hash invite, reset and share tokens at rest. Compare in constant time
- [ ] Revoke sessions on password change/reset and on user disable
- [ ] Validate all input server-side (emails, roles, link days 1–3650, document body schema)
- [ ] Security headers (CSP, `X-Frame-Options`/`frame-ancestors`, HSTS)
- [ ] Audit: activity log written server-side for every mutation

---

## 8. Migration checklist

1. Stand up the database (schema §2) and object storage. Seed `categories` and
   the starter templates from `src/services/mockStore.js`.
2. Create the first **owner** via a one-off CLI/seed script (not a public sign-up).
3. Implement `/api/auth/*` + `middleware.ts` session check.
4. Rewrite `src/services/authApi.js` to `fetch()` the endpoints. Keep the
   exported function names. Remove `DEMO_ACCOUNTS`, `DEMO_PASSWORD`, and set
   `IS_MOCK_AUTH = false` (this hides the mock banners and demo panel).
5. Rewrite `invitationApi.js` and `activityApi.js` the same way. Remove the
   `assertCan` / `logActivity` calls (the server does both). Delete `session.js`.
6. Add the two missing pages: **Accept invite** and **Reset password**
   (token in the URL → set a new password).
7. Render `/i/[slug]` server-side from the invite endpoint.
8. Remove `SEED_VERSION` / localStorage seeding.
9. Run the security checklist (§7). Test each role with the demo flows below.

**Role test flows** (same as the mock demo accounts):
- Designer: can edit and save. Publish/Share/Restore are hidden and the API returns 403.
- Admin: can publish, share, roll back, invite designers/admins. Can't touch owners or business settings.
- Owner: everything. Can't remove the last active owner.
