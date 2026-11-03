/**
 * TEMPLATES
 * -------------------------------------------------------------------------
 * A template defines the LOOK (theme: colors + fonts) and which OPEN ANIMATION
 * plays, plus the image assets the envelope uses. The same invitation data can
 * be rendered through any template.
 *
 * To add a template: copy an entry, change the theme/assets/openAnimation.
 * To add an open animation: register a component in animations/registry.js and
 *   reference its key here as `openAnimation`.
 *
 * `theme` values are applied as CSS custom properties on the app root, so they
 * cascade to every component automatically.
 *
 * @type {import('../types.js').Template[]}
 */
export const templates = [
  {
    id: "classic-rose",
    name: "Classic Rose",
    description: "Blush mauve envelope with a wax seal and satin ribbon.",
    openAnimation: "flap", // see animations/registry.js
    theme: {
      "--rose": "#c98a86",
      "--rose-deep": "#a9625d",
      "--gold": "#c9a86a",
      "--ink": "#3a3330",
      "--blush": "#f3e4e1",
      "--font-script": "'Pinyon Script', cursive",
      "--font-serif": "'Forum', Georgia, serif",
    },
    // Envelope image assets ("" => pure-CSS fallback for that piece)
    assets: {
      paperTexture: "/paper-texture.svg",
      sealImage: "/wax-seal.svg",
      stampImage: "/stamp.svg",
    },
    // Swatch colors shown in the template picker preview
    preview: ["#c98a86", "#a9625d", "#c9a86a"],
  },
  {
    id: "ivory-lace",
    name: "Ivory Lace",
    description: "Soft ivory card that unfolds, with a golden seal.",
    openAnimation: "unfold", // a different opening style
    theme: {
      "--rose": "#b9a68f",
      "--rose-deep": "#8c7a5e",
      "--gold": "#cbb06a",
      "--ink": "#4a4234",
      "--blush": "#f4efe6",
      "--font-script": "'Pinyon Script', cursive",
      "--font-serif": "'Forum', Georgia, serif",
    },
    assets: {
      paperTexture: "/paper-texture.svg",
      sealImage: "/wax-seal.svg",
      stampImage: "",
    },
    preview: ["#e9dfce", "#cbb06a", "#8c7a5e"],
  },
];

export const getTemplate = (id) =>
  templates.find((t) => t.id === id) ?? templates[0];
