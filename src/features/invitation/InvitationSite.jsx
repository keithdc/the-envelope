import { motion } from "framer-motion";
import { CalendarDays, Leaf, MapPin, ArrowUpRight } from "lucide-react";
import Countdown from "./Countdown.jsx";
import RsvpForm from "./RsvpForm.jsx";
import { getIcon } from "../../lib/icons.js";
import "./InvitationSite.css";

/**
 * Reusable wrapper that fades a section in on scroll. Accepts an optional
 * `background` (image URL) — when set it overlays a readability wash over the
 * image; otherwise it uses the preset `variant` color class.
 */
function Section({ id, variant = "light", background, children }) {
  const style = background
    ? {
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  return (
    <motion.section
      id={id}
      className={`section section--${variant} ${background ? "section--bg" : ""}`}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="section-inner">{children}</div>
    </motion.section>
  );
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

/* ------------------------------------------------------------------ */
/* Per-section renderers. Each reads shared data from `event` plus the  */
/* section's own `props` (eyebrow/title/note/items/background).         */
/* ------------------------------------------------------------------ */

/**
 * Renders the honoree name(s) for the hero with the joiner styled as `.amp`
 * (gold, italic). Mirrors displayNames() logic but keeps the separators as
 * styled spans. Works for any count:
 *   ["Mateo"]            -> Mateo
 *   ["Karen","Bert"]     -> Karen  &  Bert
 *   ["Ana","Ben","Cy"]   -> Ana, Ben  &  Cy
 */
function HeroNames({ names = [], joiner = "&" }) {
  const clean = names.map((n) => (n ?? "").trim()).filter(Boolean);
  if (clean.length === 0) return null;
  if (clean.length === 1) return clean[0];

  const last = clean[clean.length - 1];
  const head = clean.slice(0, -1);
  return (
    <>
      {head.map((name, i) => (
        <span key={i}>
          {name}
          {i < head.length - 1 && <span className="hero-comma">, </span>}
        </span>
      ))}
      <span className="amp"> {joiner} </span>
      {last}
    </>
  );
}

function HeroSection({ event, props = {} }) {
  const bgStyle = props.background
    ? {
        backgroundImage: `url(${props.background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;
  return (
    <header
      className={`hero ${props.background ? "hero--bg" : ""}`}
      style={bgStyle}
      key="hero"
    >
      <div className="hero-overlay" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="hero-eyebrow">{props.eyebrow ?? "You're invited"}</p>
        <h1 className="hero-names">
          <HeroNames names={event.names} joiner={event.nameJoiner} />
        </h1>
        <div className="hero-ornament" aria-hidden="true" />
        <p className="hero-date">{event.dateShort}</p>
        {props.showPlace !== false && (
          <p className="hero-place">{event.venueCity}</p>
        )}
      </motion.div>
    </header>
  );
}

function CountdownSection({ event, props = {} }) {
  return (
    <Section
      id="countdown"
      variant="rose"
      background={props.background}
      key="countdown"
    >
      <SectionTitle
        eyebrow={props.eyebrow ?? "The big day"}
        title={props.title ?? "Counting Down"}
      />
      <div className="cd-dates">
        <div className="cd-date">
          <span className="cd-date-label">The Wedding</span>
          <span className="cd-date-value">{event.date}</span>
        </div>
      </div>
      <Countdown targetISO={event.dateISO} />
      {props.note && <p className="cd-note">{props.note}</p>}
    </Section>
  );
}

function StorySection({ event, props = {} }) {
  const items = props.items ?? event.story ?? [];
  return (
    <Section
      id="story"
      variant="light"
      background={props.background}
      key="story"
    >
      <SectionTitle
        eyebrow={props.eyebrow ?? "How it began"}
        title={props.title ?? "Our Story"}
      />
      <div className="story-list">
        {items.map((s, i) => (
          <div className="story-item" key={s.year ?? i}>
            <span className="story-year">{s.year}</span>
            <div className="story-body">
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WhenWhereSection({ event, props = {} }) {
  return (
    <Section
      id="details"
      variant="rose"
      background={props.background}
      key="details"
    >
      <SectionTitle
        eyebrow={props.eyebrow ?? "Save the date"}
        title={props.title ?? "When & Where"}
      />
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
  );
}

function ScheduleSection({ event, props = {} }) {
  const items = props.items ?? event.timeline ?? [];
  return (
    <Section
      id="timeline"
      variant="light"
      background={props.background}
      key="timeline"
    >
      <SectionTitle
        eyebrow={props.eyebrow ?? "The day"}
        title={props.title ?? "Schedule of Events"}
      />
      <ol className="timeline">
        {items.map((item, i) => {
          const Icon = getIcon(item.icon);
          const style = item.accent ? { "--accent": item.accent } : undefined;
          return (
            <li className="tl-item" key={item.time ?? i} style={style}>
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
  );
}

function CelebrationSection({ event, props = {} }) {
  return (
    <Section
      id="venue"
      variant="sage"
      background={props.background}
      key="venue"
    >
      <SectionTitle
        eyebrow={props.eyebrow ?? "Getting there"}
        title={props.title ?? "The Celebration"}
      />
      <p className="venue-name">{event.venue}</p>
      <p className="venue-address">{event.address}</p>
      {event.mapUrl && (
        <a
          className="map-link"
          href={event.mapUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Maps
          <ArrowUpRight className="map-link-icon" aria-hidden="true" />
        </a>
      )}
      <div className="map-placeholder" aria-hidden="true">
        <MapPin className="map-placeholder-icon" />
        <span>{event.venueCity}</span>
      </div>
    </Section>
  );
}

function AttireSection({ event, props = {} }) {
  const title = props.title ?? event.dressCode?.title ?? "The Attire";
  const text = props.text ?? event.dressCode?.text ?? "";
  const palette = props.palette ?? event.dressCode?.palette ?? [];
  const attireTypes = props.attireTypes ?? [];
  return (
    <Section
      id="dress"
      variant="light"
      background={props.background}
      key="dress"
    >
      <SectionTitle eyebrow={props.eyebrow ?? "What to wear"} title={title} />
      <p className="dress-text">{text}</p>
      {attireTypes.length > 0 && (
        <div className="attire-types">
          {attireTypes.map((t, i) => {
            const Icon = getIcon(t.icon);
            return (
              <div className="attire-type" key={i}>
                <Icon className="attire-type-icon" aria-hidden="true" />
                <span>{t.label}</span>
              </div>
            );
          })}
        </div>
      )}
      {palette.length > 0 && (
        <div className="palette">
          {palette.map((c, i) => (
            <span
              className="swatch"
              key={i}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function RsvpSection({ event, props = {}, rsvp, onRsvp }) {
  return (
    <Section id="rsvp" variant="rose" background={props.background} key="rsvp">
      <SectionTitle
        eyebrow={props.eyebrow ?? "Join us"}
        title={props.title ?? "RSVP"}
      />
      <div className="rsvp-slot">
        <RsvpForm event={event} submitted={rsvp} onSubmit={onRsvp} embedded />
      </div>
    </Section>
  );
}

function FooterSection({ event, props = {} }) {
  return (
    <footer className="site-footer" key="footer">
      <p className="footer-names">{event.couple}</p>
      <p className="footer-date">{event.dateShort}</p>
      <p className="footer-note">
        {props.note ?? "With love, we can't wait to celebrate with you."}
      </p>
    </footer>
  );
}

// dispatch a section type -> renderer
function renderSection(section, ctx) {
  const common = { event: ctx.event, props: section.props };
  switch (section.type) {
    case "hero":
      return <HeroSection {...common} key={section.id} />;
    case "countdown":
      return <CountdownSection {...common} key={section.id} />;
    case "story":
      return <StorySection {...common} key={section.id} />;
    case "whenWhere":
      return <WhenWhereSection {...common} key={section.id} />;
    case "schedule":
      return <ScheduleSection {...common} key={section.id} />;
    case "celebration":
      return <CelebrationSection {...common} key={section.id} />;
    case "attire":
      return <AttireSection {...common} key={section.id} />;
    case "rsvp":
      return (
        <RsvpSection
          {...common}
          rsvp={ctx.rsvp}
          onRsvp={ctx.onRsvp}
          key={section.id}
        />
      );
    case "footer":
      return <FooterSection {...common} key={section.id} />;
    // `scratch` is a pre-scroll stage, not a scroll section
    case "scratch":
    default:
      return null;
  }
}

// The fixed order used when no `sections` prop is supplied (real app default).
const DEFAULT_ORDER = [
  { id: "hero", type: "hero", props: {} },
  { id: "countdown", type: "countdown", props: {} },
  { id: "story", type: "story", props: {} },
  { id: "whenWhere", type: "whenWhere", props: {} },
  { id: "schedule", type: "schedule", props: {} },
  { id: "celebration", type: "celebration", props: {} },
  { id: "attire", type: "attire", props: {} },
  { id: "rsvp", type: "rsvp", props: {} },
  { id: "footer", type: "footer", props: {} },
];

/**
 * The scrollable microsite. Data-driven: pass `sections` (enabled + ordered)
 * to control which blocks render and their content/background. When omitted it
 * falls back to the fixed order using `event` data (back-compat for the real
 * app via Invitation.jsx).
 */
export default function InvitationSite({ event, rsvp, onRsvp, sections }) {
  const list = sections
    ? [...sections]
        .filter((s) => s.enabled && s.type !== "scratch")
        .sort((a, b) => a.order - b.order)
    : DEFAULT_ORDER;

  const ctx = { event, rsvp, onRsvp };

  return (
    <div className="wedding-site">{list.map((s) => renderSection(s, ctx))}</div>
  );
}
