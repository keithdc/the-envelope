import Link from "next/link";
import "./ShimmerButton.css";

/**
 * ShimmerButton — a pill button with a light sweep. Adapted from Magic UI's
 * <ShimmerButton /> (MIT) for plain CSS. Renders a Next <Link> when `href` is
 * given, otherwise a <button>.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.href]
 * @param {"primary"|"ghost"} [props.variant="primary"]
 * @param {string} [props.className]
 */
export default function ShimmerButton({
  children,
  href,
  variant = "primary",
  className = "",
  ...rest
}) {
  const cls = `shimmer-btn shimmer-btn--${variant} ${className}`;
  const inner = <span className="shimmer-btn-label">{children}</span>;
  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
