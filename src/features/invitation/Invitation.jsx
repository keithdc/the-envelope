"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScratchCard from "./ScratchCard.jsx";
import InvitationSite from "./InvitationSite.jsx";
import { getOpenAnimation } from "../../animations/registry.jsx";
import { heartsFall, realisticBurst } from "../../lib/confetti.js";

const STAGES = { OPEN: "open", SCRATCH: "scratch", SITE: "site" };

/**
 * Renders one invitation from a TEMPLATE + DATA.
 *  - applies template.theme as CSS variables (scoped to this subtree)
 *  - mounts the template's chosen open animation (by key)
 *  - runs the shared scratch -> site flow
 *
 * Swapping the template changes the look + opening without touching sections.
 */
export default function Invitation({ template, data }) {
  const [stage, setStage] = useState(STAGES.OPEN);
  const [rsvp, setRsvp] = useState(null);

  const OpenAnimation = getOpenAnimation(template.openAnimation);
  const isSite = stage === STAGES.SITE;
  const appClass = isSite ? "app--site" : "app--full";

  // template.theme is a { "--var": "value" } map applied inline so it cascades.
  return (
    <div className={`app ${appClass}`} style={template.theme}>
      <AnimatePresence mode="wait">
        {stage === STAGES.OPEN && (
          <motion.div
            key="open"
            className="stage--full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <OpenAnimation
              data={data}
              assets={template.assets}
              onOpened={() => setStage(STAGES.SCRATCH)}
            />
          </motion.div>
        )}

        {stage === STAGES.SCRATCH && (
          <motion.div
            key="scratch"
            className="stage--full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ScratchCard
              event={data}
              onRevealed={() => {
                realisticBurst();
                heartsFall({ durationMs: 2200 });
                setStage(STAGES.SITE);
              }}
            />
          </motion.div>
        )}

        {stage === STAGES.SITE && (
          <motion.div
            key="site"
            className="site-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <InvitationSite event={data} rsvp={rsvp} onRsvp={setRsvp} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
