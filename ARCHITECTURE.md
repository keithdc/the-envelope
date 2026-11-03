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
    page.jsx           /            → features/landing
    i/[slug]/          /i/[slug]    → public invitation (stub)
    admin/             /admin, /admin/[id] → the studio
  types/               ALL JSDoc interfaces (one import surface, @/types)
    invitation.js      InvitationData, Template, OpenAnimationProps, …
    document.js        InvitationDocument, Theme, Category, SectionConfig, …
    index.js           barrel — import('@/types')
  lib/                 shared PURE functions (no React): date, names, icons, confetti
  services/            data access: invitationApi, mockStore/mockDocument,
                       categories, documentAdapter (document → render `event`)
  features/
    invitation/        the rendered invitation: InvitationSite, Envelope,
                       ScratchCard, Countdown, RsvpForm, Invitation
    builder/           the admin builder: BuilderApp, BuilderPreview, Gallery,
                       Dialog, SectionEditor, sectionRegistry
    landing/           the public landing (published templates by category)
  ui/                  generic reusable UI/effects: Confetti, Petals,
                       NumberTicker, MorphingText, TemplatePicker
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

The app is a **Next.js 14 App Router** project (migrated from Vite + react-router).
The route tree lives in `src/app/` (file-based routing).

| Path          | File                       | Rendering           | Purpose                                          |
| ------------- | -------------------------- | ------------------- | ------------------------------------------------ |
| `/`           | `app/page.jsx` → `Landing` | Static shell + CSR  | Public landing: PUBLISHED templates by category. |
| `/i/[slug]`   | `app/i/[slug]/page.jsx`    | Dynamic (SSR-ready) | Public invitation view (stub; reads mock by id). |
| `/admin`      | `app/admin/page.jsx`       | Static shell + CSR  | The studio gallery (Templates / Projects).       |
| `/admin/[id]` | `app/admin/[id]/page.jsx`  | Dynamic             | The visual builder for one document.             |

### Server vs client components

- `app/layout.jsx` and `app/page.jsx` are **server components** (the SSR shell).
- Everything interactive is a **client component** marked `'use client'`:
  `Landing`, `Gallery`, `Dialog`, `BuilderApp`, `BuilderPreview`, `Invitation`,
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
  ├─ app/page.jsx → Landing            (client) — published templates by category
  │     └─ click a tile → BuilderPreview(doc) overlay
  ├─ app/i/[slug]/page.jsx             (client) — BuilderPreview(doc) [public invite stub]
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

4. **Preview text is oversized — `vw` measures the window, not the phone mock.**
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
