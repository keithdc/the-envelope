/**
 * OPEN-ANIMATION REGISTRY
 * -------------------------------------------------------------------------
 * Maps an animation KEY (used in templates.js `openAnimation`) to the React
 * component that performs that opening.
 *
 * CONTRACT — every open-animation component receives the same props:
 *   - data     : the invitation data (names, monogram, dateShort, ...)
 *   - assets   : image paths for this template (sealImage, stampImage, ...)
 *   - onOpened : call this when the opening finishes to advance the flow
 *
 * To add a new opening style:
 *   1. build a component honoring the contract above
 *   2. import it here and add it to `openAnimations` under a new key
 *   3. reference that key from a template's `openAnimation`
 */
import FlapOpen from "./FlapOpen.jsx";
import UnfoldOpen from "./UnfoldOpen.jsx";

export const openAnimations = {
  flap: FlapOpen,
  unfold: UnfoldOpen,
};

/**
 * Resolve a key to a component, falling back to the flap envelope.
 * @param {string} key
 * @returns {React.ComponentType<import('@/types').OpenAnimationProps>}
 */
export function getOpenAnimation(key) {
  return openAnimations[key] ?? openAnimations.flap;
}
