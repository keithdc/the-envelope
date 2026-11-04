"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  FilePlus2,
  Pencil,
  UploadCloud,
  History,
  RotateCcw,
  Lock,
  Globe,
  Plus,
  X,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Link2,
  Link2Off,
} from "lucide-react";
import {
  listTemplates,
  listProjects,
  listCategories,
  publishTemplate,
  createTemplate,
  createProjectFromTemplate,
  listVersions,
  rollbackTo,
  getShare,
  shareProject,
  regenerateShareLink,
  stopSharing,
} from "../../services/invitationApi.js";
import { matchesQuery } from "../../lib/search.js";
import Dialog from "./Dialog.jsx";
import "./Gallery.css";

// Filters survive "Edit → back" (same tab session), so the admin returns to
// exactly the list they were looking at.
const VIEW_KEY = "envelope:admin:view";

const SORTS = {
  updated: {
    label: "Recently updated",
    fn: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  },
  oldest: {
    label: "Oldest first",
    fn: (a, b) => (a.updatedAt ?? "").localeCompare(b.updatedAt ?? ""),
  },
  name: { label: "Name A–Z", fn: (a, b) => a.title.localeCompare(b.title) },
};

/**
 * Admin "My Designs" home. Two tabs:
 *   Templates — reusable designs (draft | published). Publish makes one public
 *               + reusable; "Use" spawns a new private Project from it.
 *   Projects  — private customer invitations (draft | done).
 *
 * Both kinds are categorized (wedding, birthday, …) and keep an append-only
 * version history. A category filter narrows the current tab.
 *
 * props:
 *   onOpen(id)  — open a document in the builder
 */
export default function Gallery({ onOpen, can = () => true }) {
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [historyFor, setHistoryFor] = useState(null); // document summary
  const [dialog, setDialog] = useState(null); // { mode, tpl? }
  const [shareFor, setShareFor] = useState(null); // project summary
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("updated");
  const [viewLoaded, setViewLoaded] = useState(false);
  const searchRef = useRef(null);

  const refresh = () => {
    listTemplates().then(setTemplates);
    listProjects().then(setProjects);
  };
  useEffect(() => {
    refresh();
    listCategories().then(setCategories);
  }, []);

  // restore the last view (read after mount: sessionStorage is browser-only)
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(VIEW_KEY) ?? "{}");
      if (v.tab) setTab(v.tab);
      if (v.activeCat) setActiveCat(v.activeCat);
      if (typeof v.query === "string") setQuery(v.query);
      if (SORTS[v.sort]) setSort(v.sort);
    } catch {
      /* ignore a corrupt saved view */
    }
    setViewLoaded(true);
  }, []);
  useEffect(() => {
    if (!viewLoaded) return;
    sessionStorage.setItem(
      VIEW_KEY,
      JSON.stringify({ tab, activeCat, query, sort }),
    );
  }, [viewLoaded, tab, activeCat, query, sort]);

  // "/" focuses search (unless already typing somewhere)
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;
  const templateTitle = (id) => templates.find((t) => t.id === id)?.title ?? id;

  // everything a document can be found by
  const searchFields = (d) => [
    d.title,
    catLabel(d.category),
    d.status,
    d.id,
    d.kind,
    d.sourceTemplateId && templateTitle(d.sourceTemplateId),
    d.shared && "shared client link",
  ];
  const matches = (d) =>
    (activeCat === "all" || d.category === activeCat) &&
    matchesQuery(searchFields(d), query);

  const templateMatches = useMemo(
    () => templates.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templates, categories, activeCat, query],
  );
  const projectMatches = useMemo(
    () => projects.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projects, templates, categories, activeCat, query],
  );
  const filtering = query.trim() !== "" || activeCat !== "all";
  const clearFilters = () => {
    setQuery("");
    setActiveCat("all");
    searchRef.current?.focus();
  };

  const [error, setError] = useState("");
  const handlePublish = async (id) => {
    setError("");
    try {
      await publishTemplate(id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- create flows (modal dialog, no window.prompt) ----
  const submitNewTemplate = async ({ title, category }) => {
    setDialog(null);
    const tpl = await createTemplate(title, category);
    onOpen(tpl.id);
  };
  const submitUseTemplate = async ({ title }) => {
    const tpl = dialog.tpl;
    setDialog(null);
    const proj = await createProjectFromTemplate(tpl.id, title);
    onOpen(proj.id);
  };

  const total = tab === "templates" ? templates.length : projects.length;
  const rows = [
    ...(tab === "templates" ? templateMatches : projectMatches),
  ].sort(SORTS[sort].fn);

  return (
    <div className="gallery">
      <header className="gallery-head">
        <div>
          <p className="gallery-eyebrow">Admin</p>
          <h1 className="gallery-title">My Designs</h1>
        </div>
        {tab === "templates" && can("templates.edit") && (
          <button
            className="g-btn g-btn--primary gallery-new"
            onClick={() => setDialog({ mode: "new" })}
          >
            <Plus size={15} /> New template
          </button>
        )}
      </header>

      <div className="gallery-tabs">
        <button
          className={tab === "templates" ? "is-active" : ""}
          onClick={() => setTab("templates")}
        >
          Templates{" "}
          <span className="tab-count">
            {filtering ? templateMatches.length : templates.length}
          </span>
        </button>
        <button
          className={tab === "projects" ? "is-active" : ""}
          onClick={() => setTab("projects")}
        >
          Projects{" "}
          <span className="tab-count">
            {filtering ? projectMatches.length : projects.length}
          </span>
        </button>
      </div>

      {/* search + sort */}
      <div className="gallery-toolbar" role="search">
        <label className="gallery-search">
          <span className="sr-only">Search designs</span>
          <Search
            size={16}
            aria-hidden="true"
            className="gallery-search-icon"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Search by title, category, status or template…"
            autoComplete="off"
            spellCheck={false}
          />
          {!query && (
            <kbd className="gallery-search-kbd" aria-hidden="true">
              /
            </kbd>
          )}
        </label>
        <label className="gallery-sort">
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, s]) => (
              <option key={k} value={k}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* category filter */}
      <div className="gallery-cats">
        <button
          className={activeCat === "all" ? "is-active" : ""}
          onClick={() => setActiveCat("all")}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={activeCat === c.id ? "is-active" : ""}
            onClick={() => setActiveCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="gallery-note">
        {tab === "templates" ? (
          <>
            <Globe size={13} /> Published templates are public and reusable.
            Draft templates are only visible here.
          </>
        ) : (
          <>
            <Lock size={13} /> Projects are private customer invitations — never
            shown publicly. Each keeps a version history you can roll back to.
          </>
        )}
      </p>

      {error && (
        <p className="gallery-error" role="alert">
          {error}
        </p>
      )}

      <p className="gallery-results" aria-live="polite">
        {filtering
          ? `${rows.length} of ${total} ${tab} match`
          : `${total} ${tab}`}
        {filtering && (
          <button
            type="button"
            className="gallery-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </p>

      <div className="gallery-grid">
        {rows.map((d) => (
          <div className="gdoc" key={d.id}>
            <div className="gdoc-swatches">
              {(d.preview ?? []).map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
              <span className={`gdoc-status status--${d.status}`}>
                {d.status}
              </span>
            </div>

            <div className="gdoc-body">
              <span className="gdoc-cat">{catLabel(d.category)}</span>
              <h3 className="gdoc-title">{d.title}</h3>
              {d.sourceTemplateId && (
                <p className="gdoc-sub">
                  from {templateTitle(d.sourceTemplateId)}
                </p>
              )}
              {d.shared && (
                <p className="gdoc-shared">
                  <Link2 size={12} /> Client link active
                </p>
              )}

              <div className="gdoc-actions">
                <button className="g-btn" onClick={() => onOpen(d.id)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="g-btn" onClick={() => setHistoryFor(d)}>
                  <History size={14} /> Versions
                </button>

                {tab === "projects" && can("projects.share") && (
                  <button
                    className="g-btn g-btn--primary"
                    onClick={() => setShareFor(d)}
                  >
                    <Share2 size={14} /> Share
                  </button>
                )}

                {tab === "templates" && (
                  <>
                    {d.status !== "published" && can("templates.publish") && (
                      <button
                        className="g-btn"
                        onClick={() => handlePublish(d.id)}
                      >
                        <UploadCloud size={14} /> Publish
                      </button>
                    )}
                    {can("projects.edit") && (
                      <button
                        className="g-btn g-btn--primary"
                        onClick={() => setDialog({ mode: "use", tpl: d })}
                      >
                        <FilePlus2 size={14} /> Use
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 &&
          (filtering ? (
            <div className="gallery-empty">
              <p>
                No {tab} match
                {query.trim() ? <> “{query.trim()}”</> : " this category"}.
              </p>
              <button type="button" className="g-btn" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <p className="gallery-empty">Nothing here yet.</p>
          ))}
      </div>

      {historyFor && (
        <VersionDrawer
          doc={historyFor}
          canRollback={can("versions.rollback")}
          onClose={() => setHistoryFor(null)}
          onRolledBack={() => {
            setHistoryFor(null);
            refresh();
          }}
        />
      )}

      {dialog?.mode === "new" && (
        <NewTemplateDialog
          categories={categories}
          onClose={() => setDialog(null)}
          onSubmit={submitNewTemplate}
        />
      )}
      {dialog?.mode === "use" && (
        <UseTemplateDialog
          tpl={dialog.tpl}
          onClose={() => setDialog(null)}
          onSubmit={submitUseTemplate}
        />
      )}
      {shareFor && (
        <ShareDialog
          project={shareFor}
          onClose={() => setShareFor(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

/**
 * Dialog: publish a project to its client via a private link.
 *  - not shared  → "Publish & create link" (marks the project done)
 *  - shared      → show/copy the link, issue a new link, or stop sharing
 */
function ShareDialog({ project, onClose, onChanged }) {
  const [share, setShare] = useState(undefined); // undefined = loading
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getShare(project.id).then(setShare);
  }, [project.id]);

  const active = !!share?.enabled;
  const url = active ? `${window.location.origin}/i/${share.token}` : "";

  const run = async (action) => {
    setBusy(true);
    try {
      setShare(await action(project.id));
      setCopied(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // clipboard blocked: the input is focusable/selectable as a fallback
      document.getElementById("share-link")?.select();
    }
  };

  return (
    <Dialog
      title={`Share "${project.title}"`}
      submitLabel={active ? "Done" : "Publish & create link"}
      onClose={onClose}
      onSubmit={() => (active ? onClose() : !busy && run(shareProject))}
    >
      {share === undefined ? (
        <p className="share-note">Loading…</p>
      ) : active ? (
        <>
          <p className="share-note">
            Send this private link to your client. Only people who have the link
            can open the invitation, and it never appears on the landing page.
          </p>
          <div className="share-link-row">
            <input
              id="share-link"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              aria-label="Private invitation link"
            />
            <button type="button" className="dlg-btn" onClick={copy}>
              {copied ? (
                <>
                  <Check size={14} /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
          <div className="share-actions">
            <button
              type="button"
              className="dlg-btn"
              disabled={busy}
              onClick={() => run(regenerateShareLink)}
            >
              <RefreshCw size={14} /> New link
            </button>
            <button
              type="button"
              className="dlg-btn share-stop"
              disabled={busy}
              onClick={() => run(stopSharing)}
            >
              <Link2Off size={14} /> Stop sharing
            </button>
          </div>
          <p className="share-hint">
            “New link” replaces this one and the old link stops working. “Stop
            sharing” turns the link off completely.
          </p>
        </>
      ) : (
        <p className="share-note">
          Publishing marks this project as <strong>done</strong> and creates a
          private link for your client.
          {share
            ? " Sharing was turned off earlier, so this creates a brand-new link."
            : ""}
        </p>
      )}
    </Dialog>
  );
}

/** Dialog: create a new template (name + category). */
function NewTemplateDialog({ categories, onClose, onSubmit }) {
  const [title, setTitle] = useState("Untitled template");
  const [category, setCategory] = useState(categories[0]?.id ?? "wedding");

  return (
    <Dialog
      title="New template"
      submitLabel="Create template"
      onClose={onClose}
      onSubmit={() =>
        onSubmit({ title: title.trim() || "Untitled template", category })
      }
    >
      <label className="dlg-field">
        <span>Template name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="dlg-field">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </Dialog>
  );
}

/** Dialog: create a project from a template (name only; category inherited). */
function UseTemplateDialog({ tpl, onClose, onSubmit }) {
  const [title, setTitle] = useState(`${tpl.title} — Draft`);

  return (
    <Dialog
      title={`Use "${tpl.title}"`}
      submitLabel="Create project"
      onClose={onClose}
      onSubmit={() =>
        onSubmit({ title: title.trim() || `${tpl.title} — Draft` })
      }
    >
      <label className="dlg-field">
        <span>Project name</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
    </Dialog>
  );
}

/** Slide-over listing a document's versions with a Restore action. */
function VersionDrawer({ doc, onClose, onRolledBack, canRollback = true }) {
  const [versions, setVersions] = useState(null);

  useEffect(() => {
    listVersions(doc.id).then(setVersions);
  }, [doc.id]);

  const handleRollback = async (version) => {
    await rollbackTo(doc.id, version);
    onRolledBack();
  };

  return (
    <div className="vdrawer-backdrop" onClick={onClose}>
      <aside className="vdrawer" onClick={(e) => e.stopPropagation()}>
        <header className="vdrawer-head">
          <div>
            <p className="vdrawer-eyebrow">Version history (immutable)</p>
            <h2>{doc.title}</h2>
          </div>
          <button className="vdrawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        {versions === null ? (
          <p className="vdrawer-loading">Loading…</p>
        ) : versions.length === 0 ? (
          <p className="vdrawer-loading">
            No versions yet — save to create one.
          </p>
        ) : (
          <ol className="vlist">
            {versions.map((v, i) => (
              <li className="vrow" key={v.version}>
                <div>
                  <span className="vrow-v">v{v.version}</span>
                  <span className="vrow-label">{v.label}</span>
                  <span className="vrow-date">
                    {new Date(v.savedAt).toLocaleString()}
                  </span>
                </div>
                {i === 0 ? (
                  <span className="vrow-current">current</span>
                ) : !canRollback ? null : (
                  <button
                    className="g-btn"
                    onClick={() => handleRollback(v.version)}
                  >
                    <RotateCcw size={13} /> Restore
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
