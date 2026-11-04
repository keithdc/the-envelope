"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * BlurFade — content fades up out of a soft blur when it scrolls into view.
 * Adapted from Magic UI's <BlurFade /> (MIT), built on framer-motion.
 * Renders statically when the user prefers reduced motion.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.delay=0]   seconds
 * @param {string} [props.as="div"]  element type
 * @param {string} [props.className]
 */
export default function BlurFade({ children, delay = 0, as = "div", className }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  if (reduce) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </Tag>
  );
}
