import PricingSection from "../../../features/landing/PricingSection.jsx";
import FaqSection from "../../../features/landing/FaqSection.jsx";

export const metadata = {
  title: "Pricing · The Envelope",
  description: "One payment per invitation. Choose how personal you want it.",
};

export default function PricingPage() {
  return (
    <>
      <section className="site-section">
        <div className="site-container">
          <header className="section-head">
            <p className="section-eyebrow">Pricing</p>
            <h1 className="section-title">
              Choose your <em>plan</em>
            </h1>
            <p className="section-sub">
              One payment per invitation · no subscription · RSVP included.
            </p>
          </header>
          <PricingSection headingLevel={2} />
        </div>
      </section>
      <section className="site-section site-section--tint">
        <div className="site-container">
          <header className="section-head">
            <h2 className="section-title">Questions before you choose?</h2>
          </header>
          <FaqSection />
        </div>
      </section>
    </>
  );
}
