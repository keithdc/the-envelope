/**
 * SHARED TYPE DEFINITIONS ("interfaces")
 * =========================================================================
 * This is a plain-JavaScript project, so "interfaces" are expressed as JSDoc
 * @typedefs. Editors (VS Code) and other tools/AIs read these for
 * autocomplete, hover docs, and type-checking. Import a type in another file
 * with:  @type {import('../types.js').InvitationData}
 *
 * Nothing is exported at runtime — this file is documentation only.
 */

/* --------------------------------------------------------------------- */
/* INVITATION DATA — the couple's content (see data/invitation.js)       */
/* --------------------------------------------------------------------- */

/**
 * One entry in the schedule-of-events timeline.
 * @typedef {Object} TimelineItem
 * @property {string} time   Display time, e.g. "4:00 PM"
 * @property {string} title  Short label, e.g. "Ceremony"
 * @property {string} text   One-line description
 * @property {string} [icon] Icon key resolved via components/icons.js (getIcon)
 * @property {string} [accent] Hex color for the marker, e.g. "#a9625d"
 */

/**
 * One chapter of the couple's story.
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
 */

/**
 * The full set of content a couple supplies (via a form, JSON, or API). It
 * contains NO styling or component references — the Template decides the look.
 * @typedef {Object} InvitationData
 * @property {string} couple        Full couple string, e.g. "Karen & Bert"
 * @property {[string,string]} firstNames  ["Karen", "Bert"]
 * @property {string} sealMonogram  e.g. "K&B"
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
/* TEMPLATE — the LOOK + chosen opening (see data/templates.js)          */
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
