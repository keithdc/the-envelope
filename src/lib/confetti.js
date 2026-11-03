import confetti from 'canvas-confetti'

/**
 * Confetti effects built on the `canvas-confetti` engine — the same library
 * Magic UI's <Confetti /> component wraps. Since our project is plain Vite +
 * CSS (no Tailwind / TypeScript), these are small helper functions styled to
 * our wedding palette instead of the shadcn-style component.
 *
 * Content adapted from the canvas-confetti recipes for compliance.
 */

// Wedding palette for the confetti pieces.
const WEDDING_COLORS = ['#c98a86', '#a9625d', '#c9a86a', '#dcc7a0', '#f3e4e1', '#ffffff']

/**
 * A rich, "realistic" celebration burst from the lower-center of the screen.
 * Fires several staggered bursts with varied velocity and particle counts so
 * it looks organic rather than a single pop.
 */
export function realisticBurst() {
  const count = 200
  const defaults = { origin: { y: 0.7 }, colors: WEDDING_COLORS }

  const fire = (particleRatio, opts) =>
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

/**
 * Two cannons firing inward from the left and right edges for ~3 seconds.
 * Great for a sustained "the moment has arrived" feel.
 */
export function sideCannons({ durationMs = 2800 } = {}) {
  const end = Date.now() + durationMs

  const frame = () => {
    if (Date.now() > end) return
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      startVelocity: 55,
      origin: { x: 0, y: 0.65 },
      colors: WEDDING_COLORS,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      startVelocity: 55,
      origin: { x: 1, y: 0.65 },
      colors: WEDDING_COLORS,
    })
    requestAnimationFrame(frame)
  }
  frame()
}

/**
 * A gentle shower of heart-shaped confetti drifting down from the top.
 * Uses a registered custom heart shape path.
 */
export function heartsFall({ durationMs = 2500 } = {}) {
  const heart = confetti.shapeFromPath({
    path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,205 -76,-54 -151,-129 -151,-205 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
    matrix: [0.03333, 0, 0, 0.03333, -5.56, -5.56],
  })

  const end = Date.now() + durationMs
  const frame = () => {
    if (Date.now() > end) return
    confetti({
      particleCount: 2,
      startVelocity: 0,
      ticks: 200,
      gravity: 0.5,
      origin: { x: Math.random(), y: -0.1 },
      colors: ['#c98a86', '#a9625d', '#e7a9a4'],
      shapes: [heart],
      scalar: 2.2,
    })
    requestAnimationFrame(frame)
  }
  frame()
}
