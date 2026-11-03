import { useState } from "react";
import { motion } from "framer-motion";
import { realisticBurst, sideCannons } from "../../lib/confetti.js";
import "./RsvpForm.css";

const EMPTY = { name: "", email: "", attending: "yes", guests: 1, note: "" };

/**
 * Stage 3: the RSVP form.
 * Controlled inputs with light validation. On submit we hand the data up to
 * App via onSubmit(). In a real app this is where you'd POST to an API or a
 * database endpoint.
 */
export default function RsvpForm({
  event,
  submitted,
  onSubmit,
  embedded = false,
}) {
  const [form, setForm] = useState(submitted ?? EMPTY);
  const [errors, setErrors] = useState({});

  // When embedded in the wedding site, the surrounding Section already
  // provides the surface, so we drop the standalone card shell.
  const shellClass = embedded ? "rsvp-embedded" : "card rsvp-card";

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Celebrate a "yes" with confetti cannons; a polite "no" skips the party.
    if (form.attending === "yes") {
      realisticBurst();
      sideCannons({ durationMs: 2600 });
    }
    // Hand the confirmed data up to the parent.
    onSubmit({ ...form, submittedAt: new Date().toISOString() });
  };

  // Confirmation view once submitted.
  if (submitted) {
    return (
      <motion.div
        className={shellClass}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="check">✓</div>
        <p className="couple">Thank you, {submitted.name.split(" ")[0]}!</p>
        <div className="divider" />
        {submitted.attending === "yes" ? (
          <p className="confirm-text">
            We can't wait to celebrate with you at{" "}
            <strong>{event.venue}</strong> on {event.date}.
          </p>
        ) : (
          <p className="confirm-text">
            We'll miss you, but thank you for letting us know. Sending love your
            way.
          </p>
        )}
        {submitted.attending === "yes" && (
          <p className="confirm-sub">
            Party size: {submitted.guests}{" "}
            {submitted.guests > 1 ? "guests" : "guest"}
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className={shellClass}>
      {!embedded && (
        <>
          <p className="eyebrow">Will you join us?</p>
          <p className="couple">RSVP</p>
          <div className="divider" />
        </>
      )}

      <form className="rsvp-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Full name</span>
          <input
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="Jordan Avery"
            aria-invalid={!!errors.name}
          />
          {errors.name && <small className="err">{errors.name}</small>}
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="jordan@email.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && <small className="err">{errors.email}</small>}
        </label>

        <label className="field">
          <span>Will you attend?</span>
          <select value={form.attending} onChange={update("attending")}>
            <option value="yes">Joyfully accepts</option>
            <option value="no">Regretfully declines</option>
          </select>
        </label>

        {form.attending === "yes" && (
          <label className="field">
            <span>Number of guests</span>
            <select value={form.guests} onChange={update("guests")}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="field">
          <span>A note for the couple (optional)</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={update("note")}
            placeholder="So happy for you both!"
          />
        </label>

        <button type="submit" className="submit-btn">
          Send RSVP
        </button>
      </form>
    </div>
  );
}
