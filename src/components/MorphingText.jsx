import { useCallback, useEffect, useRef } from "react"
import "./MorphingText.css"

/**
 * MorphingText — cross-fades + blurs between an array of strings on a loop.
 * Adapted from Magic UI's <MorphingText /> (MIT-licensed) for our plain
 * Vite/CSS setup; the morph is driven by a requestAnimationFrame loop that
 * tweaks opacity + blur on two stacked spans.
 *
 * Content adapted from the Magic UI recipe for compliance.
 *
 * @param {Object} props
 * @param {string[]} props.texts          strings to cycle through
 * @param {string}  [props.className]
 * @param {number}  [props.morphTime=1.3] seconds of morph
 * @param {number}  [props.cooldownTime=1.6] seconds held between morphs
 */
export default function MorphingText({
  texts,
  className = "",
  morphTime = 1.3,
  cooldownTime = 1.6,
}) {
  const text1Ref = useRef(null)
  const text2Ref = useRef(null)
  const indexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())

  const setStyles = useCallback(
    (fraction) => {
      const [c1, c2] = [text1Ref.current, text2Ref.current]
      if (!c1 || !c2 || texts.length === 0) return

      // incoming text (c2)
      c2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      c2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      // outgoing text (c1)
      const inv = 1 - fraction
      c1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`
      c1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`

      c1.textContent = texts[indexRef.current % texts.length]
      c2.textContent = texts[(indexRef.current + 1) % texts.length]
    },
    [texts],
  )

  useEffect(() => {
    let raf
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = new Date()
      const dt = (now - timeRef.current) / 1000
      timeRef.current = now

      cooldownRef.current -= dt
      if (cooldownRef.current <= 0) {
        // morphing phase
        morphRef.current += dt
        let fraction = morphRef.current / morphTime
        if (fraction >= 1) {
          // finished one morph; advance and start cooldown
          fraction = 1
          morphRef.current = 0
          cooldownRef.current = cooldownTime
          indexRef.current += 1
        }
        setStyles(fraction)
      } else {
        // holding fully-visible on the current text
        if (text1Ref.current && text2Ref.current) {
          text1Ref.current.style.filter = "none"
          text1Ref.current.style.opacity = "100%"
          text2Ref.current.style.filter = "blur(100px)"
          text2Ref.current.style.opacity = "0%"
          text1Ref.current.textContent = texts[indexRef.current % texts.length]
        }
      }
    }
    // single text => no loop needed
    if (texts.length <= 1) {
      if (text1Ref.current) text1Ref.current.textContent = texts[0] ?? ""
      return
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [texts, morphTime, cooldownTime, setStyles])

  return (
    <span className={`morphing-text ${className}`}>
      <span ref={text1Ref} className="morph-layer" />
      <span ref={text2Ref} className="morph-layer" />
      {/* SVG blur threshold makes the morph read as liquid, not just a fade */}
      <svg className="morph-filters" aria-hidden="true">
        <defs>
          <filter id="morph-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </span>
  )
}
