import FaqSection from "../../../features/landing/FaqSection.jsx";

export const metadata = {
  title: "FAQ · The Envelope",
  description: "Answers about privacy, sharing, RSVPs and timelines.",
};

export default function FaqPage() {
  return (
    <section className="site-section">
      <div className="site-container">
        <header className="section-head">
          <p className="section-eyebrow">Help</p>
          <h1 className="section-title">
            Frequently asked <em>questions</em>
          </h1>
        </header>
        <FaqSection />
      </div>
    </section>
  );
}
