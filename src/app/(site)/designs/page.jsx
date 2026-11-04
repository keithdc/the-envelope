import DesignsGallery from "../../../features/landing/DesignsGallery.jsx";

export const metadata = {
  title: "Designs · The Envelope",
  description: "Browse invitation designs by occasion and preview each one live.",
};

export default function DesignsPage() {
  return (
    <section className="site-section">
      <div className="site-container">
        <header className="section-head">
          <p className="section-eyebrow">The collection</p>
          <h1 className="section-title">
            Find your <em>design</em>
          </h1>
          <p className="section-sub">
            Grouped by occasion. Tap “Preview live” to open any design exactly as
            your guests will.
          </p>
        </header>
        <DesignsGallery />
      </div>
    </section>
  );
}
