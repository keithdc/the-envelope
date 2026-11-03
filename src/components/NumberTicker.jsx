import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

/**
 * NumberTicker — a number that springs smoothly to its value when it scrolls
 * into view. Adapted from Magic UI's <NumberTicker /> (which is MIT-licensed
 * and built on framer-motion's useSpring) for our plain Vite/CSS setup.
 *
 * Content adapted from the Magic UI recipe for compliance.
 *
 * @param {Object} props
 * @param {number} props.value          target number
 * @param {number} [props.startValue=0] starting number
 * @param {number} [props.decimalPlaces=0]
 * @param {number} [props.delay=0]      seconds before it starts
 * @param {string} [props.className]
 */
export default function NumberTicker({
  value,
  startValue = 0,
  decimalPlaces = 0,
  delay = 0,
  className,
}) {
  const ref = useRef(null)
  const motionValue = useMotionValue(startValue)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const inView = useInView(ref, { once: true, margin: "0px" })

  // kick off the spring toward `value` once visible
  useEffect(() => {
    if (!inView) return
    const id = setTimeout(() => motionValue.set(value), delay * 1000)
    return () => clearTimeout(id)
  }, [inView, value, delay, motionValue])

  // write the formatted number straight to the DOM node on each spring frame
  useEffect(() => {
    return spring.on("change", (latest) => {
      if (!ref.current) return
      ref.current.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(latest.toFixed(decimalPlaces)))
    })
  }, [spring, decimalPlaces])

  return (
    <span ref={ref} className={className}>
      {startValue}
    </span>
  )
}
