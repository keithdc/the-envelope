import BorderBeam from "./BorderBeam.jsx";
import "./PhoneFrame.css";

/**
 * PhoneFrame — a true-resolution phone mock (430 x 932, iPhone Pro Max
 * logical size) scaled down with CSS. Because the screen is a real 430px-wide
 * size container, the invitation's cqw/cqh units resolve exactly as on a phone.
 *
 * Set the display size from the parent with `--phone-scale` (default 0.6).
 * The shell reserves the SCALED footprint so layout around it stays correct.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children  what renders on the screen
 * @param {boolean} [props.beam=false]      animated border beam around the phone
 * @param {string} [props.className]
 * @param {string} [props.label]            accessible name for the screen region
 */
export default function PhoneFrame({
  children,
  beam = false,
  className = "",
  label = "Invitation preview",
}) {
  return (
    <div className={`phone-shell ${className}`}>
      <div className="phone">
        {beam && <BorderBeam size={260} duration={9} />}
        <div className="phone-island" aria-hidden="true" />
        <div className="phone-screen" role="region" aria-label={label}>
          {children}
        </div>
      </div>
    </div>
  );
}
