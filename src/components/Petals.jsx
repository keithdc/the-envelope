import { useMemo } from 'react'
import { motion } from 'framer-motion'
import './Petals.css'

/**
 * Decorative animated background: soft petals drifting down behind the
 * envelope. Purely cosmetic and pointer-events:none so it never blocks taps.
 *
 * Each petal gets randomized position, size, duration and delay so the field
 * looks organic. useMemo keeps the random values stable across re-renders.
 */
export default function Petals({ count = 18 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100, // vw
        size: 10 + Math.random() * 18, // px
        duration: 9 + Math.random() * 10, // s
        delay: Math.random() * 10, // s
        drift: (Math.random() - 0.5) * 120, // px horizontal sway
        rotate: Math.random() * 360,
        hue: Math.random() > 0.5 ? 'petal--rose' : 'petal--blush',
      })),
    [count],
  )

  return (
    <div className="petals" aria-hidden="true">
      {/* Soft glow orbs for depth */}
      <div className="glow glow--one" />
      <div className="glow glow--two" />

      {petals.map((p) => (
        <motion.span
          key={p.id}
          className={`petal ${p.hue}`}
          style={{ left: `${p.left}vw`, width: p.size, height: p.size }}
          initial={{ y: '-10vh', x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{
            y: '110vh',
            x: [0, p.drift, -p.drift / 2, p.drift / 3, 0],
            rotate: p.rotate + 360,
            opacity: [0, 0.9, 0.9, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
