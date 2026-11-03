"use client";

import { motion } from "framer-motion";
import { templates } from "../data/templates.js";
import "./TemplatePicker.css";

/**
 * A simple gallery where you pick a template. Calls onSelect(template) which
 * the app uses to render the chosen invitation.
 */
export default function TemplatePicker({ onSelect }) {
  return (
    <div className="picker">
      <div className="picker-head">
        <p className="picker-eyebrow">Choose a design</p>
        <h1 className="picker-title">Wedding Invitations</h1>
        <p className="picker-sub">Pick a template to preview the invitation.</p>
      </div>

      <div className="picker-grid">
        {templates.map((t, i) => (
          <motion.button
            type="button"
            className="tpl-card"
            key={t.id}
            onClick={() => onSelect(t)}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            whileHover={{ y: -4 }}
          >
            {/* preview swatch strip using the template's own colors */}
            <div className="tpl-preview">
              {t.preview.map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
              <span className="tpl-anim">{t.openAnimation}</span>
            </div>
            <div className="tpl-body">
              <h2 className="tpl-name">{t.name}</h2>
              <p className="tpl-desc">{t.description}</p>
              <span className="tpl-open">Open this design →</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
