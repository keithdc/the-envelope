"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDocument } from "../../../services/invitationApi.js";
import BuilderPreview from "../../../features/builder/BuilderPreview.jsx";

/**
 * /i/[slug] — PUBLIC invitation view (stub).
 * -------------------------------------------------------------------------
 * Today this reads a document by id from the mock API and runs the real
 * invitation flow. Once a backend exists, `slug` becomes a published
 * invitation's public slug and this page server-renders it (SSR) for fast
 * first paint + social/OG previews. The viewer stays a client component
 * because the flow is interactive (envelope → scratch → site).
 */
export default function PublicInvitePage() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getDocument(slug).then((d) => (d ? setDoc(d) : setMissing(true)));
  }, [slug]);

  if (missing)
    return <div className="builder-loading">Invitation not found.</div>;
  if (!doc) return <div className="builder-loading">Loading…</div>;

  return (
    <div style={{ minHeight: "100dvh" }}>
      <BuilderPreview doc={doc} />
    </div>
  );
}
