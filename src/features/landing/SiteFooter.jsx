"use client";

import { useState } from "react";
import Link from "next/link";
import { brand, footer } from "./siteContent.js";

/**
 * Site footer with a newsletter sign-up. The sign-up is UI-only until a
 * backend/email provider exists — it validates and thanks the user, but does
 * not send the address anywhere.
 */
export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;
    // TODO(backend): POST to the newsletter provider here.
    setDone(true);
  };

  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="site-newsletter">
          <div>
            <h2 className="site-newsletter-title">Ideas for your invitation</h2>
            <p className="site-newsletter-text">
              Wording tips, timelines and new designs — occasionally, never spam.
            </p>
          </div>
          {done ? (
            <p className="site-newsletter-done" role="status">
              Thank you! You're on the list.
            </p>
          ) : (
            <form className="site-newsletter-form" onSubmit={submit} noValidate>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </div>

        <div className="site-footer-grid">
          <div>
            <p className="site-brand site-brand--footer">{brand.name}</p>
            <p className="site-footer-tag">{brand.tagline}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="site-footer-heading">{col.title}</h3>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="site-footer-legal">
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
