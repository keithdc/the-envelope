# Interactive Wedding Invitation

A template-driven, interactive digital wedding invitation built with **React + Vite**.
Guests pick/open an invitation that plays a dramatic opening animation, scratch a
medallion to reveal a photo, then land on a full scrolling wedding microsite
(countdown, story, schedule, venue, dress code, RSVP).

> This is a practice project. The look is produced with CSS + a few SVG/image
> assets; it is intentionally structured so the **art, the content, and the
> animations are separate and swappable** (see `ARCHITECTURE.md`).

## Quick start

```bash
npm install
npm run dev      # start the dev server (open the printed URL)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

Requires Node 18+ (developed on Node 22).

## The guest flow

```
TemplatePicker  →  Invitation
                     ├─ 1. Open animation (envelope "flap" or gatefold "unfold")
                     ├─ 2. ScratchCard   (scratch the circle to reveal a photo)
                     └─ 3. WeddingSite    (hero + countdown + story + schedule +
                                            venue + dress code + RSVP)
```

## Project structure

```
public/                     static assets served as-is
  paper-texture.svg         envelope paper texture
  wax-seal.svg              wax seal image
  stamp.svg                 postage stamp image
src/
  main.jsx                  React entry
  App.jsx                   host: picker -> invitation
  types.js                  JSDoc @typedef "interfaces" (docs only)
  index.css / App.css       global styles + theme variables
  data/
    invitation.js           the couple's CONTENT (names, dates, story, timeline...)
    templates.js            the TEMPLATES (theme colors/fonts, open animation, assets)
  animations/
    registry.jsx            maps openAnimation key -> component
    timing.js               ONE shared config for opening pacing (dramatic timing)
    FlapOpen.jsx            "flap" opening (wraps the Envelope)
    UnfoldOpen.jsx/.css     "unfold" gatefold opening
  components/
    Invitation.jsx          renders one template + data (stage machine)
    TemplatePicker.jsx/.css  gallery to choose a template
    Envelope.jsx/.css        full-bleed envelope that folds open
    ScratchCard.jsx/.css     circular scratch-to-reveal medallion (canvas)
    WeddingSite.jsx/.css     the scrolling microsite (all sections)
    Countdown.jsx/.css       day-focused countdown to the date
    RsvpForm.jsx/.css        RSVP form + confirmation
    confetti.js/Confetti.jsx canvas-confetti effects
    icons.js                 string key -> Lucide icon map
    Petals.jsx/.css          decorative falling petals (currently unused)
```

## Common tasks

- **Change the couple's details:** edit `src/data/invitation.js`.
- **Add a new design:** add an entry to `src/data/templates.js`.
- **Add a new opening animation:** build a component honoring the
  `OpenAnimationProps` contract and register it in `src/animations/registry.jsx`.
- **Change how dramatic every opening is:** edit `src/animations/timing.js`
  (one source of truth — affects all animations).
- **Add/replace a timeline icon:** use a key from `src/components/icons.js`
  in `invitation.timeline[].icon`. Browse icons at https://lucide.dev/icons/.

See `ARCHITECTURE.md` for the full design.

## Tech

- React 18, Vite 5
- framer-motion (animation), canvas-confetti (confetti), lucide-react (icons)
- Fonts: Pinyon Script (calligraphy) + Forum (serif) + Cormorant Garamond (body)
