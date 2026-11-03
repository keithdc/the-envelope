/**
 * SECTION REGISTRY
 * =========================================================================
 * The catalog of section types a builder can place on a page. Each entry
 * defines: the toggle-list label + icon, the default props when added, and
 * the editable-field metadata the left panel uses to render a form.
 *
 * This single source powers three things:
 *   1. the "add section" / toggle list in the builder
 *   2. the per-section edit form (auto-generated from `fields`)
 *   3. (with componentForSection) which renderer draws each section
 *
 * @typedef {import('@/types').SectionDef} SectionDef
 */

/** @type {Record<string, SectionDef>} */
export const SECTION_REGISTRY = {
  hero: {
    type: "hero",
    name: "Cover",
    icon: "calendar",
    removable: false, // every invitation needs a cover
    defaultProps: {
      eyebrow: "We're getting married",
      showPlace: true,
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow text", control: "text" },
      {
        key: "showPlace",
        label: "Show the city",
        control: "select",
        options: ["true", "false"],
      },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional paper/photo. Falls back to the default.",
      },
    ],
  },

  countdown: {
    type: "countdown",
    name: "Countdown",
    icon: "calendar",
    removable: true,
    defaultProps: {
      eyebrow: "The big day",
      title: "Counting Down",
      note: 'until we say "I do"',
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      { key: "note", label: "Closing note", control: "text" },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  story: {
    type: "story",
    name: "Our Story",
    icon: "heart",
    removable: true,
    defaultProps: {
      eyebrow: "How it began",
      title: "Our Story",
      items: [{ year: "", title: "", text: "" }],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      {
        key: "items",
        label: "Chapters",
        control: "list",
        itemFields: [
          { key: "year", label: "Year", control: "text" },
          { key: "title", label: "Title", control: "text" },
          { key: "text", label: "Text", control: "textarea" },
        ],
      },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  whenWhere: {
    type: "whenWhere",
    name: "When & Where",
    icon: "map",
    removable: true,
    defaultProps: {
      eyebrow: "Save the date",
      title: "When & Where",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  schedule: {
    type: "schedule",
    name: "Schedule of Events",
    icon: "calendar",
    removable: true,
    defaultProps: {
      eyebrow: "The day",
      title: "Schedule of Events",
      items: [
        { time: "", title: "", text: "", icon: "sparkles", accent: "#a9625d" },
      ],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      {
        key: "items",
        label: "Events",
        control: "list",
        itemFields: [
          { key: "time", label: "Time", control: "text" },
          { key: "title", label: "Title", control: "text" },
          { key: "text", label: "Text", control: "textarea" },
          {
            key: "icon",
            label: "Icon",
            control: "select",
            options: [
              "users",
              "rings",
              "cocktail",
              "dinner",
              "music",
              "sparkles",
            ],
          },
          { key: "accent", label: "Accent color", control: "color" },
        ],
      },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  celebration: {
    type: "celebration",
    name: "The Celebration",
    icon: "map",
    removable: true,
    defaultProps: {
      eyebrow: "Getting there",
      title: "The Celebration",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  attire: {
    type: "attire",
    name: "The Attire",
    icon: "shirt",
    removable: true,
    defaultProps: {
      eyebrow: "What to wear",
      title: "Garden Formal",
      text: "",
      // attire types — each a garment with a label + icon (suit, barong, gown…)
      attireTypes: [
        { label: "Suit & Tie", icon: "suit" },
        { label: "Formal Gown", icon: "gown" },
      ],
      palette: ["#c98a86", "#dcc7a0", "#8a9a7b", "#e7d2ce", "#a9625d"],
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      { key: "text", label: "Guidance", control: "textarea" },
      {
        key: "attireTypes",
        label: "Attire types",
        control: "list",
        itemFields: [
          { key: "label", label: "Label", control: "text" },
          {
            key: "icon",
            label: "Icon",
            control: "select",
            options: [
              "suit",
              "barong",
              "shirt",
              "dress",
              "gown",
              "jewelry",
              "bag",
              "shoes",
              "watch",
              "accessories",
            ],
          },
        ],
      },
      {
        key: "palette",
        label: "Color palette",
        control: "list",
        itemFields: [{ key: "", label: "Color", control: "color" }],
      },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  rsvp: {
    type: "rsvp",
    name: "RSVP",
    icon: "heart",
    removable: true,
    defaultProps: {
      eyebrow: "Join us",
      title: "RSVP",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "title", label: "Title", control: "text" },
      {
        key: "background",
        label: "Background image",
        control: "image",
        help: "Optional. Falls back to the default color.",
      },
    ],
  },

  // The photo revealed by scratching the medallion. Uses couple.photo; the
  // caption/labels are editable. This is a reveal STAGE in the real flow.
  scratch: {
    type: "scratch",
    name: "Scratch Photo",
    icon: "camera",
    removable: true,
    defaultProps: {
      eyebrow: "The Happy Couple",
      hint: "Scratch the circle",
    },
    fields: [
      { key: "eyebrow", label: "Eyebrow", control: "text" },
      { key: "hint", label: "Scratch hint", control: "text" },
    ],
  },

  // Closing footer: names + date + a sign-off note.
  footer: {
    type: "footer",
    name: "Footer",
    icon: "heart",
    removable: false, // every page ends with a footer
    defaultProps: {
      note: "With love, we can't wait to celebrate with you.",
    },
    fields: [{ key: "note", label: "Sign-off note", control: "textarea" }],
  },
};

/** Ordered list of section types available to add. */
export const SECTION_TYPES = Object.keys(SECTION_REGISTRY);

/** @param {string} type */
export function getSectionDef(type) {
  return SECTION_REGISTRY[type] ?? null;
}

/**
 * Build a fresh SectionConfig for a given type (used when a user adds one).
 * @param {string} type
 * @param {number} order
 */
export function makeSection(type, order) {
  const def = getSectionDef(type);
  return {
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    enabled: true,
    order,
    props: def ? structuredClone(def.defaultProps) : {},
  };
}
