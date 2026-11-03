import { motion } from "framer-motion";
import { CalendarDays, Leaf, MapPin, ArrowUpRight } from "lucide-react";
import Countdown from "./Countdown.jsx";
import RsvpForm from "./RsvpForm.jsx";
import { getIcon } from "./icons.js";
import "./WeddingSite.css";

// Small reusable wrapper that fades a section in as it scrolls into view.
function Section({ id, variant = "light", children }) {
  return (
    <motion.section
      id={id}
      className={`section section--${variant}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="section-inner">{children}</div>
    </motion.section>
  );
}

// Today's date formatted like "Saturday, June 13, 2026".
function todayLong() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SectionTitle({ eyebrow, title }) {
  return (
    <>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      <div className="divider" />
    </>
  );
}

/**
 * The full scrollable wedding microsite revealed after the scratch card.
 * Composed of many stacked sections, each reading from the shared EVENT data.
 */
export default function WeddingSite({ event, rsvp, onRsvp }) {
  return (
    <div className="wedding-site">
      {/* HERO ---------------------------------------------------------- */}
      <header className="hero">
        <div className="hero-overlay" />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="hero-eyebrow">We're getting married</p>
          <h1 className="hero-names">
            {event.firstNames[0]}
            <span className="amp"> &amp; </span>
            {event.firstNames[1]}
          </h1>
          <div className="hero-ornament" aria-hidden="true" />
          <p className="hero-date">{event.dateShort}</p>
          <p className="hero-place">{event.venueCity}</p>
        </motion.div>
      </header>

      {/* COUNTDOWN ----------------------------------------------------- */}
      <Section id="countdown" variant="rose">
        <SectionTitle eyebrow="The big day" title="Counting Down" />
        <div className="cd-dates">
          <div className="cd-date">
            <span className="cd-date-label">Today</span>
            <span className="cd-date-value">{todayLong()}</span>
          </div>
          <span className="cd-date-arrow">→</span>
          <div className="cd-date">
            <span className="cd-date-label">The Wedding</span>
            <span className="cd-date-value">{event.date}</span>
          </div>
        </div>
        <Countdown targetISO={event.dateISO} />
        <p className="cd-note">until we say "I do"</p>
      </Section>

      {/* OUR STORY ----------------------------------------------------- */}
      <Section id="story" variant="light">
        <SectionTitle eyebrow="How it began" title="Our Story" />
        <div className="story-list">
          {event.story.map((s) => (
            <div className="story-item" key={s.year}>
              <span className="story-year">{s.year}</span>
              <div className="story-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* DATE & TIME --------------------------------------------------- */}
      <Section id="details" variant="rose">
        <SectionTitle eyebrow="Save the date" title="When & Where" />
        <div className="detail-grid">
          <div className="detail-box">
            <CalendarDays className="detail-icon" aria-hidden="true" />
            <h3>The Date</h3>
            <p>{event.date}</p>
            <p className="muted">{event.time}</p>
          </div>
          <div className="detail-box">
            <Leaf className="detail-icon" aria-hidden="true" />
            <h3>The Venue</h3>
            <p>{event.venue}</p>
            <p className="muted">{event.address}</p>
          </div>
        </div>
      </Section>

      {/* TIMELINE ------------------------------------------------------ */}
      <Section id="timeline" variant="light">
        <SectionTitle eyebrow="The day" title="Schedule of Events" />
        <ol className="timeline">
          {event.timeline.map((item) => {
            const Icon = getIcon(item.icon);
            // accent drives the marker color via a CSS variable
            const style = item.accent ? { "--accent": item.accent } : undefined;
            return (
              <li className="tl-item" key={item.time} style={style}>
                <div className="tl-marker">
                  <Icon className="tl-icon" aria-hidden="true" />
                </div>
                <div className="tl-content">
                  <span className="tl-time">{item.time}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* VENUE / MAP --------------------------------------------------- */}
      <Section id="venue" variant="sage">
        <SectionTitle eyebrow="Getting there" title="The Celebration" />
        <p className="venue-name">{event.venue}</p>
        <p className="venue-address">{event.address}</p>
        <a
          className="map-link"
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Maps
          <ArrowUpRight className="map-link-icon" aria-hidden="true" />
        </a>
        <div className="map-placeholder" aria-hidden="true">
          <MapPin className="map-placeholder-icon" />
          <span>{event.venueCity}</span>
        </div>
      </Section>

      {/* DRESS CODE ---------------------------------------------------- */}
      <Section id="dress" variant="light">
        <SectionTitle eyebrow="What to wear" title={event.dressCode.title} />
        <p className="dress-text">{event.dressCode.text}</p>
        <div className="palette">
          {event.dressCode.palette.map((c) => (
            <span
              className="swatch"
              key={c}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </Section>

      {/* RSVP ---------------------------------------------------------- */}
      <Section id="rsvp" variant="rose">
        <SectionTitle eyebrow="Join us" title="RSVP" />
        <div className="rsvp-slot">
          <RsvpForm event={event} submitted={rsvp} onSubmit={onRsvp} embedded />
        </div>
      </Section>

      {/* FOOTER -------------------------------------------------------- */}
      <footer className="site-footer">
        <p className="footer-names">{event.couple}</p>
        <p className="footer-date">{event.dateShort}</p>
        <p className="footer-note">
          With love, we can't wait to celebrate with you.
        </p>
      </footer>
    </div>
  );
}
