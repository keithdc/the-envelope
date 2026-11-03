# Architecture

This document explains how the app is organized so a developer (or another AI)
can extend it safely. The guiding idea is a **template-driven** design borrowed
from how professional digital-invitation services work: separate the **content**
from the **presentation** from the **animation**.

## Three separable concepts

| Concept | Lives in | What it owns |
|---|---|---|
| **Data** | `src/data/invitation.js` | The couple's content only. No styling, no components. Could come from a form/JSON/API. |
| **Template** | `src/data/templates.js` | The *look* (theme colors + fonts as CSS variables), the *opening animation* key, and image *assets*. |
| **Open animation** | `src/animations/` | Swappable opening components registered by key, all honoring one contract. |

The same `InvitationData` can be rendered through any `Template`. Changing the
template changes colors, fonts, assets, and the opening — without touching the
content or the section components.

## Render pipeline

```
App.jsx
  └─ TemplatePicker            (pick a Template)
  └─ Invitation(template,data) (render the chosen design)
       ├─ applies template.theme as inline CSS variables on the root
       │    → all components read var(--rose), var(--font-script), etc.
       ├─ getOpenAnimation(template.openAnimation) → the opening component
       │    → receives { data, assets, onOpened }
       ├─ ScratchCard (reveal)
       └─ WeddingSite (sections)
```

`Invitation.jsx` is the stage machine: `open → scratch → site`.

## The open-animation contract

Every opening component (in `src/animations/`) receives the **same props** so
they are interchangeable:

```js
/** @type {import('../types.js').OpenAnimationProps} */
{
  data,      // InvitationData (names, monogram, dateShort, ...)
  assets,    // TemplateAssets (sealImage, stampImage, paperTexture)
  onOpened,  // () => void — call when the opening finishes to advance
}
```

Registered in `src/animations/registry.jsx`:

```js
export const openAnimations = { flap: FlapOpen, unfold: UnfoldOpen }
```

### Shared timing

`src/animations/timing.js` exports `OPEN_TIMING`, the **single source of truth**
for how dramatic the opening is (a 3-beat sequence: seal → cover → letter).
Both `FlapOpen` and `UnfoldOpen` import it, so changing one value re-paces every
template identically. Do not hardcode durations/delays inside an animation;
read them from `OPEN_TIMING`.

## Theming via CSS variables

A template's `theme` is a map of CSS custom properties:

```js
theme: { "--rose": "#c98a86", "--font-script": "'Pinyon Script', cursive", ... }
```

`Invitation.jsx` spreads it onto the root element's `style`, so it cascades to
every child. Components reference `var(--rose)`, `var(--font-serif)`, etc. with
sensible fallbacks. This is why swapping templates re-colors the whole UI
(including Lucide icons, which are tinted with `color: var(--accent)`).

## Icons (data stays serializable)

Timeline items reference icons by **string key**, not by importing components:

```js
// invitation.js
{ time: "4:00 PM", title: "Ceremony", icon: "rings", accent: "#a9625d" }
```

`src/components/icons.js` maps keys → Lucide components via `getIcon(key)` (with
a safe fallback). This keeps `invitation.js` free of React imports so it could
be loaded from JSON/an API later. Browse icons at https://lucide.dev/icons/.

## Types / "interfaces"

This is plain JavaScript, so types are JSDoc `@typedef`s in `src/types.js`
(`InvitationData`, `TimelineItem`, `StoryItem`, `DressCode`, `Template`,
`TemplateAssets`, `OpenAnimationProps`). Reference them with:

```js
/** @type {import('../types.js').InvitationData} */
```

Editors use these for autocomplete and checking. Nothing is exported at runtime.

## How to extend

**Add a template** → new entry in `data/templates.js` (id, name, `openAnimation`
key, `theme` vars, `assets`, `preview` swatches).

**Add an opening animation** → build a component honoring `OpenAnimationProps`,
read pacing from `OPEN_TIMING`, register it in `animations/registry.jsx`, then
point a template's `openAnimation` at the new key.

**Add a timeline icon** → import the Lucide icon in `components/icons.js`, add a
key to `ICONS`, use that key in `invitation.timeline[].icon`.

**Swap real art for the CSS envelope** → set `assets.sealImage` /
`assets.stampImage` / `assets.paperTexture` to image paths in `public/`. Empty
string falls back to the pure-CSS rendering.

## Conventions

- Keep `invitation.js` presentation-free and serializable (strings/arrays/objects only).
- Keep animation pacing in `OPEN_TIMING`, not inline.
- When an element is animated by framer-motion AND needs centering, do the
  centering **inside** the motion transform (e.g. `x: "-50%"`), not via a CSS
  `transform` — motion overwrites the whole `transform` property.
- Full-bleed stages use `width: 100%` (not `100vw`) to avoid the scrollbar
  offset that shifts centered elements.
