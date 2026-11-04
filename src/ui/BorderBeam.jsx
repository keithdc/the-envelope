import "./BorderBeam.css";

/**
 * BorderBeam — a light beam that travels around its parent's border.
 * Adapted from Magic UI's <BorderBeam /> (MIT) for plain CSS. The parent must
 * be `position: relative` and have a border-radius; the beam inherits it.
 *
 * @param {Object} props
 * @param {number} [props.size=200]       beam length in px
 * @param {number} [props.duration=8]     seconds per lap
 * @param {number} [props.width=2]        border thickness in px
 * @param {string} [props.from]           start color
 * @param {string} [props.to]             end color
 */
export default function BorderBeam({
  size = 200,
  duration = 8,
  width = 2,
  from = "#f2c14e",
  to = "#c98a86",
}) {
  return (
    <span
      className="border-beam"
      aria-hidden="true"
      style={{
        "--bb-size": `${size}px`,
        "--bb-duration": `${duration}s`,
        "--bb-width": `${width}px`,
        "--bb-from": from,
        "--bb-to": to,
      }}
    />
  );
}
