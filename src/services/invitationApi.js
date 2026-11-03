/**
 * INVITATION API (mock)
 * =========================================================================
 * Data access layer for the Template vs Project model. Backed by localStorage
 * today; the SIGNATURES match a future REST backend, so swapping to fetch() is
 * a one-file change — callers don't change.
 *
 * TEMPLATE = reusable public design (status draft|published). Only PUBLISHED
 *            templates are public (landing page / gallery).
 * PROJECT  = one customer's invitation made from a template (status draft|done).
 *            PRIVATE — never returned by any "public" listing. Keeps versions[]
 *            for rollback.
 *
 * Future backend mapping:
 *   listPublishedTemplates()        -> GET  /api/templates?status=published   (PUBLIC)
 *   listTemplates()                 -> GET  /api/templates                    (admin)
 *   listProjects()                  -> GET  /api/projects                     (owner only, PRIVATE)
 *   getDocument(id)                 -> GET  /api/documents/:id
 *   saveDocument(doc)               -> PUT  /api/documents/:id  (projects: snapshots a version)
 *   publishTemplate(id)             -> POST /api/templates/:id/publish
 *   createProjectFromTemplate(id)   -> POST /api/projects       { templateId }
 *   listVersions(docId)             -> GET  /api/documents/:id/versions
 *   rollbackTo(docId, version)      -> POST /api/documents/:id/rollback { version }
 *   listCategories()                -> GET  /api/categories
 *   uploadAsset(file)               -> POST /api/assets  (multipart)
 *
 * VERSIONING: both templates AND projects keep an APPEND-ONLY version history.
 * There is no delete-version operation — history is immutable by design.
 *
 * @typedef {import('@/types').InvitationDocument} InvitationDocument
 */
import { mockTemplates, mockProjects } from "./mockStore.js";
import { mockDocument } from "./mockDocument.js";
import { mockCategories, DEFAULT_CATEGORY } from "./categories.js";

const KEY = (id) => `envelope:doc:${id}`;
const SEEDED = "envelope:seeded";
// Bump when the seed MOCK DATA changes so existing browsers refresh the seeded
// documents. Only the seed ids are overwritten — user-created docs are kept.
const SEED_VERSION = "3";
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const clone = (o) => structuredClone(o);
const nowISO = () => new Date().toISOString();
const rid = (p) => `${p}_${Math.random().toString(36).slice(2, 10)}`;

// SSR guard: localStorage only exists in the browser. These functions are only
// ever called from client components (inside effects/handlers), but guarding
// keeps an accidental server-side call from throwing during Next SSR.
const hasLS = () => typeof window !== "undefined" && !!window.localStorage;

// Seed localStorage with the mock templates + projects. Re-runs when
// SEED_VERSION changes so corrected mock data reaches existing browsers.
// Only the seed documents (by their known ids) are (re)written; any documents
// the user created are left untouched.
function ensureSeeded() {
  if (!hasLS()) return;
  if (localStorage.getItem(SEEDED) === SEED_VERSION) return;
  for (const d of [...mockTemplates, ...mockProjects]) {
    localStorage.setItem(KEY(d.id), JSON.stringify(d));
  }
  localStorage.setItem(SEEDED, SEED_VERSION);
}

function allDocs() {
  if (!hasLS()) return [];
  ensureSeeded();
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("envelope:doc:"))
    .map((k) => JSON.parse(localStorage.getItem(k)));
}

const toSummary = (d) => ({
  id: d.id,
  kind: d.kind,
  category: d.category ?? DEFAULT_CATEGORY,
  title: d.title,
  status: d.meta?.status,
  sourceTemplateId: d.sourceTemplateId,
  preview: [d.theme?.rose, d.theme?.roseDeep, d.theme?.gold].filter(Boolean),
  updatedAt: d.meta?.updatedAt,
});

/* ---------------------------------------------------------------- */
/* CATEGORIES (event types) — a dynamic layer above both kinds       */
/* ---------------------------------------------------------------- */

/** List the event-type categories (sorted by order). */
export async function listCategories() {
  await delay();
  return [...mockCategories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/* ---------------------------------------------------------------- */
/* TEMPLATES                                                         */
/* ---------------------------------------------------------------- */

/** PUBLIC: only published templates — these appear on the landing page. */
export async function listPublishedTemplates() {
  await delay();
  return allDocs()
    .filter((d) => d.kind === "template" && d.meta?.status === "published")
    .map(toSummary);
}

/** ADMIN: all templates (draft + published). */
export async function listTemplates() {
  await delay();
  return allDocs()
    .filter((d) => d.kind === "template")
    .map(toSummary);
}

/**
 * Create a brand-new DRAFT template from the starter baseline (mockDocument).
 * It gets its own id/title and starts as a private draft until published.
 */
export async function createTemplate(title, category = DEFAULT_CATEGORY) {
  await delay();
  const now = nowISO();
  const doc = {
    ...clone(mockDocument),
    id: rid("tpl"),
    kind: "template",
    category,
    title: title || "Untitled template",
    sourceTemplateId: undefined,
    // templates are versioned too (append-only history); seed v1
    versions: [
      {
        version: 1,
        savedAt: now,
        label: "Template created",
        snapshot: null, // filled below from the doc's own identity
      },
    ],
    meta: { createdAt: now, updatedAt: now, status: "draft" },
  };
  doc.versions[0].snapshot = clone({ ...doc, versions: undefined });
  localStorage.setItem(KEY(doc.id), JSON.stringify(doc));
  return doc;
}

/** Flip a template to published (it becomes public + reusable). */
export async function publishTemplate(id) {
  await delay();
  const d = JSON.parse(localStorage.getItem(KEY(id)));
  d.meta = { ...d.meta, status: "published", updatedAt: nowISO() };
  localStorage.setItem(KEY(id), JSON.stringify(d));
  return d;
}

/* ---------------------------------------------------------------- */
/* PROJECTS (private)                                                */
/* ---------------------------------------------------------------- */

/** OWNER-ONLY: the customer's projects. Never exposed publicly. */
export async function listProjects() {
  await delay();
  return allDocs()
    .filter((d) => d.kind === "project")
    .map(toSummary);
}

/**
 * Create a new PRIVATE project by copying a template's document. The project
 * gets its own id/title and records the source template.
 */
export async function createProjectFromTemplate(templateId, title) {
  await delay();
  const tpl = JSON.parse(localStorage.getItem(KEY(templateId)));
  if (!tpl) throw new Error(`template not found: ${templateId}`);
  const now = nowISO();
  const doc = {
    ...clone(tpl),
    id: rid("prj"),
    kind: "project",
    category: tpl.category ?? DEFAULT_CATEGORY, // inherit the template's category
    title: title || `${tpl.title} — Draft`,
    sourceTemplateId: templateId,
    versions: [
      {
        version: 1,
        savedAt: now,
        label: "Created from template",
        snapshot: clone(tpl),
      },
    ],
    meta: { createdAt: now, updatedAt: now, status: "draft", private: true },
  };
  // the first version's snapshot should reflect the project's own identity
  doc.versions[0].snapshot = clone({ ...doc, versions: undefined });
  localStorage.setItem(KEY(doc.id), JSON.stringify(doc));
  return doc;
}

/** List a project's version history (newest first). */
export async function listVersions(projectId) {
  await delay();
  const d = JSON.parse(localStorage.getItem(KEY(projectId)));
  return [...(d?.versions ?? [])].sort((a, b) => b.version - a.version);
}

/** Restore a project to a prior version (keeps history; appends the restore). */
export async function rollbackTo(projectId, version) {
  await delay();
  const d = JSON.parse(localStorage.getItem(KEY(projectId)));
  const target = (d.versions ?? []).find((v) => v.version === version);
  if (!target) throw new Error(`version ${version} not found`);
  const restored = {
    ...clone(target.snapshot),
    id: d.id,
    kind: d.kind, // preserve kind (templates are versioned too)
    category: d.category,
    sourceTemplateId: d.sourceTemplateId,
    versions: d.versions, // preserve full history
    meta: { ...d.meta, updatedAt: nowISO() },
  };
  // record the rollback as a new version so it, too, can be undone
  const nextV = Math.max(...d.versions.map((v) => v.version)) + 1;
  restored.versions = [
    ...d.versions,
    {
      version: nextV,
      savedAt: nowISO(),
      label: `Rolled back to v${version}`,
      snapshot: clone({ ...restored, versions: undefined }),
    },
  ];
  localStorage.setItem(KEY(projectId), JSON.stringify(restored));
  return restored;
}

/* ---------------------------------------------------------------- */
/* SHARED (works for either kind)                                    */
/* ---------------------------------------------------------------- */

/** Load one document (template or project). Defaults to the base template. */
export async function getDocument(id) {
  await delay();
  ensureSeeded();
  const raw = id && localStorage.getItem(KEY(id));
  if (raw) return JSON.parse(raw);
  // default: the first published template
  return allDocs().find((d) => d.meta?.status === "published") ?? allDocs()[0];
}

/**
 * Save a document. BOTH templates and projects keep an APPEND-ONLY version
 * history (every save pushes a snapshot) so edits can be rolled back and the
 * history can never be lost. There is intentionally NO deleteVersion API —
 * history is immutable.
 */
export async function saveDocument(doc, { label } = {}) {
  await delay();
  const now = nowISO();
  const next = { ...doc, meta: { ...doc.meta, updatedAt: now } };

  // Version EVERY document kind (templates + projects). Append-only.
  const versions = next.versions ?? [];
  const nextV = versions.length
    ? Math.max(...versions.map((v) => v.version)) + 1
    : 1;
  next.versions = [
    ...versions,
    {
      version: nextV,
      savedAt: now,
      label: label ?? `Saved v${nextV}`,
      snapshot: clone({ ...next, versions: undefined }),
    },
  ];
  localStorage.setItem(KEY(next.id), JSON.stringify(next));
  return next;
}

/* ---------------------------------------------------------------- */
/* BACK-COMPAT shims (the builder still calls these names)           */
/* ---------------------------------------------------------------- */
export const getInvitation = (id) => getDocument(id);
export const saveInvitation = (doc) => saveDocument(doc);

/* ---------------------------------------------------------------- */
/* ASSETS                                                            */
/* ---------------------------------------------------------------- */

/**
 * Upload an asset. Mock returns an object URL; a real backend stores the file
 * and returns a permanent URL.
 * @param {File} file
 * @returns {Promise<import('@/types').AssetRef>}
 */
export async function uploadAsset(file) {
  await delay();
  return {
    id: rid("asset"),
    url: URL.createObjectURL(file),
    kind: file.type.includes("svg") ? "svg" : "image",
    alt: file.name,
  };
}
