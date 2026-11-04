import { Check } from "lucide-react";
import ShimmerButton from "../../ui/ShimmerButton.jsx";
import BorderBeam from "../../ui/BorderBeam.jsx";
import { plans } from "./siteContent.js";
import "./PricingSection.css";

/**
 * Plan cards. Prices/features come from siteContent.js (currently SAMPLE
 * values). The featured plan gets a moving border beam.
 *
 * @param {{ headingLevel?: 2|3 }} props
 */
export default function PricingSection({ headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <div className="pricing-grid">
      {plans.map((p) => (
        <article
          key={p.id}
          className={`plan ${p.featured ? "plan--featured" : ""}`}
          aria-label={`${p.name} plan`}
        >
          {p.featured && <BorderBeam size={180} duration={7} />}
          {p.featured && <span className="plan-badge">Most loved</span>}
          <H className="plan-name">{p.name}</H>
          <p className="plan-price">
            {p.price}
            <span className="plan-price-note"> · one-time</span>
          </p>
          <p className="plan-blurb">{p.blurb}</p>
          <ul className="plan-features">
            {p.features.map((f) => (
              <li key={f}>
                <Check size={16} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <ShimmerButton
            href="/designs"
            variant={p.featured ? "primary" : "ghost"}
            className="plan-cta"
          >
            {p.cta}
          </ShimmerButton>
        </article>
      ))}
    </div>
  );
}
