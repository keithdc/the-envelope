import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OPEN_TIMING as T } from "./timing.js";
import "./UnfoldOpen.css";

/**
 * "unfold" open animation: a folded card. Two side panels (gatefold) swing
 * open in 3D to reveal the invitation inside, then onOpened() advances.
 * Honors the registry contract: { data, assets, onOpened }.
 */
export default function UnfoldOpen({ data, assets, onOpened }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => !isOpen && setIsOpen(true);

  const sealImage = assets?.sealImage;

  return (
    <div
      className="unfold-fill"
      onClick={open}
      role="button"
      tabIndex={0}
      aria-label="Open the invitation"
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isOpen) {
          e.preventDefault();
          open();
        }
      }}
    >
      {/* BEAT 3: inner card rises into view after the panels have opened,
          holds a beat, then advances. */}
      <motion.div
        className="unfold-card"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={
          isOpen
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.92, y: 16 }
        }
        transition={{
          delay: isOpen ? T.letter.delay : 0,
          duration: T.letter.duration,
          ease: T.ease.rise,
        }}
        onAnimationComplete={() => {
          if (isOpen) setTimeout(onOpened, T.holdMs);
        }}
      >
        <p className="unfold-eyebrow">Together with their families</p>
        <div className="unfold-rule" />
        <h1 className="unfold-couple">{data.couple}</h1>
        <p className="unfold-date">{data.dateShort}</p>
      </motion.div>

      {/* BEAT 2: panels dip slightly, then swing slowly open. Starts after the
          seal has broken (1.0s). */}
      <motion.div
        className="gate gate-left"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpen ? [0, 4, -115] : 0 }}
        transition={{
          delay: isOpen ? T.cover.delay : 0,
          duration: T.cover.duration,
          times: T.cover.times,
          ease: T.ease.cover,
        }}
      />
      <motion.div
        className="gate gate-right"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isOpen ? [0, -4, 115] : 0 }}
        transition={{
          delay: isOpen ? T.cover.delay : 0,
          duration: T.cover.duration,
          times: T.cover.times,
          ease: T.ease.cover,
        }}
      />

      {/* BEAT 1: the seal presses, shudders, then lifts and fades. */}
      <motion.div
        className="unfold-seal"
        animate={
          isOpen
            ? { scale: [1, 0.94, 1.2], rotate: [0, -2, 3], opacity: [1, 1, 0] }
            : { scale: 1, rotate: 0, opacity: 1 }
        }
        transition={{
          delay: isOpen ? T.seal.delay : 0,
          duration: T.seal.duration,
          times: T.seal.times,
          ease: "easeInOut",
        }}
      >
        {sealImage ? (
          <img src={sealImage} alt="seal" />
        ) : (
          <span className="unfold-monogram">{data.sealMonogram ?? "A&L"}</span>
        )}
      </motion.div>

      <AnimatePresence>
        {!isOpen && (
          <motion.p
            className="unfold-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.9, 0.35] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            Tap to unfold
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
