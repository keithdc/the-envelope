"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Lock,
  MailOpen,
  MapPin,
  Palette,
  Shirt,
  Sparkles,
  Star,
  Timer,
} from "lucide-react";
import AnimatedGradientText from "../../ui/AnimatedGradientText.jsx";
import BlurFade from "../../ui/BlurFade.jsx";
import DotPattern from "../../ui/DotPattern.jsx";
import Marquee from "../../ui/Marquee.jsx";
import MorphingText from "../../ui/MorphingText.jsx";
import NumberTicker from "../../ui/NumberTicker.jsx";
import ShimmerButton from "../../ui/ShimmerButton.jsx";
import LiveDemo from "./LiveDemo.jsx";
import DesignsGallery from "./DesignsGallery.jsx";
import PricingSection from "./PricingSection.jsx";
import FaqSection from "./FaqSection.jsx";
import {
  atelier,
  features,
  hero,
  quote,
  reviews,
  stats,
  steps,
} from "./siteContent.js";
import "./HomePage.css";

// siteContent stores icon NAMES (serializable); resolve them here.
const FEATURE_ICONS = {
  MailOpen,
  Sparkles,
  Timer,
  MapPin,
  Shirt,
  ClipboardCheck,
  Lock,
  Palette,
};

/** Public home page: every section, top to bottom. */
export default function HomePage() {
  const half = Math.ceil(reviews.length / 2);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="home-hero">
        <DotPattern />
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="site-container home-hero-grid">
          <div className="home-hero-copy">
            <BlurFade>
              <AnimatedGradientText icon={<Star size={14} fill="currentColor" />}>
                {hero.badge}
              </AnimatedGradientText>
            </BlurFade>

            <BlurFade delay={0.08}>
              <h1 className="home-hero-title">
                {/* the full sentence for screen readers; the morph is visual */}
                <span className="sr-only">
                  {hero.titleLead} {hero.occasions.join(", ")}
                </span>
                <span aria-hidden="true">
                  {hero.titleLead}
                  <MorphingText
                    texts={hero.occasions}
                    className="home-hero-morph"
                  />
                </span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.16}>
              <p className="home-hero-sub">{hero.subtitle}</p>
            </BlurFade>

            <BlurFade delay={0.24}>
              <div className="home-hero-ctas">
                <ShimmerButton href={hero.primaryCta.href}>
                  {hero.primaryCta.label} <ArrowRight size={16} aria-hidden="true" />
                </ShimmerButton>
                <ShimmerButton href={hero.secondaryCta.href} variant="ghost">
                  {hero.secondaryCta.label}
                </ShimmerButton>
              </div>
            </BlurFade>

            <BlurFade delay={0.32}>
              <p className="home-hero-note">
                <Lock size={14} aria-hidden="true" /> Private link · RSVP built in
                · Works on every phone
              </p>
            </BlurFade>
          </div>

          <div className="home-hero-phone">
            <LiveDemo />
          </div>
        </div>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section className="home-stats" aria-label="At a glance">
        <div className="site-container home-stats-grid">
          {stats.map((s) => (
            <div className="home-stat" key={s.label}>
              <p className="home-stat-value">
                <NumberTicker value={s.value} decimalPlaces={s.decimals ?? 0} />
                {s.suffix}
              </p>
              <p className="home-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="site-container home-stats-note">Sample figures — placeholder until launch.</p>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="site-section" id="how">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">
              Three steps. <em>No design skills needed.</em>
            </h2>
          </BlurFade>
          <ol className="home-steps">
            {steps.map((s, i) => (
              <BlurFade as="li" key={s.title} delay={i * 0.1} className="home-step">
                <span className="home-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </BlurFade>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- QUOTE ---------------- */}
      <section className="home-quote">
        <BlurFade className="site-container">
          <p className="home-quote-text">“{quote.text}”</p>
        </BlurFade>
      </section>

      {/* ---------------- COLLECTION ---------------- */}
      <section className="site-section" id="collection">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">The collection</p>
            <h2 className="section-title">
              Designs for <em>every occasion</em>
            </h2>
            <p className="section-sub">
              Every design is personalised by our team. Preview any of them live.
            </p>
          </BlurFade>
          <DesignsGallery limit={6} grouped={false} />
          <div className="home-more">
            <ShimmerButton href="/designs" variant="ghost">
              View all designs <ArrowRight size={16} aria-hidden="true" />
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* ---------------- INSIDE YOUR INVITATION ---------------- */}
      <section className="site-section site-section--tint" id="features">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">Inside your invitation</p>
            <h2 className="section-title">
              Everything your guests need. <em>Nothing they don't.</em>
            </h2>
            <p className="section-sub">
              Choose the sections you want, in the order you want. One link holds
              it all.
            </p>
          </BlurFade>
          <div className="home-bento">
            {features.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon] ?? Sparkles;
              return (
                <BlurFade
                  key={f.title}
                  delay={(i % 4) * 0.06}
                  className={`home-bento-card ${i === 0 || i === 5 ? "is-wide" : ""}`}
                >
                  <span className="home-bento-icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- ATELIER ---------------- */}
      <section className="site-section">
        <div className="site-container home-atelier">
          <BlurFade className="home-atelier-copy">
            <p className="section-eyebrow">Atelier</p>
            <h2 className="section-title">{atelier.title}</h2>
            <p className="section-sub">{atelier.text}</p>
          </BlurFade>
          <ol className="home-atelier-points">
            {atelier.points.map((p, i) => (
              <BlurFade as="li" key={p} delay={i * 0.1}>
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                {p}
              </BlurFade>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- REVIEWS ---------------- */}
      <section className="site-section site-section--tint" aria-labelledby="reviews-title">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">Kind words</p>
            <h2 className="section-title" id="reviews-title">
              Loved by hosts <em>and guests</em>
            </h2>
            <p className="section-sub">Sample reviews — placeholders until launch.</p>
          </BlurFade>
        </div>
        <div className="home-reviews">
          <Marquee duration={45}>
            {reviews.slice(0, half).map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </Marquee>
          <Marquee duration={50} reverse>
            {reviews.slice(half).map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </Marquee>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section className="site-section" id="pricing">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">Pricing</p>
            <h2 className="section-title">
              One payment. <em>No subscription.</em>
            </h2>
          </BlurFade>
          <PricingSection />
          <div className="home-more">
            <Link href="/pricing" className="home-link">
              Compare plans in detail <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="site-section site-section--tint" id="faq">
        <div className="site-container">
          <BlurFade className="section-head">
            <p className="section-eyebrow">Questions</p>
            <h2 className="section-title">Frequently asked</h2>
          </BlurFade>
          <FaqSection limit={4} />
          <div className="home-more">
            <Link href="/faq" className="home-link">
              See all questions <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="site-section">
        <BlurFade className="site-container">
          <div className="home-cta">
            <DotPattern gap={18} />
            <h2>Ready to send something unforgettable?</h2>
            <p>Find your design, and we'll take it from there.</p>
            <ShimmerButton href="/designs">
              Browse designs <ArrowRight size={16} aria-hidden="true" />
            </ShimmerButton>
          </div>
        </BlurFade>
      </section>
    </>
  );
}

function ReviewCard({ review }) {
  return (
    <figure className="home-review">
      <div className="home-review-stars" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
        ))}
      </div>
      <blockquote>{review.text}</blockquote>
      <figcaption>
        {review.name} · <span>{review.event}</span>
      </figcaption>
    </figure>
  );
}
