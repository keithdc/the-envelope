/**
 * SHARED OPEN-ANIMATION TIMING
 * -------------------------------------------------------------------------
 * ONE source of truth for how dramatic every invitation opening is. All open
 * animations (flap, unfold, and any future ones) import these values, so
 * changing a number here changes the pacing EVERYWHERE.
 *
 * The opening is a 3-beat sequence:
 *   BEAT 1  the seal breaks (press, shudder, lift + fade)
 *   BEAT 2  the cover opens (flap folds / gatefold panels swing)
 *   BEAT 3  the letter/card rises into view, holds, then advances
 */
export const OPEN_TIMING = {
  // BEAT 1 — seal
  seal: {
    delay: 0,
    duration: 0.95,
    times: [0, 0.3, 1], // press -> hold -> lift
  },

  // BEAT 2 — cover (flap / gatefold). Starts after the seal has broken.
  cover: {
    delay: 1.1,
    duration: 1.3,
    times: [0, 0.12, 1], // tiny anticipation dip -> full open
  },

  // BEAT 3 — the letter/card rising out. Starts after the cover is open.
  letter: {
    delay: 2.5,
    duration: 1.8,
    // opacity usually fades in faster than the position settles
    fadeDuration: 0.9,
  },

  // how long to hold on the fully revealed invitation before advancing (ms)
  holdMs: 650,

  // shared easing curves
  ease: {
    cover: [0.5, 0, 0.2, 1],
    rise: [0.16, 1, 0.3, 1],
  },
}
