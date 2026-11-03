# Invitation Builder (draft)

A visual, self-serve builder for creating invitations: pick a template, toggle
and reorder sections, tweak colors/fonts, and see a live mobile preview. This
document describes the **data contracts and data flow** so a backend can be
built against them later. The current implementation is a **front-end draft**
(no real backend) — see "Status" at the end.

Open it in the running app at: `?builder` (e.g. `http://localhost:5173/?builder`).

## The core idea

> **The builder's SAVE output === the renderer's LOAD input.**

Everything a user designs is captured in ONE serializable JSON object — an
`InvitationDocument`. The builder edits it in state; the preview renders from
it; "Save" sends that exact object to the API. Because it's plain JSON, adding
a backend is just POST to save / GET to load — no component changes.

## Data model (`src/builder/builderTypes.js`)

```
InvitationDocument
├─ id, schemaVersion, templateId, title
├─ theme         { rose, roseDeep, gold, ink, blush, fontScript, fontSerif, fontBody }
├─ envelope      { openAnimation, sealMonogram, sealImage?, stampImage?, paperTexture? }
├─ couple        { names, dateISO, venue, address, mapUrl, ... }   (shared content)
├─ sections[]    SectionConfig { id, type, enabled, order, props }
└─ meta          { createdAt, updatedAt, status }
```

- **Assets** (handcrafted art: envelope, seal, textures, photos) are **files** →
  they live in object storage (S3/Cloudinary). The document stores an
  **`AssetRef`** ({ id, url, kind }) — a URL, not the binary.
- **`SectionConfig.props`** holds each section's content. Its shape depends on
  `type` and is described by the section registry's field metadata.

## Section registry (`src/builder/sectionRegistry.js`)

One catalog that powers three things at once:

1. the **toggle/add list** (name + icon per section type)
2. the **per-section edit form** (auto-generated from `fields` metadata)
3. **defaults** when a section is added (`defaultProps`, via `makeSection()`)

Section types: `hero` (required), `countdown`, `story`, `whenWhere`,
`schedule`, `celebration`, `attire`, `rsvp`.

## Data access (`src/builder/invitationApi.js`)

Mock API backed by `localStorage` today, with the **exact async signatures** a
real backend will expose. Swapping to `fetch` touches only this file.

| Function                       | Future endpoint                     |
| ------------------------------ | ----------------------------------- |
| `getInvitation(id)`            | `GET /api/invitations/:id`          |
| `saveInvitation(doc)`          | `PUT /api/invitations/:id` (upsert) |
| `createInvitation(templateId)` | `POST /api/invitations`             |
| `listInvitations()`            | `GET /api/invitations`              |
| `listTemplates()`              | `GET /api/templates`                |
| `uploadAsset(file)`            | `POST /api/assets` (multipart)      |

All return Promises now, so callers already `await` them.

## Suggested backend schema

A minimal relational design (any DB works; the document is JSON either way):

```
templates         (id pk, name, description, open_animation, theme jsonb,
                   preview jsonb, created_at)

invitations       (id pk, owner_id fk, template_id fk, title,
                   schema_version, status,            -- 'draft' | 'published'
                   document jsonb,                    -- the full InvitationDocument
                   created_at, updated_at)

assets            (id pk, owner_id fk, url, kind, width, height, created_at)

rsvps             (id pk, invitation_id fk, name, email, attending,
                   guests, note, created_at)          -- form submissions
```

Notes:

- Storing the whole `InvitationDocument` as a single `jsonb` column is the
  simplest path and matches the "one document" model. You can later normalize
  hot fields (title, status) into columns for querying while keeping `document`
  as the source of truth.
- `assets.url` points at object storage; never store binaries in the DB.
- `schema_version` lets you migrate old documents safely when the shape evolves.

## Rendering: preview vs. production

- `src/builder/BuilderPreview.jsx` is a **simplified** live preview (fast,
  representative) used inside the builder's phone frame.
- The **production renderer** (`components/WeddingSite.jsx`, `Envelope`, etc.)
  consumes the same document shape. The next convergence step is a
  `componentForSection(type)` map so one renderer serves both preview and the
  real invitation, section-by-section.

## Status / what's built

Done (front-end draft):

- Data contracts, section registry, a realistic mock document.
- Mock localStorage API with real backend signatures.
- Split-screen builder shell: color editing + section show/hide + reorder +
  Save, with a live phone preview that re-renders from the document.

Also done since:

- Per-section editing forms (text + add/remove for list sections) via
  `SectionEditor.jsx`, generated from the registry `fields`.
- The real envelope opening scene renders at the top of the preview.
- `couple.names` + `nameJoiner` are the source of truth; display name and
  monogram are computed (`data/names.js`) — event-type agnostic.

Not yet built (next steps):

- Drag-and-drop reordering (arrows work today).
- Asset upload UI wired to `uploadAsset`.
- A real backend implementing the API signatures + the schema above.
- Converging `BuilderPreview` sections with the production components.

## Gotchas specific to the builder

- **Phone preview height chain.** Components like the envelope use `100dvh`.
  Inside the phone frame that's wrong; override to `height: 100%` AND keep a
  definite-height ancestor chain (`.pv` is `height:100%` flex column,
  `.pv-envelope` is `flex:1`). A `min-height` ancestor will collapse a
  `height:100%` child to zero — the envelope was invisible for this reason.
  (Full write-up in ARCHITECTURE.md → "Known gotchas".)
- **Document stays plain JSON.** `mockDocument.couple` stores `names` +
  `nameJoiner`, not the derived display string — the renderer computes those.
  Keep the stored document free of computed/duplicated fields.
