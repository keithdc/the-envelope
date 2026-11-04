"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Eye, X } from "lucide-react";
import { getIcon } from "../../lib/icons.js";
import PhoneFrame from "../../ui/PhoneFrame.jsx";
import BlurFade from "../../ui/BlurFade.jsx";
import {
  listPublishedTemplates,
  listCategories,
  getPublishedTemplate,
} from "../../services/invitationApi.js";
import "./DesignsGallery.css";

// Loaded only when someone opens a preview.
const BuilderPreview = dynamic(() => import("../builder/BuilderPreview.jsx"), {
  ssr: false,
  loading: () => <div className="dg-loading">Loading invitation…</div>,
});

/**
 * The public design collection. Shows PUBLISHED templates only (never
 * private projects), optionally grouped by category. "Preview" opens the real
 * invitation inside a phone, in an accessible dialog.
 *
 * @param {Object} props
 * @param {number} [props.limit]          show at most N designs (home teaser)
 * @param {boolean} [props.grouped=true]  group under category headings
 */
export default function DesignsGallery({ limit, grouped = true }) {
  const [templates, setTemplates] = useState(null); // null = loading
  const [categories, setCategories] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    listPublishedTemplates().then(setTemplates);
    listCategories().then(setCategories);
  }, []);

  const openPreview = async (id) => {
    const doc = await getPublishedTemplate(id);
    if (doc) setPreviewDoc(doc);
  };

  if (templates === null) {
    return <p className="dg-empty">Loading designs…</p>;
  }
  if (templates.length === 0) {
    return <p className="dg-empty">New designs are on the way.</p>;
  }

  const catOf = (id) => categories.find((c) => c.id === id);
  const shown = limit ? templates.slice(0, limit) : templates;

  const groups = grouped
    ? categories
        .map((c) => ({ category: c, items: shown.filter((t) => t.category === c.id) }))
        .filter((g) => g.items.length > 0)
    : [{ category: null, items: shown }];

  return (
    <>
      {groups.map(({ category, items }) => {
        const Icon = category ? getIcon(category.icon ?? "sparkles") : null;
        return (
          <section
            className="dg-group"
            key={category?.id ?? "all"}
            id={category?.id}
            aria-labelledby={category ? `dg-${category.id}` : undefined}
          >
            {category && (
              <h2 className="dg-group-title" id={`dg-${category.id}`}>
                <Icon size={18} aria-hidden="true" /> {category.label}
              </h2>
            )}
            <div className="dg-grid">
              {items.map((t, i) => (
                <BlurFade key={t.id} delay={i * 0.06}>
                  <DesignCard
                    tpl={t}
                    categoryLabel={catOf(t.category)?.label}
                    onPreview={() => openPreview(t.id)}
                  />
                </BlurFade>
              ))}
            </div>
          </section>
        );
      })}

      {previewDoc && (
        <PreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </>
  );
}

/** One design card: a colour "cover" built from the template's palette. */
function DesignCard({ tpl, categoryLabel, onPreview }) {
  const [a, b, c] = tpl.preview ?? [];
  return (
    <article className="dg-card">
      <div
        className="dg-cover"
        style={{
          background: `radial-gradient(120% 90% at 20% 10%, ${c ?? "#f3e4d6"}55, transparent 60%),
                       linear-gradient(150deg, ${a ?? "#c98a86"}, ${b ?? "#a9625d"})`,
        }}
        aria-hidden="true"
      >
        <span className="dg-cover-seal">✉</span>
        <span className="dg-cover-title">{tpl.title}</span>
      </div>
      <div className="dg-body">
        {categoryLabel && <span className="dg-cat">{categoryLabel}</span>}
        <h3 className="dg-title">{tpl.title}</h3>
        <button type="button" className="dg-preview" onClick={onPreview}>
          <Eye size={15} aria-hidden="true" /> Preview live
        </button>
      </div>
    </article>
  );
}

/** Modal with the real invitation running inside a phone. */
function PreviewDialog({ doc, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock page scroll behind the dialog
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="dg-dialog-backdrop" onClick={onClose}>
      <div
        className="dg-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Preview: ${doc.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dg-dialog-head">
          <p className="dg-dialog-title">{doc.title}</p>
          <button
            ref={closeRef}
            type="button"
            className="dg-dialog-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>
        <p className="dg-dialog-hint">Tap the envelope to open it, just like your guests will.</p>
        <PhoneFrame className="dg-phone" beam label={`${doc.title} invitation`}>
          <BuilderPreview doc={doc} />
        </PhoneFrame>
      </div>
    </div>
  );
}
