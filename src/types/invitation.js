/**
 * INVITATION & TEMPLATE INTERFACES
 * =========================================================================
 * JSDoc @typedefs for the rendered invitation's content + the presentation
 * template. Plain-JS "interfaces": editors/tools read these for autocomplete
 * and checking. Nothing is exported at runtime.
 *
 * Reference a type from anywhere with the `@/` alias (see jsconfig.json):
 *   @type {import('@/types').InvitationData}
 */

/* --------------------------------------------------------------------- */
/* INVITATION DATA — the celebrant's content (see features/.../data)      */
/* --------------------------------------------------------------------- */

/**
 * One entry in the schedule-of-events timeline.
 * @typedef {Object} TimelineItem
 * @property {string} time   Display time, e.g. "4:00 PM"
 * @property {string} title  Short label, e.g. "Ceremony"
 * @property {string} text   One-line description
 * @property {string} [icon] Icon key resolved via lib/icons.js (getIcon)
 * @property {string} [accent] Hex color for the marker, e.g. "#a9625d"
 */

/**
 * One chapter of the story / milestones section.
 * @typedef {Object} StoryItem
 * @property {string} year
 * @property {string} title
 * @property {string} text
 */

/**
 * Dress-code guidance plus a color palette.
 * @typedef {Object} DressCode
 * @property {string} title
 * @property {string} text
 * @property {string[]} palette  Hex colors shown as swatches
 * @property {{label:string, icon?:string}[]} [attireTypes]
 */

/**
 * The full set of content supplied for one event. Contains NO styling or
 * component references — the Template decides the look. Event-type agnostic
 * (wedding, birthday, …): `names` holds one or more honorees.
 * @typedef {Object} InvitationData
 * @property {string} couple        Joined display name, e.g. "Karen & Bert"
 * @property {string[]} names       ["Karen","Bert"] or ["Mateo"]
 * @property {string[]} firstNames  Alias of names (kept for consumers)
 * @property {string} nameJoiner    e.g. "&"
 * @property {string} sealMonogram  e.g. "K & B"
 * @property {string} tagline
 * @property {string} [photo]       URL/path for the scratch-medallion photo
 * @property {string} dateISO       ISO datetime powering the countdown
 * @property {string} date          Long display date
 * @property {string} dateShort     Short display date, e.g. "06 . 13 . 2026"
 * @property {string} time
 * @property {string} venue
 * @property {string} venueCity
 * @property {string} address
 * @property {string} mapUrl
 * @property {StoryItem[]} story
 * @property {TimelineItem[]} timeline
 * @property {DressCode} dressCode
 */

/* --------------------------------------------------------------------- */
/* TEMPLATE — the LOOK + chosen opening (legacy data/templates.js)        */
/* --------------------------------------------------------------------- */

/**
 * Image assets for a template's envelope ("" => pure-CSS fallback).
 * @typedef {Object} TemplateAssets
 * @property {string} [paperTexture]
 * @property {string} [sealImage]
 * @property {string} [stampImage]
 */

/**
 * A template defines presentation only. The same InvitationData can render
 * through any template.
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} openAnimation  Key into animations/registry.jsx (e.g. "flap")
 * @property {Object.<string,string>} theme  CSS custom-property map applied to the root
 * @property {TemplateAssets} assets
 * @property {string[]} preview  Swatch colors for the picker card
 */

/* --------------------------------------------------------------------- */
/* OPEN ANIMATION — the contract every opening component implements       */
/* --------------------------------------------------------------------- */

/**
 * Props every open-animation component receives (see animations/registry.jsx).
 * @typedef {Object} OpenAnimationProps
 * @property {InvitationData} data
 * @property {TemplateAssets} assets
 * @property {() => void} onOpened  Call when the opening finishes to advance
 */

export {}
