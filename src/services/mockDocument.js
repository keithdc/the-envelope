/**
 * MOCK INVITATION DOCUMENT
 * =========================================================================
 * The builder's starting document is DERIVED from the real invitation data
 * (src/data/invitation.js) — that file is the single source of truth. Building
 * the mock from it guarantees the document mirrors the real app and can never
 * be "missing" a field (names, dates, venue, story, timeline, dressCode,
 * footer, …). A real backend would store the resulting JSON per invitation.
 *
 * @type {import('@/types').InvitationDocument}
 */
import { invitation as INV } from "../data/invitation.js";

let n = 0;
const sid = (t) => `s_${t}_${n++}`;

export const mockDocument = {
  id: "inv_sample",
  kind: "template",
  category: "wedding",
  schemaVersion: "1.0",
  title: "Classic Rose",

  theme: {
    rose: "#c98a86",
    roseDeep: "#a9625d",
    gold: "#c9a86a",
    ink: "#3a3330",
    blush: "#f3e4e1",
    fontScript: "var(--f-pinyon), cursive",
    fontSerif: "var(--f-forum), Georgia, serif",
    fontBody: "var(--f-cormorant), Georgia, serif",
  },

  envelope: {
    openAnimation: "flap",
    // blank by default → the monogram DERIVES from couple.names (see
    // documentToEvent/Envelope). Set a value only to intentionally OVERRIDE it.
    sealMonogram: "",
    sealImage: {
      id: "seal1",
      url: "/wax-seal.svg",
      kind: "svg",
      alt: "wax seal",
    },
    stampImage: {
      id: "stamp1",
      url: "/stamp.svg",
      kind: "svg",
      alt: "postage stamp",
    },
    paperTexture: { id: "paper1", url: "/paper-texture.svg", kind: "svg" },
  },

  // Couple/event-level content, taken straight from the source of truth. The
  // `names` + dateISO are the only "raw" inputs; display strings are derived
  // at render time (names.js / dateFormat.js).
  couple: {
    names: [...INV.names],
    nameJoiner: INV.nameJoiner,
    tagline: INV.tagline,
    photo: INV.photo,
    dateISO: INV.dateISO,
    venue: INV.venue,
    venueCity: INV.venueCity,
    address: INV.address,
    mapUrl: INV.mapUrl,
  },

  // Every section the real site renders, in order, with content pulled from
  // invitation.js so nothing is missing (hero … footer).
  sections: [
    {
      id: sid("hero"),
      type: "hero",
      enabled: true,
      order: 0,
      props: { eyebrow: "We're getting married", showPlace: true },
    },
    {
      id: sid("countdown"),
      type: "countdown",
      enabled: true,
      order: 1,
      props: {
        eyebrow: "The big day",
        title: "Counting Down",
        note: 'until we say "I do"',
      },
    },
    {
      id: sid("story"),
      type: "story",
      enabled: true,
      order: 2,
      props: {
        eyebrow: "How it began",
        title: "Our Story",
        items: INV.story.map((s) => ({ ...s })),
      },
    },
    {
      id: sid("whenWhere"),
      type: "whenWhere",
      enabled: true,
      order: 3,
      props: { eyebrow: "Save the date", title: "When & Where" },
    },
    {
      id: sid("schedule"),
      type: "schedule",
      enabled: true,
      order: 4,
      props: {
        eyebrow: "The day",
        title: "Schedule of Events",
        items: INV.timeline.map((t) => ({ ...t })),
      },
    },
    {
      id: sid("celebration"),
      type: "celebration",
      enabled: true,
      order: 5,
      props: { eyebrow: "Getting there", title: "The Celebration" },
    },
    {
      id: sid("attire"),
      type: "attire",
      enabled: true,
      order: 6,
      props: {
        eyebrow: "What to wear",
        title: INV.dressCode.title,
        text: INV.dressCode.text,
        attireTypes: [
          { label: "Suit & Tie", icon: "suit" },
          { label: "Barong", icon: "barong" },
          { label: "Formal Gown", icon: "gown" },
        ],
        palette: [...INV.dressCode.palette],
      },
    },
    {
      id: sid("rsvp"),
      type: "rsvp",
      enabled: true,
      order: 7,
      props: { eyebrow: "Join us", title: "RSVP" },
    },
    {
      id: sid("footer"),
      type: "footer",
      enabled: true,
      order: 8,
      props: { note: "With love, we can't wait to celebrate with you." },
    },
  ],

  // The scratch-to-reveal photo stage shown between the envelope and the page.
  scratch: {
    enabled: true,
    eyebrow: "The Happy Couple",
    hint: "Scratch the circle",
  },

  meta: {
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    status: "published",
  },
};
