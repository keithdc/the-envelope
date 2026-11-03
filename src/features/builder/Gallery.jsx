"use client";

import { useEffect, useState } from "react";
import {
  FilePlus2,
  Pencil,
  UploadCloud,
  History,
  RotateCcw,
  Lock,
  Globe,
  Plus,
  X,
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
} from "../../services/invitationApi.js";
import Dialog from "./Dialog.jsx";
import "./Gallery.css";

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
export default function Gallery({ onOpen }) {
  const [tab, setTab] = useState("templates");
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [historyFor, setHistoryFor] = useState(null); // document summary
  const [dialog, setDialog] = useState(null); // { mode, tpl? }

  const refresh = () => {
    listTemplates().then(setTemplates);
    listProjects().then(setProjects);
  };
  useEffect(() => {
    refresh();
    listCategories().then(setCategories);
  }, []);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;

  const handlePublish = async (id) => {
    await publishTemplate(id);
    refresh();
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

  const all = tab === "templates" ? templates : projects;
  const rows =
    activeCat === "all" ? all : all.filter((d) => d.category === activeCat);

  return (
    <div className="gallery">
      <header className="gallery-head">
        <div>
          <p className="gallery-eyebrow">Admin</p>
          <h1 className="gallery-title">My Designs</h1>
        </div>
        {tab === "templates" && (
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
          Templates <span className="tab-count">{templates.length}</span>
        </button>
        <button
          className={tab === "projects" ? "is-active" : ""}
          onClick={() => setTab("projects")}
        >
          Projects <span className="tab-count">{projects.length}</span>
        </button>
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
                <p className="gdoc-sub">from {d.sourceTemplateId}</p>
              )}

              <div className="gdoc-actions">
                <button className="g-btn" onClick={() => onOpen(d.id)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="g-btn" onClick={() => setHistoryFor(d)}>
                  <History size={14} /> Versions
                </button>

                {tab === "templates" && (
                  <>
                    {d.status !== "published" && (
                      <button
                        className="g-btn"
                        onClick={() => handlePublish(d.id)}
                      >
                        <UploadCloud size={14} /> Publish
                      </button>
                    )}
                    <button
                      className="g-btn g-btn--primary"
                      onClick={() => setDialog({ mode: "use", tpl: d })}
                    >
                      <FilePlus2 size={14} /> Use
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p className="gallery-empty">Nothing here yet.</p>
        )}
      </div>

      {historyFor && (
        <VersionDrawer
          doc={historyFor}
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
    </div>
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
function VersionDrawer({ doc, onClose, onRolledBack }) {
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
                ) : (
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
