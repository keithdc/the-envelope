import SiteHeader from "../../features/landing/SiteHeader.jsx";
import SiteFooter from "../../features/landing/SiteFooter.jsx";
import "../../features/landing/site.css";

/**
 * Layout for the PUBLIC marketing pages (/, /designs, /pricing, /faq).
 * `(site)` is a route group: it adds the header/footer without changing URLs.
 * /admin and the private client link /i/<token> live OUTSIDE this group, so
 * they never get the marketing header (the client invitation stays bare).
 */
export default function SiteLayout({ children }) {
  return (
    <div className="site">
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="site-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
