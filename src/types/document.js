/**
 * DOCUMENT & BUILDER INTERFACES
 * =========================================================================
 * The schema for the visual invitation builder: the single JSON document a
 * builder produces and a renderer consumes — and exactly what a backend will
 * store per invitation.
 *
 * GUIDING PRINCIPLE: the builder's SAVE output === the renderer's LOAD input.
 * An InvitationDocument is plain serializable JSON, so wiring a backend later
 * is just POST (save) / GET (load) — no component changes.
 *
 * Reference a type with the `@/` alias:  @type {import('@/types').InvitationDocument}
 * Nothing is exported at runtime.
 */

/* --------------------------------------------------------------------- */
/* CATEGORY — the dynamic event-type layer (see services/categories.js)   */
/* --------------------------------------------------------------------- */

/**
 * An event-type category. Data, not a hardcoded enum, so it can be extended
 * from an admin UI / backend.
 * @typedef {Object} Category
 * @property {string} id      stable slug, e.g. "wedding"
 * @property {string} label   human label, e.g. "Wedding"
 * @property {string} [icon]  icon key (lib/icons.js)
 * @property {number} [order] display order (ascending)
 */

/* --------------------------------------------------------------------- */
/* ASSETS — handcrafted art lives in object storage; we store the URL     */
/* --------------------------------------------------------------------- */

/**
 * A reference to an uploaded asset (envelope art, wax seal, photo, texture).
 * @typedef {Object} AssetRef
 * @property {string} id       stable id
 * @property {string} url      public URL to the file
 * @property {('image'|'svg'|'video')} kind
 * @property {string} [alt]
 * @property {number} [width]
 * @property {number} [height]
 */

/* --------------------------------------------------------------------- */
/* THEME — colors + fonts, applied as CSS variables                       */
/* --------------------------------------------------------------------- */

/**
 * @typedef {Object} Theme
 * @property {string} rose
 * @property {string} roseDeep
 * @property {string} gold
 * @property {string} ink
 * @property {string} blush
 * @property {string} fontScript  CSS font-family for calligraphy
 * @property {string} fontSerif   CSS font-family for headings
 * @property {string} fontBody    CSS font-family for body text
 */

/* --------------------------------------------------------------------- */
/* ENVELOPE — the opening scene configuration                             */
/* --------------------------------------------------------------------- */

/**
 * How the invitation opens + the art it uses.
 * @typedef {Object} EnvelopeConfig
 * @property {('flap'|'unfold')} openAnimation  key into animations/registry
 * @property {string} sealMonogram              e.g. "K&B"
 * @property {AssetRef} [sealImage]             handcrafted wax-seal art
 * @property {AssetRef} [stampImage]            handcrafted stamp art
 * @property {AssetRef} [paperTexture]          envelope surface texture
 * @property {AssetRef} [envelopeImage]         (future) a full envelope illustration
 */

/* --------------------------------------------------------------------- */
/* SECTIONS — toggleable, reorderable content blocks                      */
/* --------------------------------------------------------------------- */

/**
 * The set of section types a page can contain.
 * @typedef {('hero'|'countdown'|'story'|'whenWhere'|'schedule'|'celebration'|'attire'|'rsvp'|'footer')} SectionType
 */

/**
 * One section instance on the page. `props` holds section-specific content.
 * @typedef {Object} SectionConfig
 * @property {string} id
 * @property {SectionType} type
 * @property {boolean} enabled
 * @property {number} order
 * @property {Object.<string, any>} props
 */

/* --------------------------------------------------------------------- */
/* DOCUMENTS — Templates and Projects share one shape (InvitationDocument) */
/* --------------------------------------------------------------------- */

/**
 * Two KINDS of document, same shape:
 *   TEMPLATE — reusable public DESIGN. status: 'draft'|'published'. Published
 *     templates are public (landing page) + reusable to spawn projects.
 *   PROJECT  — one customer's invitation from a template. status: 'draft'|'done'.
 *     PRIVATE (never public). Keeps versions[] for rollback.
 * @typedef {('template'|'project')} DocumentKind
 */

/**
 * A point-in-time snapshot for rollback. Both kinds are versioned; history is
 * APPEND-ONLY (never deleted).
 * @typedef {Object} DocumentVersion
 * @property {number} version
 * @property {string} savedAt     ISO
 * @property {string} [label]
 * @property {Omit<InvitationDocument,'versions'>} snapshot
 */

/**
 * The complete, serializable document. Builder output === renderer input.
 * @typedef {Object} InvitationDocument
 * @property {string} id
 * @property {DocumentKind} kind
 * @property {string} category        event-type category id (see Category)
 * @property {string} schemaVersion
 * @property {string} title           the document's OWN editable title
 * @property {string} [sourceTemplateId]  (projects) the template it came from
 * @property {Theme} theme
 * @property {EnvelopeConfig} envelope
 * @property {Object} couple          event-level content (names, date, venue…)
 * @property {SectionConfig[]} sections
 * @property {Object} [scratch]       the scratch reveal stage config
 * @property {DocumentVersion[]} [versions]  append-only rollback history
 * @property {Object} meta
 * @property {string} meta.createdAt
 * @property {string} meta.updatedAt
 * @property {('draft'|'published'|'done')} meta.status
 * @property {boolean} [meta.private] projects default true (never public)
 */

/**
 * Lightweight row for listing designs in a gallery (no full document).
 * @typedef {Object} DocumentSummary
 * @property {string} id
 * @property {DocumentKind} kind
 * @property {string} category
 * @property {string} title
 * @property {string} status
 * @property {string} [sourceTemplateId]
 * @property {string[]} [preview]
 * @property {string} updatedAt
 */

/* --------------------------------------------------------------------- */
/* EDITOR FIELD METADATA — drives the left-panel form for each section    */
/* --------------------------------------------------------------------- */

/**
 * Describes one editable field so the builder can auto-render a control.
 * @typedef {Object} EditorField
 * @property {string} key
 * @property {string} label
 * @property {('text'|'textarea'|'date'|'color'|'image'|'list'|'select')} control
 * @property {string} [help]
 * @property {string[]} [options]
 * @property {EditorField[]} [itemFields]
 */

/**
 * A section's entry in the registry.
 * @typedef {Object} SectionDef
 * @property {SectionType} type
 * @property {string} name
 * @property {string} icon
 * @property {boolean} [removable]
 * @property {Object} defaultProps
 * @property {EditorField[]} fields
 */

export {}
