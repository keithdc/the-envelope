/**
 * MOCK STORE (seed data)
 * =========================================================================
 * Seed documents for the Template vs Project model. Both kinds share the
 * InvitationDocument shape (see @/types). Templates are reusable public
 * designs; Projects are private customer invitations spawned from a template.
 *
 * The API (invitationApi.js) seeds localStorage from these on first run.
 */
import { mockDocument } from "./mockDocument.js";

const clone = (o) => structuredClone(o);

// A second template (ivory/gold) derived from the base, as a DRAFT.
const ivoryTemplate = {
  ...clone(mockDocument),
  id: "tpl_ivory_lace",
  kind: "template",
  category: "wedding",
  title: "Ivory Lace",
  theme: {
    ...clone(mockDocument.theme),
    rose: "#b9a68f",
    roseDeep: "#8c7a5e",
    gold: "#cbb06a",
    ink: "#4a4234",
    blush: "#f4efe6",
  },
  envelope: { ...clone(mockDocument.envelope), openAnimation: "unfold" },
  meta: {
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    status: "draft", // not yet published → not on the landing page
  },
};

// A PUBLISHED birthday template with REAL birthday content (not wedding data
// under a birthday label). Its couple/story/timeline/attire + sections are all
// birthday-appropriate.
let bn = 0;
const bsid = (t) => `bs_${t}_${bn++}`;
const birthdayTemplate = {
  ...clone(mockDocument),
  id: "tpl_confetti_birthday",
  kind: "template",
  category: "birthday",
  title: "Confetti Birthday",
  theme: {
    ...clone(mockDocument.theme),
    rose: "#f0a35e",
    roseDeep: "#d8743a",
    gold: "#f2c14e",
    ink: "#3a2f2a",
    blush: "#fdeedd",
  },
  envelope: {
    ...clone(mockDocument.envelope),
    // leave blank so the monogram DERIVES from names (["Mateo"] -> "M"); a
    // hand-set value would drift from the names (that's the K&B bug).
    sealMonogram: "",
  },
  couple: {
    names: ["Mateo"],
    nameJoiner: "&",
    tagline: "is turning seven",
    photo: "",
    dateISO: "2027-06-12T15:00:00",
    venue: "The Sunshine Garden Pavilion",
    venueCity: "Iloilo City",
    address: "12 Marigold Street, Jaro, Iloilo City, 5000 Iloilo",
    mapUrl: "https://www.google.com/maps",
  },
  scratch: {
    enabled: true,
    eyebrow: "The Birthday Star",
    hint: "Scratch the circle",
  },
  sections: [
    {
      id: bsid("hero"),
      type: "hero",
      enabled: true,
      order: 0,
      props: { eyebrow: "You're invited to a party", showPlace: true },
    },
    {
      id: bsid("countdown"),
      type: "countdown",
      enabled: true,
      order: 1,
      props: {
        eyebrow: "The big day",
        title: "Counting Down",
        note: "until the party starts",
      },
    },
    {
      id: bsid("story"),
      type: "story",
      enabled: true,
      order: 2,
      props: {
        eyebrow: "Seven years in the making",
        title: "Mateo's Milestones",
        items: [
          {
            year: "2020",
            title: "Hello, world",
            text: "Mateo arrived on a bright summer morning and the whole house got a lot louder (and a lot happier).",
          },
          {
            year: "2024",
            title: "The dinosaur era",
            text: "If it had a tail and a roar, Mateo could name it. The living room became a very serious paleontology lab.",
          },
          {
            year: "2027",
            title: "Turning seven",
            text: "Seven whole years of mud puddles, bedtime stories, and the biggest laugh you've ever heard. Come celebrate!",
          },
        ],
      },
    },
    {
      id: bsid("whenWhere"),
      type: "whenWhere",
      enabled: true,
      order: 3,
      props: { eyebrow: "Save the date", title: "When & Where" },
    },
    {
      id: bsid("schedule"),
      type: "schedule",
      enabled: true,
      order: 4,
      props: {
        eyebrow: "The plan",
        title: "Party Schedule",
        items: [
          {
            time: "3:00 PM",
            title: "Doors Open",
            text: "Grab a party hat and find the balloon arch.",
            icon: "users",
            accent: "#f0a35e",
          },
          {
            time: "3:30 PM",
            title: "Games & Giggles",
            text: "Pin the tail, musical chairs, and a treasure hunt.",
            icon: "sparkles",
            accent: "#d8743a",
          },
          {
            time: "4:30 PM",
            title: "Cake & Candles",
            text: "Help Mateo blow out all seven candles.",
            icon: "gift",
            accent: "#f2c14e",
          },
          {
            time: "5:00 PM",
            title: "Snacks & Play",
            text: "Juice boxes, snacks, and the bouncy castle.",
            icon: "cocktail",
            accent: "#8a9a7b",
          },
          {
            time: "6:00 PM",
            title: "Goodie Bags",
            text: "Say goodbye and grab a goodie bag on the way out.",
            icon: "sparkles",
            accent: "#b07ca0",
          },
        ],
      },
    },
    {
      id: bsid("attire"),
      type: "attire",
      enabled: true,
      order: 5,
      props: {
        eyebrow: "What to wear",
        title: "Come Comfy & Colorful",
        text: "Wear something bright and playful you can run around in.",
        attireTypes: [{ label: "Casual & Fun", icon: "shirt" }],
        palette: ["#f0a35e", "#f2c14e", "#8a9a7b", "#b07ca0", "#d8743a"],
      },
    },
    {
      id: bsid("rsvp"),
      type: "rsvp",
      enabled: true,
      order: 6,
      props: { eyebrow: "Join the fun", title: "RSVP" },
    },
    {
      id: bsid("footer"),
      type: "footer",
      enabled: true,
      order: 7,
      props: { note: "We can't wait to celebrate with you!" },
    },
  ],
  meta: {
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
    status: "published",
  },
};

/** Published + draft templates. Only PUBLISHED ones are public. */
export const mockTemplates = [
  { ...clone(mockDocument), id: "tpl_classic_rose" }, // published wedding (from base)
  ivoryTemplate, // draft wedding
  birthdayTemplate, // published birthday
];

/**
 * A sample PROJECT created from the classic-rose template. Private, with a
 * couple of versions to demonstrate rollback.
 */
const base = clone(mockDocument);
export const mockProjects = [
  {
    ...base,
    id: "prj_sample_0001",
    kind: "project",
    category: "wedding",
    title: "Karen & Bert — April Wedding",
    sourceTemplateId: "tpl_classic_rose",
    versions: [
      {
        version: 1,
        savedAt: "2026-02-01T09:00:00.000Z",
        label: "Initial draft from template",
        snapshot: clone(base),
      },
    ],
    meta: {
      createdAt: "2026-02-01T09:00:00.000Z",
      updatedAt: "2026-02-01T09:00:00.000Z",
      status: "draft",
      private: true, // NEVER shown on the landing page
    },
  },
];
