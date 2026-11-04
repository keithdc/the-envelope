"use client";

import { useEffect, useState } from "react";
import { getSharedInvitation } from "../../services/invitationApi.js";
import BuilderPreview from "../builder/BuilderPreview.jsx";
import "./SharedInvitation.css";

/**
 * The REAL invitation a client receives at /i/<token>.
 * -------------------------------------------------------------------------
 * Deliberately bare: no back button, no "designs"/studio links, no admin
 * chrome — it is the invitation and nothing else. The token is the only key;
 * an unknown, replaced, or turned-off link shows a neutral "not valid" page
 * and never falls back to any other document.
 *
 * @param {{ token: string }} props
 */
export default function SharedInvitation({ token }) {
  const [state, setState] = useState({ status: "loading", doc: null });

  useEffect(() => {
    let alive = true;
    getSharedInvitation(token).then((doc) => {
      if (!alive) return;
      setState(doc ? { status: "ready", doc } : { status: "invalid", doc: null });
    });
    return () => {
      alive = false;
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="si-message" role="status">
        Opening your invitation…
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <main className="si-message">
        <p className="si-title">This invitation link isn't valid</p>
        <p>
          It may have been mistyped, replaced, or turned off. Please ask the
          person who sent it to you for the current link.
        </p>
      </main>
    );
  }

  return (
    <main className="si-stage">
      <BuilderPreview doc={state.doc} />
    </main>
  );
}
