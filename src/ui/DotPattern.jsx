import { useId } from "react";
import "./DotPattern.css";

/**
 * DotPattern — a subtle dotted SVG background that fades out toward the edges.
 * Adapted from Magic UI's <DotPattern /> (MIT). Place inside a
 * `position: relative` container; it fills it and ignores pointer events.
 *
 * @param {Object} props
 * @param {number} [props.gap=22]   spacing between dots (px)
 * @param {number} [props.radius=1.2]
 * @param {string} [props.className]
 */
export default function DotPattern({ gap = 22, radius = 1.2, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`dot-pattern ${className}`} aria-hidden="true">
      <defs>
        <pattern
          id={`dots-${id}`}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={gap / 2} cy={gap / 2} r={radius} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dots-${id})`} />
    </svg>
  );
}
