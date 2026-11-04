import "./AnimatedGradientText.css";

/**
 * AnimatedGradientText — a pill badge with a slowly shifting gradient label.
 * Adapted from Magic UI's <AnimatedGradientText /> (MIT) for plain CSS.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.icon]   optional leading icon
 * @param {string} [props.className]
 */
export default function AnimatedGradientText({ children, icon, className = "" }) {
  return (
    <span className={`agt ${className}`}>
      {icon && <span className="agt-icon">{icon}</span>}
      <span className="agt-text">{children}</span>
    </span>
  );
}
