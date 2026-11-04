import "../index.css";

/**
 * ROOT LAYOUT (server component)
 * -------------------------------------------------------------------------
 * Loads the typefaces from Google Fonts via a <link> and exposes each as a
 * --f-* CSS variable (defined in index.css). The builder's font pickers switch
 * between them by setting theme.fontScript / theme.fontSerif to the matching
 * var(--f-*) value.
 *
 * (We use a <link> rather than next/font to avoid a build-time font fetch.)
 *
 * The global stylesheet (index.css) defines the base palette + body styles.
 */

export const metadata = {
  title: "You're Invited",
  description:
    "Interactive digital invitations — weddings, birthdays, and more.",
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  // --- Script faces (names / calligraphy) ---
  "family=Pinyon+Script" +
  "&family=Great+Vibes" +
  "&family=Dancing+Script:wght@400;600" +
  "&family=Allura" +
  "&family=Tangerine:wght@400;700" +
  "&family=Sacramento" +
  "&family=Parisienne" +
  "&family=Petit+Formal+Script" +
  // --- Serif faces (headings / labels / body) ---
  "&family=Forum" +
  "&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400" +
  "&family=Playfair+Display:wght@400;500;600" +
  "&family=EB+Garamond:wght@400;500" +
  "&family=Cinzel:wght@400;500;600" +
  "&family=Marcellus" +
  "&family=Fraunces:ital,wght@0,400;0,500;0,600;1,400" +
  "&family=Libre+Baskerville:wght@400;700" +
  "&display=swap";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
