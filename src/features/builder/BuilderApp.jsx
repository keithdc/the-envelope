"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Check,
  Pencil,
  RotateCcw,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getInvitation,
  saveInvitation,
  uploadAsset,
} from "../../services/invitationApi.js";
import { getSectionDef } from "./sectionRegistry.js";
import BuilderPreview from "./BuilderPreview.jsx";
import SectionEditor from "./SectionEditor.jsx";
import { getIcon } from "../../lib/icons.js";
import "./BuilderApp.css";

/**
 * Minimal split-screen builder shell:
 *   LEFT  — configuration: theme colors + section toggles/reordering
 *   RIGHT — a phone-framed live preview of the document
 *
 * This is a DRAFT scaffold that proves the data flow: everything edits one
 * InvitationDocument in state, the preview re-renders from it, and Save sends
 * that exact document to the (mock) API. A real backend swaps only the API.
 */
export default function BuilderApp({ docId, onBack }) {
  const [doc, setDoc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [editingId, setEditingId] = useState(null); // which section row is open
  const [previewKey, setPreviewKey] = useState(0); // bump to restart the preview

  useEffect(() => {
    getInvitation(docId).then(setDoc);
  }, [docId]);

  // sections sorted by their order field
  const sections = useMemo(
    () => (doc ? [...doc.sections].sort((a, b) => a.order - b.order) : []),
    [doc],
  );

  if (!doc) return <div className="builder-loading">Loading builder…</div>;

  const update = (patch) => setDoc((d) => ({ ...d, ...patch }));

  const setTheme = (key, value) =>
    setDoc((d) => ({ ...d, theme: { ...d.theme, [key]: value } }));

  const toggleSection = (id) =>
    setDoc((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      ),
    }));

  // update one section's props (from the SectionEditor)
  const setSectionProps = (id, props) =>
    setDoc((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === id ? { ...s, props } : s)),
    }));

  // move a section up/down by swapping order values with its neighbor
  const moveSection = (id, dir) => {
    setDoc((d) => {
      const ordered = [...d.sections].sort((a, b) => a.order - b.order);
      const i = ordered.findIndex((s) => s.id === id);
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= ordered.length) return d;
      const a = ordered[i];
      const b = ordered[j];
      return {
        ...d,
        sections: d.sections.map((s) => {
          if (s.id === a.id) return { ...s, order: b.order };
          if (s.id === b.id) return { ...s, order: a.order };
          return s;
        }),
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const saved = await saveInvitation(doc);
    setDoc(saved);
    setSaving(false);
    setSavedAt(Date.now());
  };

  // ---- couple / event-level content ----
  const setCouple = (key, value) =>
    setDoc((d) => ({ ...d, couple: { ...d.couple, [key]: value } }));

  const setName = (index, value) =>
    setDoc((d) => {
      const names = [...(d.couple.names ?? [])];
      names[index] = value;
      return { ...d, couple: { ...d.couple, names } };
    });

  const addName = () =>
    setDoc((d) => ({
      ...d,
      couple: { ...d.couple, names: [...(d.couple.names ?? []), ""] },
    }));

  const removeName = (index) =>
    setDoc((d) => {
      const names = (d.couple.names ?? []).filter((_, i) => i !== index);
      return { ...d, couple: { ...d.couple, names } };
    });

  // dateISO is stored without a timezone (e.g. "2027-04-17T16:00:00"); the
  // <input type="datetime-local"> value uses "2027-04-17T16:00", so trim/pad.
  const dateInputValue = (doc.couple?.dateISO ?? "").slice(0, 16);
  const setDate = (value) => setCouple("dateISO", value ? `${value}:00` : "");

  // Scratch-reveal photo lives on doc.couple.photo (an AssetRef or url string).
  const photoUrl =
    typeof doc.couple?.photo === "object"
      ? doc.couple.photo?.url
      : doc.couple?.photo;
  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ref = await uploadAsset(file);
    setCouple("photo", ref);
  };

  // ---- envelope config ----
  const setEnvelope = (key, value) =>
    setDoc((d) => ({ ...d, envelope: { ...d.envelope, [key]: value } }));

  // upload a handcrafted asset and store its AssetRef on the envelope
  const uploadEnvelopeAsset = (key) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ref = await uploadAsset(file);
    setEnvelope(key, ref);
  };

  // Each color maps to a CSS variable used across the real components. The
  // "affects" copy tells the user exactly what changes on the page.
  const colorFields = [
    [
      "rose",
      "Rose",
      "Soft section & hero background washes (the blush-pink panels).",
    ],
    [
      "roseDeep",
      "Deep rose",
      "Primary accent text: eyebrows, section headings, dates & links.",
    ],
    ["gold", "Gold", "Dividers, ornaments, story years and link underlines."],
    ["ink", "Ink", "Main body text and couple names."],
    ["blush", "Blush", "The page background wash behind every section."],
  ];

  // Curated Google-font options. Values are CSS font-family stacks stored on
  // theme.fontScript / theme.fontSerif. Values reference the next/font CSS
  // variables declared in src/app/layout.jsx (self-hosted Google fonts).
  const scriptFonts = [
    ["var(--f-pinyon), cursive", "Pinyon Script"],
    ["var(--f-great-vibes), cursive", "Great Vibes"],
    ["var(--f-dancing), cursive", "Dancing Script"],
    ["var(--f-allura), cursive", "Allura"],
  ];
  const serifFonts = [
    ["var(--f-forum), Georgia, serif", "Forum"],
    ["var(--f-cormorant), Georgia, serif", "Cormorant Garamond"],
    ["var(--f-playfair), Georgia, serif", "Playfair Display"],
    ["var(--f-eb-garamond), Georgia, serif", "EB Garamond"],
  ];

  const assetSlots = [
    ["sealImage", "Wax seal"],
    ["stampImage", "Stamp"],
    ["paperTexture", "Paper texture"],
  ];

  return (
    <div className="builder">
      {/* LEFT: configuration ------------------------------------------- */}
      <aside className="builder-panel">
        {onBack && (
          <button type="button" className="builder-back" onClick={onBack}>
            <ArrowLeft size={15} /> Designs
          </button>
        )}
        <header className="builder-panel-head">
          <input
            className="builder-title"
            value={doc.title}
            onChange={(e) => update({ title: e.target.value })}
            aria-label="Invitation title"
          />
          <button
            className="builder-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              "Saving…"
            ) : savedAt ? (
              <>
                <Check size={15} /> Saved
              </>
            ) : (
              <>
                <Save size={15} /> Save
              </>
            )}
          </button>
        </header>

        {/* General: typography system (two main fonts) */}
        <section className="builder-group">
          <h2>General</h2>

          <label className="env-field">
            <span>Script font (names &amp; calligraphy)</span>
            <select
              value={doc.theme.fontScript}
              onChange={(e) => setTheme("fontScript", e.target.value)}
              style={{ fontFamily: doc.theme.fontScript }}
            >
              {scriptFonts.map(([value, label]) => (
                <option key={value} value={value} style={{ fontFamily: value }}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="env-field">
            <span>Serif font (headings &amp; labels)</span>
            <select
              value={doc.theme.fontSerif}
              onChange={(e) => setTheme("fontSerif", e.target.value)}
              style={{ fontFamily: doc.theme.fontSerif }}
            >
              {serifFonts.map(([value, label]) => (
                <option key={value} value={value} style={{ fontFamily: value }}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <p className="builder-hint">
            The <strong>script</strong> font styles the couple&apos;s names and
            ornamental accents. The <strong>serif</strong> font styles section
            headings and small-caps labels. Body text stays on a readable serif.
          </p>
        </section>

        {/* Event details: who + when + where (edits doc.couple) */}
        <section className="builder-group">
          <h2>Event details</h2>

          <div className="names-field">
            <span className="names-field-label">
              Celebrating — name(s) of the person/people
            </span>
            {(doc.couple.names ?? []).map((name, i) => (
              <div className="name-row" key={i}>
                <input
                  type="text"
                  value={name}
                  placeholder={`Name ${i + 1}`}
                  onChange={(e) => setName(i, e.target.value)}
                  aria-label={`Name ${i + 1}`}
                />
                <button
                  type="button"
                  className="name-remove"
                  title="Remove name"
                  onClick={() => removeName(i)}
                  disabled={(doc.couple.names ?? []).length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="name-add" onClick={addName}>
              <Plus size={14} /> Add a person
            </button>
          </div>

          {/* Scratch-reveal photo (shown under the foil medallion) */}
          <div className="photo-field">
            <span className="names-field-label">Scratch-reveal photo</span>
            <div className="photo-row">
              <div className="photo-thumb">
                {photoUrl ? (
                  <img src={photoUrl} alt="Scratch reveal" />
                ) : (
                  <span>No photo</span>
                )}
              </div>
              <div className="photo-actions">
                <label className="env-upload">
                  Upload photo
                  <input type="file" accept="image/*" onChange={uploadPhoto} />
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    className="env-clear"
                    onClick={() => setCouple("photo", "")}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <p className="builder-hint">
              This photo is hidden under the gold foil on the scratch card and
              revealed when a guest scratches it. Empty shows a placeholder.
            </p>
          </div>

          <label className="env-field">
            <span>Name joiner</span>
            <input
              type="text"
              value={doc.couple.nameJoiner ?? ""}
              placeholder="&"
              onChange={(e) => setCouple("nameJoiner", e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>Tagline</span>
            <input
              type="text"
              value={doc.couple.tagline ?? ""}
              placeholder="are getting married"
              onChange={(e) => setCouple("tagline", e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>Date &amp; time</span>
            <input
              type="datetime-local"
              value={dateInputValue}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>Venue</span>
            <input
              type="text"
              value={doc.couple.venue ?? ""}
              onChange={(e) => setCouple("venue", e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>City</span>
            <input
              type="text"
              value={doc.couple.venueCity ?? ""}
              onChange={(e) => setCouple("venueCity", e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>Address</span>
            <textarea
              rows={2}
              value={doc.couple.address ?? ""}
              onChange={(e) => setCouple("address", e.target.value)}
            />
          </label>

          <label className="env-field">
            <span>Map link</span>
            <input
              type="url"
              value={doc.couple.mapUrl ?? ""}
              placeholder="https://maps.google.com/…"
              onChange={(e) => setCouple("mapUrl", e.target.value)}
            />
          </label>

          <p className="builder-hint">
            These names drive the couple/celebrant headings everywhere (hero,
            footer, scratch card) and the wax-seal monogram — all derived
            automatically. Add one name for a birthday, two for a wedding.
          </p>
        </section>

        {/* Envelope */}
        <section className="builder-group">
          <h2>Envelope</h2>

          <label className="env-field">
            <span>Opening animation</span>
            <select
              value={doc.envelope.openAnimation}
              onChange={(e) => setEnvelope("openAnimation", e.target.value)}
            >
              <option value="flap">Envelope flap (fold open)</option>
              <option value="unfold">Gatefold (panels unfold)</option>
            </select>
          </label>

          <label className="env-field">
            <span>Seal monogram</span>
            <input
              type="text"
              value={doc.envelope.sealMonogram ?? ""}
              placeholder="e.g. K & B"
              onChange={(e) => setEnvelope("sealMonogram", e.target.value)}
            />
          </label>

          {/* handcrafted art slots — upload replaces the pure-CSS rendering */}
          <div className="env-assets">
            {assetSlots.map(([key, label]) => {
              const ref = doc.envelope[key];
              return (
                <div className="env-asset" key={key}>
                  <div className="env-asset-thumb">
                    {ref?.url ? (
                      <img src={ref.url} alt={label} />
                    ) : (
                      <span>CSS</span>
                    )}
                  </div>
                  <div className="env-asset-main">
                    <span className="env-asset-label">{label}</span>
                    <div className="env-asset-actions">
                      <label className="env-upload">
                        Upload
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={uploadEnvelopeAsset(key)}
                        />
                      </label>
                      {ref && (
                        <button
                          type="button"
                          className="env-clear"
                          onClick={() => setEnvelope(key, null)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="builder-hint">
            Upload professional handcrafted art (transparent PNG/SVG). Empty
            slots fall back to the built-in CSS rendering.
          </p>
        </section>

        {/* Colors */}
        <section className="builder-group">
          <h2>Colors</h2>
          <p className="builder-hint builder-hint--top">
            Each color drives one part of the design. Hover a swatch to see what
            it changes.
          </p>
          <ul className="color-list">
            {colorFields.map(([key, label, affects]) => (
              <li className="color-row" key={key} title={affects}>
                <input
                  type="color"
                  value={doc.theme[key]}
                  onChange={(e) => setTheme(key, e.target.value)}
                  aria-label={label}
                />
                <div className="color-row-text">
                  <span className="color-row-name">{label}</span>
                  <span className="color-row-affects">{affects}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sections: toggle + reorder */}
        <section className="builder-group">
          <h2>Sections</h2>
          <ul className="section-list">
            {sections.map((s, i) => {
              const def = getSectionDef(s.type);
              const Icon = getIcon(def?.icon ?? "sparkles");
              const isEditing = editingId === s.id;
              return (
                <li className="section-item" key={s.id}>
                  <div className={`section-row ${s.enabled ? "" : "is-off"}`}>
                    <Icon className="section-row-icon" size={18} />
                    <span className="section-row-name">
                      {def?.name ?? s.type}
                    </span>

                    <div className="section-row-actions">
                      <button
                        title="Edit"
                        className={isEditing ? "is-active" : ""}
                        onClick={() => setEditingId(isEditing ? null : s.id)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        title="Move up"
                        onClick={() => moveSection(s.id, "up")}
                        disabled={i === 0}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        title="Move down"
                        onClick={() => moveSection(s.id, "down")}
                        disabled={i === sections.length - 1}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        title={s.enabled ? "Hide" : "Show"}
                        onClick={() => toggleSection(s.id)}
                        disabled={def && def.removable === false}
                      >
                        {s.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <SectionEditor
                      section={s}
                      onChange={(props) => setSectionProps(s.id, props)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <p className="builder-hint">
            Toggle the eye to show/hide a section. Use the arrows to reorder.
            Drag-and-drop and per-section editing come next.
          </p>
        </section>
      </aside>

      {/* RIGHT: live mobile preview ------------------------------------ */}
      <main className="builder-stage">
        <button
          type="button"
          className="preview-refresh"
          title="Restart the invitation from the envelope"
          onClick={() => setPreviewKey((k) => k + 1)}
        >
          <RotateCcw size={15} /> Restart
        </button>
        <div className="device-shell">
          <div className="device">
            <div className="device-notch" />
            <div className="device-screen">
              {/* key bump remounts the preview -> flow restarts at the envelope */}
              <BuilderPreview key={previewKey} doc={doc} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
