import { ChevronDown } from "lucide-react";
import { faqs } from "./siteContent.js";
import "./FaqSection.css";

/**
 * FAQ accordion built on native <details>/<summary>: keyboard and screen-reader
 * accessible with no JavaScript. Questions come from siteContent.js.
 *
 * @param {{ limit?: number }} props
 */
export default function FaqSection({ limit }) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  return (
    <div className="faq-list">
      {items.map((f) => (
        <details className="faq-item" key={f.q}>
          <summary>
            <span>{f.q}</span>
            <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
