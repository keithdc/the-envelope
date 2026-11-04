/**
 * PUBLIC SITE CONTENT
 * =========================================================================
 * Every word, number and price the marketing site shows lives here, so copy
 * can change without touching components (and later come from a CMS/backend).
 *
 * ⚠️ PLACEHOLDERS: the stats, reviews and prices below are SAMPLE values for
 * layout only. Replace them with real figures before going live — never
 * publish invented ratings or testimonials.
 */

export const brand = {
  name: "The Envelope",
  tagline: "Digital invitations, crafted for every occasion",
};

/** Header navigation. `href` may be a route or a home-page anchor. */
export const nav = [
  { label: "Home", href: "/" },
  { label: "Designs", href: "/designs" },
  { label: "How it works", href: "/#how" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export const hero = {
  badge: "PLACEHOLDER rating · sample figures", // e.g. "4.9/5 · 120 reviews"
  titleLead: "Beautiful digital invitations for",
  occasions: ["weddings", "birthdays", "christenings", "debuts", "every celebration"],
  subtitle:
    "Pick a design you love. We personalise it with your names, photos and event details, then hand you one private link to share with every guest.",
  primaryCta: { label: "Browse designs", href: "/designs" },
  secondaryCta: { label: "See how it works", href: "/#how" },
};

/** Animated counters (SAMPLE numbers). */
export const stats = [
  { value: 120, suffix: "+", label: "celebrations delivered" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "average rating" },
  { value: 5, suffix: "", label: "occasion types" },
  { value: 48, suffix: "h", label: "typical turnaround" },
];

export const steps = [
  {
    title: "Choose your design",
    text: "Browse the collection by occasion and pick the look that feels like you. Preview every design live, exactly as guests will see it.",
  },
  {
    title: "We make it yours",
    text: "Send us your names, date, venue, story and photos. Our team builds your invitation and shares a private draft for you to review.",
  },
  {
    title: "Share one link",
    text: "Send it by Messenger, WhatsApp, SMS or email. Guests open it on their phone and RSVP right inside the invitation.",
  },
];

export const quote = {
  text: "The celebration starts the moment they open your invitation.",
};

/** "Inside your invitation" feature list (bento grid). `icon` = lucide name. */
export const features = [
  { icon: "MailOpen", title: "An envelope that opens", text: "A wax-sealed envelope that unfolds when your guest taps it." },
  { icon: "Sparkles", title: "Scratch to reveal", text: "A little surprise uncovered with a fingertip — your photo or the date." },
  { icon: "Timer", title: "Live countdown", text: "Days, hours and minutes until the big day." },
  { icon: "MapPin", title: "Venue & map", text: "Ceremony and reception details with one-tap directions." },
  { icon: "Shirt", title: "Dress code & schedule", text: "What to wear, the colour palette and the order of the day." },
  { icon: "ClipboardCheck", title: "RSVP built in", text: "Guests confirm attendance from their phone in seconds." },
  { icon: "Lock", title: "Private by default", text: "Only people with your link can open it. Never listed publicly." },
  { icon: "Palette", title: "Your colours & fonts", text: "Calligraphy and serif pairings, tuned to your theme." },
];

export const atelier = {
  title: "Designed for you, not by a template robot",
  text: "Every invitation is assembled by a real person on our team — your wording, your photos, the sections you want in the order you want.",
  points: ["Choose a design", "Share your details", "Review & approve"],
};

/** SAMPLE testimonials — replace with real, verified reviews. */
export const reviews = [
  { name: "Sample couple", event: "Wedding", text: "Placeholder review: guests kept telling us how much they loved opening the envelope." },
  { name: "Sample parent", event: "Birthday", text: "Placeholder review: the scratch reveal was the highlight for the kids." },
  { name: "Sample family", event: "Christening", text: "Placeholder review: so easy to share, and the RSVPs came in the same day." },
  { name: "Sample debutante", event: "Debut", text: "Placeholder review: it matched my theme perfectly — fonts, colours, everything." },
  { name: "Sample couple", event: "Wedding", text: "Placeholder review: one link for everyone, no more chasing replies in group chats." },
];

/** SAMPLE pricing (PHP). */
export const plans = [
  {
    id: "essential",
    name: "Essential",
    price: "₱0,000",
    blurb: "A collection design with your names, details and photos.",
    features: ["Any design from the collection", "Your names, date, venue & photos", "RSVP built in", "1 private share link", "2 revision rounds"],
    cta: "Start with Essential",
  },
  {
    id: "premium",
    name: "Premium",
    price: "₱0,000",
    featured: true,
    blurb: "Your favourite design, restyled around your event.",
    features: ["Everything in Essential", "Your colours & font pairing", "Custom sections & order", "Scratch-reveal photo", "4 revision rounds"],
    cta: "Choose Premium",
  },
  {
    id: "bespoke",
    name: "Bespoke",
    price: "₱00,000",
    blurb: "A one-of-a-kind invitation designed from scratch.",
    features: ["Everything in Premium", "Original artwork & envelope", "Dedicated designer", "Priority turnaround", "Unlimited revisions"],
    cta: "Talk to us",
  },
];

export const faqs = [
  {
    q: "Is it only for weddings?",
    a: "No. Designs are grouped by occasion — weddings, birthdays, christenings, debuts and more — and every one can be personalised for your event.",
  },
  {
    q: "Who can see my invitation?",
    a: "Only people you send the link to. Your invitation never appears on our public pages, the link can't be guessed, and you can replace or switch off the link at any time.",
  },
  {
    q: "How do I send it?",
    a: "You get one private link. Share it by Messenger, WhatsApp, SMS or email. Guests open it in their phone's browser — nothing to install.",
  },
  {
    q: "Can guests RSVP?",
    a: "Yes. Guests reply inside the invitation with their name, attendance and number of guests.",
  },
  {
    q: "Can I change details after it's shared?",
    a: "Yes. Updates appear on the same link, and every saved version is kept so we can roll back if needed.",
  },
  {
    q: "How long does it take?",
    a: "Most invitations are ready within a few days of receiving your details. Bespoke designs follow a schedule we agree together.",
  },
];

export const footer = {
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Designs", href: "/designs" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Occasions",
      links: [
        { label: "Weddings", href: "/designs#wedding" },
        { label: "Birthdays", href: "/designs#birthday" },
        { label: "Christenings", href: "/designs#christening" },
      ],
    },
  ],
};
