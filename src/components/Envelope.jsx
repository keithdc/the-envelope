import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OPEN_TIMING as T } from "../animations/timing.js";
import "./Envelope.css";

/**
 * Stage 1: a full-bleed, edge-to-edge envelope that fills the entire screen,
 * like a real envelope you are holding.
 *
 * Structure (back to front):
 *   - .env-letter   : the card tucked inside, revealed on open
 *   - .env-base     : the back/inside wall (shows when the flap lifts)
 *   - .env-pocket   : the front pocket with the big upward V notch
 *   - .env-flap     : the full-width triangular flap that folds up on open
 *   - .seal         : the embossed wax monogram on the flap's point
 *
 * Opening is a deliberate, dramatic 3-beat sequence (~4.5s total):
 *   BEAT 1 (0.00s)  the wax seal presses, shudders, then lifts and fades
 *   BEAT 2 (1.10s)  the flap dips slightly, then folds slowly fully open
 *   BEAT 3 (2.50s)  the letter rises gracefully out, holds, then advances
 */
export default function Envelope({ event, onOpened }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => !isOpen && setIsOpen(true);

  // When a paper-texture image is provided, expose it as a CSS variable the
  // stylesheet picks up to overlay the flap + pocket.
  const fillStyle = event.paperTexture
    ? { "--paper-texture": `url(${event.paperTexture})` }
    : undefined;

  return (
    <div
      className={`env-fill ${isOpen ? "is-open" : ""}`}
      style={fillStyle}
      onClick={open}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation envelope"
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isOpen) {
          e.preventDefault();
          open();
        }
      }}
    >
      {/* The letter card tucked inside, slides up on open */}
      <motion.div
        className="env-letter"
        /* x:-50% keeps the letter horizontally centered. It MUST live here in
           the motion transform — if centering were a CSS `translateX(-50%)`,
           Framer Motion's y-animation would overwrite the whole transform and
           knock the letter off-center (it was being pushed off-screen). */
        /* Starts tucked low inside the pocket (hidden). On open it rises up
           and out, scaling to its resting size, emerging above the pocket.
           Centering (x:-50%) stays in the motion transform the whole time. */
        initial={{ x: "-50%", y: "62%", scale: 0.88, opacity: 0 }}
        animate={
          isOpen
            ? { x: "-50%", y: "0%", scale: 1, opacity: 1 }
            : { x: "-50%", y: "62%", scale: 0.88, opacity: 0 }
        }
        /* BEAT 3 (the climax): the letter rises slowly out of the envelope,
           after the cover has opened. Timing from the shared config. */
        transition={{
          delay: isOpen ? T.letter.delay : 0,
          duration: T.letter.duration,
          ease: T.ease.rise,
          opacity: {
            delay: isOpen ? T.letter.delay : 0,
            duration: T.letter.fadeDuration,
          },
        }}
        onAnimationComplete={() => {
          // hold a beat on the fully revealed letter before advancing
          if (isOpen) setTimeout(onOpened, T.holdMs);
        }}
      >
        <div className="letter-inner">
          <p className="letter-eyebrow">Together with their families</p>
          <div className="letter-rule" />
          <h1 className="letter-couple">{event.couple}</h1>
          <p className="letter-sub">request the pleasure of your company</p>
          <p className="letter-date">{event.dateShort}</p>
        </div>
      </motion.div>

      {/* Inside/back wall, revealed as the flap lifts */}
      <div className="env-base" />

      {/* Front pocket with the big V notch */}
      <div className="env-pocket" />

      {/* Postage stamp in the bottom-right of the envelope front (only when an
          image is provided). Fades out as the envelope opens. */}
      {event.stampImage && (
        <motion.img
          className="env-stamp"
          src={event.stampImage}
          alt="postage stamp"
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* The flap folds open around its top edge, revealing the inside. */}
      <motion.div
        className="env-flap"
        initial={{ rotateX: 0 }}
        /* BEAT 2: a slow, weighty fold. A tiny backward dip first (anticipation)
           then it swings fully open. Timing from the shared config. */
        animate={{ rotateX: isOpen ? [0, 6, -158] : 0 }}
        transition={{
          delay: isOpen ? T.cover.delay : 0,
          duration: T.cover.duration,
          times: T.cover.times,
          ease: T.ease.cover,
        }}
      >
        {/* front face (visible closed) with texture + sheen */}
        <div className="flap-face">
          <div className="flap-texture" />
          <div className="flap-sheen" />
        </div>
        {/* underside face (visible once it folds past vertical) */}
        <div className="flap-back" />
      </motion.div>

      {/* Embossed wax seal at the center seam */}
      <motion.div
        className="seal"
        /* BEAT 1: the wax seal "breaks" — a subtle press inward, a small
           shudder, then it lifts and fades. Slow and deliberate (0.95s). */
        animate={
          isOpen
            ? {
                scale: [1, 0.94, 1.28],
                rotate: [0, -2, 3],
                y: [0, 2, -34],
                opacity: [1, 1, 0],
              }
            : { scale: 1, rotate: 0, y: 0, opacity: 1 }
        }
        transition={{
          delay: isOpen ? T.seal.delay : 0,
          duration: T.seal.duration,
          times: T.seal.times,
          ease: "easeInOut",
        }}
      >
        {event.sealImage ? (
          /* Drop in a real wax-seal PNG (transparent background) for full
             realism; it replaces the CSS seal entirely. */
          <img className="seal-image" src={event.sealImage} alt="wax seal" />
        ) : (
          <>
            {/* irregular molten-wax blob behind the pressed disc */}
            <div className="seal-blob" />
            <div className="seal-disc">
              <span className="seal-shine" />
              <span className="seal-monogram">
                {event.sealMonogram ?? "A&L"}
              </span>
            </div>
          </>
        )}
      </motion.div>

      {/* Pulsing hint */}
      <AnimatePresence>
        {!isOpen && (
          <motion.p
            className="env-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.9, 0.35] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap to open
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
