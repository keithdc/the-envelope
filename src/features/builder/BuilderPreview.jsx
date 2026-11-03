"use client";

import { useState } from "react";
import { getOpenAnimation } from "../../animations/registry.jsx";
import ScratchCard from "../invitation/ScratchCard.jsx";
import InvitationSite from "../invitation/InvitationSite.jsx";
import {
  documentToEvent,
  documentToEnvelope,
  themeToVars,
} from "../../services/documentAdapter.js";
import "./BuilderPreview.css";

/**
 * Live preview that renders the REAL components (Envelope -> ScratchCard ->
 * WeddingSite) from the builder document — no reimplementation, so it matches
 * the production app exactly (footer, confetti, styling, fit).
 *
 * Mirrors Invitation.jsx's OPEN -> SCRATCH -> SITE stage machine. The theme is
 * applied as CSS variables on the root. Remounting (via a key from the parent)
 * restarts the flow at the envelope.
 */
export default function BuilderPreview({ doc }) {
  const [stage, setStage] = useState("open"); // open | scratch | site
  const [rsvp, setRsvp] = useState(null);

  const event = documentToEvent(doc);
  const { data: animData, assets: animAssets } = documentToEnvelope(doc);
  const OpenAnimation = getOpenAnimation(doc.envelope?.openAnimation);
  const scratchStage = doc.scratch?.enabled !== false;

  const style = themeToVars(doc.theme);
  const isSite = stage === "site";

  return (
    <div className={`pv ${isSite ? "pv--site" : "pv--full"}`} style={style}>
      {stage === "open" && (
        <div className="pv-stage">
          <OpenAnimation
            data={animData}
            assets={animAssets}
            onOpened={() => setStage(scratchStage ? "scratch" : "site")}
          />
        </div>
      )}

      {stage === "scratch" && (
        <div className="pv-stage">
          <ScratchCard event={event} onRevealed={() => setStage("site")} />
        </div>
      )}

      {stage === "site" && (
        <InvitationSite
          event={event}
          rsvp={rsvp}
          onRsvp={setRsvp}
          sections={doc.sections}
        />
      )}
    </div>
  );
}
