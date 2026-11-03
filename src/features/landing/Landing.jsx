"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getIcon } from "../../lib/icons.js";
import {
  listPublishedTemplates,
  listCategories,
  getDocument,
} from "../../services/invitationApi.js";
import BuilderPreview from "../builder/BuilderPreview.jsx";
import "./Landing.css";

/**
 * PUBLIC LANDING (client component)
 * -------------------------------------------------------------------------
 * Shows PUBLISHED templates only, grouped by category. Projects are never
 * shown here (they're private customer data). Clicking a template opens a
 * full-screen preview that runs the real invitation flow from that document.
 *
 * Data is read from the (localStorage-backed) mock API, so this hydrates on
 * the client; the page shell around it is server-rendered.
 */
export default function Landing() {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    listPublishedTemplates().then(setTemplates);
    listCategories().then(setCategories);
  }, []);

  const openPreview = async (id) => {
    const doc = await getDocument(id);
    setPreviewDoc(doc);
  };

  // group published templates by category (only categories that have any)
  const groups = categories
    .map((c) => ({
      category: c,
      items: templates.filter((t) => t.category === c.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="landing">
      <header className="landing-hero">
        <p className="landing-eyebrow">The Envelope</p>
        <h1 className="landing-title">Invitations for every occasion</h1>
        <p className="landing-sub">
          Browse our published designs. Found one you love? Open it in the
          <Link href="/admin"> studio</Link> to make it yours.
        </p>
      </header>

      {groups.length === 0 && (
        <p className="landing-empty">No published templates yet.</p>
      )}

      {groups.map(({ category, items }) => {
        const Icon = getIcon(category.icon ?? "sparkles");
        return (
          <section className="landing-cat" key={category.id}>
            <h2 className="landing-cat-title">
              <Icon size={18} /> {category.label}
            </h2>
            <div className="landing-grid">
              {items.map((t) => (
                <button
                  className="ltile"
                  key={t.id}
                  onClick={() => openPreview(t.id)}
                >
                  <div className="ltile-swatches">
                    {(t.preview ?? []).map((c) => (
                      <span key={c} style={{ background: c }} />
                    ))}
                  </div>
                  <span className="ltile-title">{t.title}</span>
                  <span className="ltile-cta">Preview →</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {previewDoc && (
        <div className="lpreview">
          <button
            className="lpreview-close"
            onClick={() => setPreviewDoc(null)}
          >
            ← Back to designs
          </button>
          <div className="lpreview-stage">
            <BuilderPreview doc={previewDoc} />
          </div>
        </div>
      )}
    </div>
  );
}
