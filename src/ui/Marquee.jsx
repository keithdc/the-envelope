import "./Marquee.css";

/**
 * Marquee — an endlessly scrolling row. Adapted from Magic UI's <Marquee />
 * (MIT) for plain CSS. Content is rendered twice for a seamless loop; the
 * duplicate is hidden from assistive tech. Pauses on hover and stops entirely
 * when the user prefers reduced motion.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.reverse=false]  scroll right-to-left vs left-to-right
 * @param {number} [props.duration=40]      seconds per loop
 * @param {string} [props.className]
 */
export default function Marquee({
  children,
  reverse = false,
  duration = 40,
  className = "",
}) {
  return (
    <div
      className={`marquee ${reverse ? "marquee--reverse" : ""} ${className}`}
      style={{ "--marquee-duration": `${duration}s` }}
    >
      <div className="marquee-track">
        <div className="marquee-group">{children}</div>
        <div className="marquee-group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
