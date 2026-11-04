"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcw } from "lucide-react";
import PhoneFrame from "../../ui/PhoneFrame.jsx";
import {
  listPublishedTemplates,
  getPublishedTemplate,
} from "../../services/invitationApi.js";
import "./LiveDemo.css";

// The invitation render tree is heavy (framer-motion, canvas, confetti), so it
// loads only on the client, after the page shell.
const BuilderPreview = dynamic(() => import("../builder/BuilderPreview.jsx"), {
  ssr: false,
  loading: () => <div className="live-demo-loading">Loading invitation…</div>,
});

/**
 * A real, interactive invitation inside a phone mock. Guests' exact
 * experience: tap the envelope, scratch the reveal, scroll the site.
 * Only PUBLISHED templates are offered (never private projects).
 *
 * @param {{ beam?: boolean, className?: string }} props
 */
export default function LiveDemo({ beam = true, className = "" }) {
  const [templates, setTemplates] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [doc, setDoc] = useState(null);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    listPublishedTemplates().then((list) => {
      setTemplates(list);
      if (list.length) setActiveId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    getPublishedTemplate(activeId).then((d) => alive && setDoc(d));
    return () => {
      alive = false;
    };
  }, [activeId]);

  return (
    <div className={`live-demo ${className}`}>
      <PhoneFrame beam={beam} label="Live invitation demo">
        {doc ? (
          // key remounts the flow so switching/replaying starts at the envelope
          <BuilderPreview key={`${doc.id}-${replay}`} doc={doc} />
        ) : (
          <div className="live-demo-loading">Loading invitation…</div>
        )}
      </PhoneFrame>

      {templates.length > 0 && (
        <div className="live-demo-controls">
          <div
            className="live-demo-chips"
            role="radiogroup"
            aria-label="Choose a design to preview"
          >
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === activeId}
                className={t.id === activeId ? "is-active" : ""}
                onClick={() => {
                  setActiveId(t.id);
                  setReplay((r) => r + 1);
                }}
              >
                <span
                  className="live-demo-dot"
                  style={{ background: t.preview?.[0] }}
                  aria-hidden="true"
                />
                {t.title}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="live-demo-replay"
            onClick={() => setReplay((r) => r + 1)}
          >
            <RotateCcw size={14} aria-hidden="true" /> Replay
          </button>
        </div>
      )}
    </div>
  );
}
