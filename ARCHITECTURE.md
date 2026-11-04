# Architecture

This document explains how the app is organized so a developer (or another AI)
can extend it safely. The guiding idea is a **template-driven** design borrowed
from how professional digital-invitation services work: separate the **content**
from the **presentation** from the **animation**.

## Three separable concepts

| Concept            | Lives in                 | What it owns                                                                                         |
| ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Data**           | `src/data/invitation.js` | The couple's content only. No styling, no components. Could come from a form/JSON/API.               |
| **Template**       | `src/data/templates.js`  | The _look_ (theme colors + fonts as CSS variables), the _opening animation_ key, and image _assets_. |
| **Open animation** | `src/animations/`        | Swappable opening components registered by key, all honoring one contract.                           |

The same `InvitationData` can be rendered through any `Template`. Changing the
template changes colors, fonts, assets, and the opening — without touching the
content or the section components.

## Folder structure

`src/` is organized by **layer + feature** so shared code is reusable and each
feature is self-contained:

```
src/
  app/                 Next.js App Router routes (pages + layout only)
    (site)/            public marketing pages, shared header + footer
      page.jsx         /            → features/landing/HomePage
      designs/         /designs     → DesignsGallery (all, by category)
      pricing/         /pricing     → PricingSection + FAQ
      faq/             /faq         → FaqSection
    i/[slug]/          /i/<token>   → private client invitation (share token)
    admin/             /admin, /admin/[id] → the studio
  types/               ALL JSDoc interfaces (one import surface, @/types)
    invitation.js      InvitationData, Template, OpenAnimationProps, …
    document.js        InvitationDocument, Theme, Category, SectionConfig, …
    index.js           barrel — import('@/types')
  lib/                 shared PURE functions (no React): date, names, icons, confetti
  services/            data access (mocks shaped like the future API, BACKEND.md):
                       authApi, activityApi, session (mock core),
                       invitationApi, mockStore/mockDocument,
                       categories, documentAdapter (document → render `event`)
  features/
    invitation/        the rendered invitation: InvitationSite, Envelope,
                       ScratchCard, Countdown, RsvpForm, Invitation
    builder/           the admin builder: BuilderApp, BuilderPreview, Gallery,
                       Dialog, SectionEditor, sectionRegistry
    landing/           the public site: HomePage, SiteHeader/Footer, LiveDemo,
                       DesignsGallery, PricingSection, FaqSection,
                       siteContent.js (ALL marketing copy/prices/stats)
  ui/                  generic reusable UI/effects: Confetti, Petals,
                       NumberTicker, MorphingText, TemplatePicker, and the
                       Magic UI ports: PhoneFrame, Marquee, ShimmerButton,
                       AnimatedGradientText, BorderBeam, DotPattern, BlurFade
  animations/          swappable opening animations (flap / unfold) + timing
  data/                legacy public demo data (invitation.js, templates.js)
  index.css            global stylesheet + font variables
```

Rules of thumb:

- **Pure, React-free helpers → `lib/`.** Data access / mock backend → `services/`.
- **Interfaces live only in `types/`.** Reference them with
  `@type {import('@/types').InvitationDocument}` (the `@/` alias → `src/`).
- **A feature owns its components + CSS.** Cross-feature reuse goes to `ui/`.
- CSS is co-located with its component (`Foo.jsx` + `Foo.css`).

## Framework: Next.js (App Router)

The app is a **Next.js 15 App Router** project on **React 19** (migrated from
Vite + react-router, then upgraded from Next 14). The route tree lives in
`src/app/` (file-based routing).

### Dev server & bundler

| Command         | What it runs                   | Bundler              |
| --------------- | ------------------------------ | -------------------- |
| `npm run dev`   | `next dev --turbopack -p 5500` | **Turbopack** (fast) |
| `npm run build` | `next build`                   | webpack (stable)     |
| `npm run start` | `next start -p 5500`           | serves the build     |

- **Dev uses Turbopack.** It's stable for `next dev` in Next 15 and compiles
  much faster than the webpack dev compiler. Production `build` intentionally
  stays on webpack, since Turbopack builds are still beta in Next 15.
- **Port is pinned to 5500** so a leftover server on 3000 can't silently push
  you onto 3001 and leave the browser stuck on a dead tab.
- `next.config.mjs` enables `experimental.optimizePackageImports` for
  `react-icons`, `lucide-react`, and `framer-motion` (avoids compiling whole
  icon barrels).
- The public pages lazy-load `BuilderPreview` with `next/dynamic` (`ssr:false`)
  in `LiveDemo` and the `DesignsGallery` preview dialog, so the heavy
  invitation tree loads after the page shell.
- **Windows tip:** if first compiles are still slow, add a Microsoft Defender
  exclusion for the project folder and `node.exe`. Real-time scanning of
  `node_modules`/`.next` was the main cause of 60s+ compiles here.
- **Next 15 note:** `params` became async for server components. `/admin/[id]`
  is a client component using `useParams()`. `/i/[slug]` is a server page and
  already does `const { slug } = await params`. Any new server page that reads
  `params` must `await` it.

| Path          | File                      | Rendering          | Purpose                                         |
| ------------- | ------------------------- | ------------------ | ----------------------------------------------- |
| `/`           | `app/(site)/page.jsx`     | Static shell + CSR | Home: live phone demo + all marketing sections. |
| `/designs`    | `app/(site)/designs/…`    | Static shell + CSR | PUBLISHED templates by category, live preview.  |
| `/pricing`    | `app/(site)/pricing/…`    | Static             | Plans (sample prices) + FAQ.                    |
| `/faq`        | `app/(site)/faq/…`        | Static             | FAQ accordion.                                  |
| `/i/[slug]`   | `app/i/[slug]/page.jsx`   | Dynamic (server)   | Private client invitation — share token only.   |
| `/admin`      | `app/admin/page.jsx`      | Static shell + CSR | The studio gallery (Templates / Projects).      |
| `/admin/[id]` | `app/admin/[id]/page.jsx` | Dynamic            | The visual builder for one document.            |

### Server vs client components

- `app/layout.jsx`, `app/(site)/layout.jsx` and the `(site)` pages are
  **server components** (the SSR shell + per-page `metadata`).
- Everything interactive is a **client component** marked `'use client'`:
  `HomePage`, `SiteHeader`, `SiteFooter`, `LiveDemo`, `DesignsGallery`,
  `Gallery`, `Dialog`, `BuilderApp`, `BuilderPreview`, `Invitation`,
  `TemplatePicker`. `'use client'` cascades — a client component's imported
  children are automatically client too, so leaf components (ScratchCard,
  InvitationSite, Envelope, animations…) don't each need the directive.
- The admin/builder pages are thin client wrappers that read route params with
  `useParams()` and navigate with `useRouter()` from `next/navigation`.

### SSR + the localStorage mock

The data layer (`services/invitationApi.js`) is still backed by `localStorage`.
Because Next renders pages on the server first, every `localStorage`/`window`
access is guarded by `hasLS()` (returns empty server-side) so SSR never crashes.
The interactive pages fetch their data in `useEffect` (client only). When a real
backend replaces the mock, `/i/[slug]` can become a true server-rendered page
for fast first paint + social/OG previews — the route already exists for it.

### Fonts

Google Fonts are loaded via a `<link>` in `app/layout.jsx` and each family is
exposed as a `--f-*` CSS variable in `index.css` (e.g. `--f-pinyon:
"Pinyon Script"`). Document themes + the builder's font pickers reference those
variables (`var(--f-pinyon), cursive`). (We use a `<link>` rather than
`next/font` to avoid a build-time font fetch.)

## Render pipeline

```
app/layout.jsx (server: fonts + global CSS)
  ├─ app/(site)/layout.jsx             (server) — SiteHeader + SiteFooter, site.css
  │     ├─ page.jsx → HomePage          (client) — hero LiveDemo phone + all sections
  │     ├─ designs/ → DesignsGallery    (client) — "Preview live" → phone dialog
  │     ├─ pricing/ → PricingSection + FaqSection
  │     └─ faq/     → FaqSection
  ├─ app/i/[slug]/page.jsx             (server: noindex) → SharedInvitation(token) — client link
  ├─ app/admin/page.jsx → Gallery      (client) — Templates / Projects + category filter
  └─ app/admin/[id]/page.jsx → BuilderApp(docId)  (client) — the visual editor
```

Both the public preview and the builder preview render through
`BuilderPreview`, which runs the REAL components (`Envelope → ScratchCard →
InvitationSite`) from an `InvitationDocument` — the stage machine `open → scratch →
site`. The legacy `Invitation.jsx` (template + data) is retained but no longer
the entry point.

## The open-animation contract

Every opening component (in `src/animations/`) receives the **same props** so
they are interchangeable:

```js
/** @type {import('../types.js').OpenAnimationProps} */
{
  data,      // InvitationData (names, monogram, dateShort, ...)
  assets,    // TemplateAssets (sealImage, stampImage, paperTexture)
  onOpened,  // () => void — call when the opening finishes to advance
}
```

Registered in `src/animations/registry.jsx`:

```js
export const openAnimations = { flap: FlapOpen, unfold: UnfoldOpen };
```

### Shared timing

`src/animations/timing.js` exports `OPEN_TIMING`, the **single source of truth**
for how dramatic the opening is (a 3-beat sequence: seal → cover → letter).
Both `FlapOpen` and `UnfoldOpen` import it, so changing one value re-paces every
template identically. Do not hardcode durations/delays inside an animation;
read them from `OPEN_TIMING`.

## Theming via CSS variables

A template's `theme` is a map of CSS custom properties:

```js
theme: { "--rose": "#c98a86", "--font-script": "'Pinyon Script', cursive", ... }
```

`Invitation.jsx` spreads it onto the root element's `style`, so it cascades to
every child. Components reference `var(--rose)`, `var(--font-serif)`, etc. with
sensible fallbacks. This is why swapping templates re-colors the whole UI
(including Lucide icons, which are tinted with `color: var(--accent)`).

## Icons (data stays serializable)

Timeline items reference icons by **string key**, not by importing components:

```js
// invitation.js
{ time: "4:00 PM", title: "Ceremony", icon: "rings", accent: "#a9625d" }
```

`src/lib/icons.js` maps keys → Lucide components via `getIcon(key)` (with
a safe fallback). This keeps `invitation.js` free of React imports so it could
be loaded from JSON/an API later. Browse icons at https://lucide.dev/icons/.

## Types / "interfaces"

This is plain JavaScript, so types are JSDoc `@typedef`s in `src/types.js`
(`InvitationData`, `TimelineItem`, `StoryItem`, `DressCode`, `Template`,
`TemplateAssets`, `OpenAnimationProps`). Reference them with:

```js
/** @type {import('../types.js').InvitationData} */
```

Editors use these for autocomplete and checking. Nothing is exported at runtime.

## How to extend

**Add a template** → new entry in `data/templates.js` (id, name, `openAnimation`
key, `theme` vars, `assets`, `preview` swatches).

**Add an opening animation** → build a component honoring `OpenAnimationProps`,
read pacing from `OPEN_TIMING`, register it in `animations/registry.jsx`, then
point a template's `openAnimation` at the new key.

**Add a timeline icon** → import the Lucide icon in `lib/icons.js`, add a
key to `ICONS`, use that key in `invitation.timeline[].icon`.

**Swap real art for the CSS envelope** → set `assets.sealImage` /
`assets.stampImage` / `assets.paperTexture` to image paths in `public/`. Empty
string falls back to the pure-CSS rendering.

## Conventions

- Keep `invitation.js` presentation-free and serializable (strings/arrays/objects only).
- Keep animation pacing in `OPEN_TIMING`, not inline.
- When an element is animated by framer-motion AND needs centering, do the
  centering **inside** the motion transform (e.g. `x: "-50%"`), not via a CSS
  `transform` — motion overwrites the whole `transform` property.
- Full-bleed stages use `width: 100%` (not `100vw`) to avoid the scrollbar
  offset that shifts centered elements.
- **Derive, don't duplicate.** The date is one field (`dateISO`) → `date`,
  `dateShort`, `time` are computed getters (`lib/date.js`). The honorees
  are one field (`names` + `nameJoiner`) → `couple`/display name and
  `sealMonogram` are computed (`lib/names.js`). Never store the derived strings
  by hand. This also keeps the app event-type agnostic: `["Karen","Bert"]` →
  "Karen & Bert" / "K & B"; `["Mateo"]` → "Mateo" / "M".

## Known gotchas (READ BEFORE TOUCHING THESE — do not re-derive by trial)

These are real bugs we already hit and fixed. The symptom → cause → fix is
recorded so nobody repeats the investigation.

1. **Centered element drifts with viewport width.** Cause: it was centered with
   a CSS `transform: translateX(-50%)` but also animated by framer-motion, which
   overwrote the transform; OR it used a container at `100vw` (includes the
   scrollbar). Fix: center via motion (`x: "-50%"`) and size stages at `100%`.

2. **An element inside the phone preview renders at zero height / is invisible.**
   Cause: a child set `height: 100%` but an ancestor only had `min-height: 100%`
   (or no definite height), so `height: 100%` had nothing to resolve against and
   collapsed to 0. This is exactly why the envelope was blank in the builder
   preview. Fix: give the ancestor a **definite** height (`height: 100%`) — in
   `BuilderPreview.css`, `.pv` is a flex column with `height: 100%` and
   `.pv-envelope` uses `flex: 1; min-height: 0` so the envelope fills the frame.
   Rule of thumb: `height: 100%` needs an unbroken chain of definite heights
   above it; `min-height` does NOT satisfy that chain.

3. **A full-bleed component (`.env-fill`, `.scratch-fill`, `.hero`) uses `100dvh`.**
   That's correct for the real app (fills the viewport) but wrong inside the
   phone frame. When embedding such a component in a bounded container, override
   its root to fill the device height AND ensure the parent chain has a definite
   height (see #2). The preview sets `.pv .hero { min-height: 716px }` (the
   device-screen height = 740px device − 2×12px padding) so the hero fills the
   phone with no empty gap.

4. **Dev server crashes with `ENOENT ... .next/server/app/.../app-build-manifest.json`.**
   Cause: `next build` was run while `next dev` was running, and both wrote to
   `.next`. The build wiped the dev server's files. Fix: `next.config.mjs` is
   a function of the phase. `next dev` writes to **`.next-dev`** and
   `next build` / `next start` use **`.next`**, so they can run side by side.
   Don't point both at the same `distDir` again.

5. **Two scrollbars, header-nav anchors don't smooth-scroll, `window.scrollY`
   stays 0.** Cause: `index.css` had `html, body { height: 100%; overflow-x:
hidden }`. `overflow-x: hidden` on both html and body, with body at a fixed
   100% height, turns `<body>` into its own scroll container. The page then
   scrolls inside body while html shows a second scrollbar, and smooth anchor
   scrolling (which targets the window) has nothing to do. Fix: never fix
   body's height; use `min-height: 100%` and `overflow-x: clip` (clip hides
   overflow WITHOUT creating a scroll container). Smooth scrolling is
   `html { scroll-behavior: smooth }` (off for reduced motion) plus
   `data-scroll-behavior="smooth"` on `<html>` in `app/layout.jsx`, so the
   Next router respects it.

6. **Preview text is oversized — `vw` measures the window, not the phone mock.**
   The real components size type with `vw` (e.g. hero names `clamp(64px,19vw,104px)`).
   Inside the builder's phone frame, `vw` STILL measures the desktop browser
   window, so everything is huge. Fix (scoped to the preview only, never the
   real app): `.device-screen` is a CSS container (`container-type: inline-size`),
   and `BuilderPreview.css` restates the `vw` sizes as `cqw` (1% of the PHONE
   width) with the same numbers. Add a matching `.pv .<class> { font-size:
clamp(min, Ncqw, max) }` override whenever a new `vw`-based size appears in a
   component the preview renders.

## Builder: the preview renders the REAL components (no reimplementation)

The builder preview does NOT re-implement the sections. It renders the actual
`Envelope` / `ScratchCard` / `InvitationSite` components so it can never drift
from the production app (footer, confetti, styling, fit are automatically
correct).

- **`InvitationSite` is data-driven.** It accepts an optional `sections` prop
  (filter `enabled`, sort `order`, dispatch by `type`); each section reads
  shared data from `event` plus its own `props` (eyebrow/title/note/items/
  background). With no `sections` prop it falls back to the fixed order — so the
  real app (`Invitation.jsx`) is unchanged.
- **`documentToEvent(doc)`** (`src/services/documentAdapter.js`) adapts a builder
  `InvitationDocument` into the flat `event` shape the real components expect,
  folding the list sections (story, schedule→timeline, attire→dressCode) back
  in. `documentToEnvelope(doc)` and `themeToVars(theme)` shape the rest.
- **The mock document derives from `invitation.js`.** `src/services/mockDocument.js`
  imports `invitation.js` (the single source of truth) and builds the document
  from it, so the mock can never be missing a field. Add fields to
  `invitation.js`, not to the mock.

## Icons

Two libraries, mixed per use-case, both resolved through the one `ICONS` map in
`lib/icons.js` (data references icons by string key, staying serializable):

- **lucide-react** — schedule/event, map, calendar (clean line icons).
- **react-icons** (Phosphor `Pi*`) — real GARMENT icons for attire (dress, coat
  hanger, etc.) that lucide lacks. Both libraries' components accept the same
  `size`/`className` props and use `currentColor`, so they're interchangeable in
  the map.

## Categories (event types)

A **dynamic layer above both kinds**. Every document has a `category` id
(`"wedding"`, `"birthday"`, …). Categories are DATA — `services/categories.js`
seeds a list (`id`/`label`/`icon`/`order`) and `listCategories()` returns it —
NOT a hardcoded enum, so an admin UI / backend can add or rename them later.

- The **landing page** groups published templates by category.
- The **gallery** has a category filter and the **New template** dialog picks one.
- A project **inherits** its source template's category.
- Deferred: a category-management UI and category-specific default content
  (e.g. the hero's default copy) — the model + filtering ship now.

## Templates vs. Projects (document kinds)

Both are the same `InvitationDocument` (see `@/types` → `types/document.js`)
with a `kind` discriminator and different lifecycle rules:

|              | **Template** (`kind: "template"`)               | **Project** (`kind: "project"`)                        |
| ------------ | ----------------------------------------------- | ------------------------------------------------------ |
| Purpose      | Reusable, canonical DESIGN                      | One real customer's invitation                         |
| Status       | `draft` → `published`                           | `draft` → `done`                                       |
| Visibility   | **published → PUBLIC** (landing page / gallery) | **PRIVATE** — never public (`meta.private: true`)      |
| Created from | built in the builder                            | copied from a published template                       |
| Versioning   | `versions[]` — append-only                      | `versions[]` — append-only                             |
| Title        | its own editable `title` (e.g. "Classic Rose")  | its own editable `title` (e.g. "Karen & Bert — April") |

Rules enforced by the API (`services/invitationApi.js`):

- **Only published templates are public.** `listPublishedTemplates()` returns
  `kind==="template" && status==="published"`. The landing page/gallery must use
  ONLY this. Never surface projects publicly.
- **Use a template → new project.** `createProjectFromTemplate(templateId, title)`
  deep-copies the template's document into a new private project with its own id
  and the template's category.
- **Both kinds are versioned — append-only, immutable.** `saveDocument(doc)`
  pushes a `versions[]` snapshot for templates AND projects; `listVersions(id)`
  lists them; `rollbackTo(id, version)` restores a snapshot (and records the
  rollback as a NEW version so it, too, is undoable). There is **no
  delete-version operation** — history can never be lost.
- **Title is explicit, not derived.** `doc.title` is the document's own name,
  independent of `couple.names`. "Karen & Bert" is sample content, not the title.
- **New template from scratch.** `createTemplate(title, category)` clones the
  starter baseline (`services/mockDocument.js`) into a fresh `kind:"template"`,
  `status:"draft"` document (seeded with version 1). The Gallery's **New
  template** button calls it and opens the editor.

Seed data lives in `services/mockStore.js` (three templates — a published +
draft wedding and a published birthday — and a sample project with a version).
The API seeds localStorage from it.

### Admin users, sign-in & permissions (mock)

**Backend contract: see [BACKEND.md](./BACKEND.md)** (schema, endpoints,
auth flow, security checklist, migration steps).

- Routes: `/login` (outside the admin group, noindex), and `/admin/*` wrapped by
  `app/admin/layout.jsx` → `AuthProvider` + `AdminGuard` (redirects to
  `/login?next=…`). Pages inside `AdminShell` (sidebar): `/admin` (designs),
  `/admin/users` (Team), `/admin/activity`, `/admin/settings`. The builder
  `/admin/[id]` is guarded but has no sidebar.
- Roles `owner | admin | designer`. **One permission matrix:
  `lib/permissions.js`** (`can`, `canManageUser`, `assignableRoles`). The UI
  hides actions with `can()`. The mock services re-check with
  `assertCan()` (`services/session.js`), the same way the backend will.
- Services: `authApi.js` (login, session, password, profile, users, settings),
  `activityApi.js` (append-only log), `session.js` (mock-only storage core;
  avoids an auth ↔ activity import cycle). `invitationApi.js` write operations
  call `assertCan` + `logActivity`.
- Demo accounts (mock only): `owner@` / `admin@` / `designer@envelope.test`,
  password `envelope123`. Pick them on the login page to test each role.
- ⚠️ **Mock = not secure.** Everything is in this browser's localStorage and
  the guard runs client-side. `IS_MOCK_AUTH` shows warning banners. Don't treat
  any of it as protection until the backend (BACKEND.md §5–§7) is in place.
- `?next=` redirects go through `lib/redirect.js` `safeAdminPath()` (admin
  paths only, which blocks open redirects).

### Public site (marketing pages)

Structure modeled on thedigitalyes.com (layout only — all copy is original and
multi-occasion). Rules:

- **All words, prices, stats and reviews live in
  `features/landing/siteContent.js`.** Components never hardcode copy. The
  stats, reviews and prices there are **SAMPLE placeholders** and are labelled
  as such on the page — replace them with real data before launch; never
  publish invented ratings or testimonials.
- **Only published templates appear** (`listPublishedTemplates` /
  `getPublishedTemplate`) — in `LiveDemo` and `DesignsGallery`. Never projects.
- **The phone mock is `ui/PhoneFrame`**: a true 430×932 screen (size
  container, so the invitation's `cqw/cqh` resolve like a real phone) scaled
  with `--phone-scale`. Set the scale on a parent class, not inline.
- **Magic UI ports are plain CSS** (no Tailwind) and all respect
  `prefers-reduced-motion`. `MorphingText` in the hero is `aria-hidden` with
  an `sr-only` full sentence, so screen readers don't hear the cycling words.
- The `(site)` route group is the only place with the marketing header.
  `/admin` and `/i/<token>` stay outside it (the client invitation is bare).
- The footer newsletter form is UI-only (no email is sent) until a backend /
  email provider exists.

### Sharing a project with its client (private link)

A finished project is delivered to the client at **`/i/<token>`**. The token is
the only key: without the exact link, nobody can see the invitation.

Admin flow (Projects tab → **Share**):

- **Publish & create link** → `shareProject(id)`: sets the project to `done`
  and issues `share = { enabled: true, token, createdAt }`.
- **Copy** the link and send it to the client.
- **New link** → `regenerateShareLink(id)`: replaces the token; the old link
  stops working immediately (use it if a link leaked).
- **Stop sharing** → `stopSharing(id)`: link turns off. Publishing again
  issues a **brand-new** token, so an old link never comes back.

Rules (do not weaken these):

- **The public route never accepts a document id** and never resolves a
  template. `getSharedInvitation(token)` only matches `kind === "project"` with
  `share.enabled` and an exact token. Unknown/disabled/malformed tokens return
  `null` → the viewer shows "This invitation link isn't valid". There is **no
  fallback** to another document. (`getDocument(id)` is admin-only; it must
  never be used by a public page — the landing preview uses
  `getPublishedTemplate(id)`, which returns only published templates.)
- **Tokens are unguessable:** 24 bytes from `crypto.getRandomValues`, base64url
  (32 chars, 192 bits). Never derive them from the id, title, or names.
- **The client gets a render-only copy.** `id`, admin `title`, `versions`,
  `share`, `sourceTemplateId`, and `meta` are stripped before rendering.
- **Rollback keeps the current link.** `rollbackTo` restores content but keeps
  `d.share`, so restoring an old version can't revive a replaced token. New
  projects copied from a template start with `share: undefined`.
- **The viewer is the invitation and nothing else.**
  `features/invitation/SharedInvitation.jsx` has no back button, no studio or
  "designs" links, no admin chrome. The page sets `robots: noindex, nofollow`
  (private links stay out of search) and `referrer: no-referrer` (clicking the
  map link won't leak the token through the Referer header).

> **Limitation (important): the mock can't deliver to a client yet.** Data
> lives in the admin browser's `localStorage`, so `/i/<token>` only works in
> that same browser (good for testing). A client opening the link on their own
> phone will see "not valid" because their browser has no data. Real delivery
> needs the backend: store documents server-side, resolve
> `GET /api/invite/:token` **on the server** (compare tokens there, return only
> the render copy), and render `/i/[slug]` from that response. The token check
> must live on the server — a check in browser code is not security.
>
> Also note: `/admin` has **no authentication yet**. It's safe today only
> because the data never leaves the admin's browser. Add auth before the
> admin and its data move to a real server.

### Create flows use an in-app dialog (not window.prompt)

Naming a new template or project goes through `features/builder/Dialog.jsx`, a
small accessible modal (Escape / backdrop to close). The **New template** dialog
also includes the category picker. Never reintroduce `window.prompt`.

### Editing the celebrating name(s): the Event-details group

The couple/celebrant content lives in `doc.couple` — **not** in a section's
`props`. The builder's **Event details** group (`BuilderApp.jsx`, between
General and Envelope) edits it directly:

- a dynamic **names** list (add/remove people, minimum one) + **nameJoiner**,
- **tagline**, **date & time** (`dateISO` via `datetime-local`), and
  **venue / city / address / map link**.

`doc.couple.names` is the single source for every couple/celebrant heading
(hero, footer, scratch card) and the wax-seal monogram — all derived at render
time through `documentToEvent` / `documentToEnvelope` (via `lib/names.js`).
This is why editing names updates the whole preview live, and why one name
(birthday) vs. two (wedding) both work. **Never** hand-edit the derived display
strings; change `names` + `nameJoiner`.

### Deferred: RSVP static guest counts (#4)

Letting a client fix the guest count per invitation is intentionally NOT built
yet — a single global number gets painful across many invitations. The likely
right model is a **per-project guest list** (each named guest has a max `+N` and
a unique link), but this is still to be designed. Do not implement a global
static guest number without revisiting this.
