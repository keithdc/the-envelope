/**
 * DOCUMENT -> EVENT ADAPTER
 * -------------------------------------------------------------------------
 * Converts a builder InvitationDocument into the flat `event` object the real
 * components (InvitationSite, ScratchCard, Envelope, RsvpForm) consume. This is
 * the bridge that lets the builder preview render the REAL components instead
 * of a reimplementation — so there is one source of truth and no drift.
 *
 * Content lives in two places in the document:
 *   - doc.couple : shared event-level fields (names, date, venue…)
 *   - sections[] : per-section content (story items, schedule items, attire…)
 * InvitationSite expects it all flattened onto one `event`, so we fold the three
 * list-bearing sections (story, schedule->timeline, attire->dressCode) in.
 */
import { formatLong, formatShort, formatTime } from "../lib/date.js";
import { displayNames, monogram } from "../lib/names.js";

const flat = (a) => (a && typeof a === "object" ? a.url : a) || "";

/**
 * @param {import('@/types').InvitationDocument} doc
 * @returns {import('@/types').InvitationData}
 */
export function documentToEvent(doc) {
  const c = doc.couple ?? {};
  const sections = doc.sections ?? [];
  const byType = (t) => sections.find((s) => s.type === t)?.props ?? {};

  const story = byType("story").items ?? [];
  const timeline = byType("schedule").items ?? [];
  const attire = byType("attire");

  return {
    // identity / names (derived)
    names: c.names,
    nameJoiner: c.nameJoiner,
    firstNames: c.names ?? [],
    couple: displayNames(c.names ?? [], c.nameJoiner),
    sealMonogram:
      doc.envelope?.sealMonogram || monogram(c.names ?? [], c.nameJoiner),
    tagline: c.tagline,
    photo: flat(c.photo),

    // dates (derived from the single dateISO)
    dateISO: c.dateISO,
    date: formatLong(c.dateISO),
    dateShort: formatShort(c.dateISO),
    time: formatTime(c.dateISO),

    // venue
    venue: c.venue,
    venueCity: c.venueCity,
    address: c.address,
    mapUrl: c.mapUrl,

    // scratch-reveal stage copy (event-type agnostic; no wedding default here)
    scratch: {
      eyebrow: doc.scratch?.eyebrow,
      hint: doc.scratch?.hint,
    },

    // list-bearing sections folded in
    story,
    timeline,
    dressCode: {
      title: attire.title ?? "",
      text: attire.text ?? "",
      palette: attire.palette ?? [],
      attireTypes: attire.attireTypes ?? [],
    },
  };
}

/** The envelope open-animation `data`/`assets` shaped from the document. */
export function documentToEnvelope(doc) {
  const c = doc.couple ?? {};
  const env = doc.envelope ?? {};
  return {
    data: {
      couple: displayNames(c.names ?? [], c.nameJoiner),
      firstNames: c.names ?? [],
      sealMonogram: env.sealMonogram || monogram(c.names ?? [], c.nameJoiner),
      dateShort: formatShort(c.dateISO),
    },
    assets: {
      sealImage: flat(env.sealImage),
      stampImage: flat(env.stampImage),
      paperTexture: flat(env.paperTexture),
    },
  };
}

/** The theme object mapped to CSS custom properties for the preview root. */
export function themeToVars(theme = {}) {
  return {
    "--rose": theme.rose,
    "--rose-deep": theme.roseDeep,
    "--gold": theme.gold,
    "--ink": theme.ink,
    "--blush": theme.blush,
    "--font-script": theme.fontScript,
    "--font-serif": theme.fontSerif,
    "--font-body": theme.fontBody,
  };
}
