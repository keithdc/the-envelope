import SharedInvitation from "../../../features/invitation/SharedInvitation.jsx";

/**
 * /i/<token> — the private invitation link a client receives.
 * -------------------------------------------------------------------------
 * The URL segment is a SHARE TOKEN, never a document id. Only an enabled
 * project share token resolves (see getSharedInvitation); templates, raw ids,
 * and stale/turned-off links all show "not valid".
 *
 * Server component so we can set metadata:
 *  - robots noindex/nofollow: private links must never appear in search
 *  - referrer no-referrer: clicking e.g. the map link won't leak the token
 *    to another site through the Referer header
 */
export const metadata = {
  title: "You're Invited",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  referrer: "no-referrer",
};

// Next 15: route params are async in server components.
export default async function SharedInvitePage({ params }) {
  const { slug } = await params;
  return <SharedInvitation token={slug} />;
}
