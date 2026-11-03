import { useEffect } from "react";
import { realisticBurst, sideCannons, heartsFall } from "../lib/confetti.js";

/**
 * Declarative confetti trigger, inspired by Magic UI's <Confetti /> component.
 * Mounting it fires the chosen effect once. Adapted to our plain Vite/CSS
 * setup (Magic UI's original is a Tailwind/TS canvas component).
 *
 * props:
 *   effect: 'realistic' | 'cannons' | 'hearts'  (default 'realistic')
 *   fire:   when true, runs the effect on mount / when it flips to true
 */
export default function Confetti({ effect = "realistic", fire = true }) {
  useEffect(() => {
    if (!fire) return;
    if (effect === "cannons") sideCannons();
    else if (effect === "hearts") heartsFall();
    else realisticBurst();
  }, [effect, fire]);

  return null;
}
