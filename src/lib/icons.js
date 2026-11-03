/**
 * ICON MAP
 * -------------------------------------------------------------------------
 * Maps plain string keys (used in data like invitation.timeline[].icon and
 * attire.attireTypes[].icon) to icon COMPONENTS. Keeping data as strings (not
 * imported components) means the invitation data stays serializable — it could
 * come from JSON, an API, or a form without importing React.
 *
 * We mix two icon libraries:
 *   - lucide-react     — clean line icons for schedule/event + map/calendar
 *   - react-icons (Pi) — Phosphor set, which has real GARMENT icons (dress,
 *                        coat hanger, etc.) that lucide lacks.
 * Both libraries' components accept the same size/className/style props, so
 * they drop into the same map interchangeably.
 *
 * Browse: https://lucide.dev/icons/  and  https://react-icons.github.io/react-icons/
 */
import {
  Users,
  Heart,
  Martini,
  Utensils,
  Music,
  Sparkles,
  Church,
  Camera,
  Gift,
  Car,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  PiCoatHangerLight,
  PiDressLight,
  PiTShirtLight,
  PiHandbagLight,
  PiSneakerLight,
  PiWatchLight,
  PiEyeglassesLight,
  PiPaintBrushLight,
  PiCrownLight,
} from "react-icons/pi";

export const ICONS = {
  // ---- schedule / event icons (lucide) ----
  users: Users, // guests arriving
  rings: Heart, // ceremony (Lucide has no "rings"; Heart reads as the vows)
  ceremony: Church,
  cocktail: Martini, // cocktail hour
  dinner: Utensils, // reception / dinner
  music: Music, // first dance / dancing
  sparkles: Sparkles, // send-off
  photos: Camera,
  gift: Gift,
  travel: Car,
  calendar: CalendarDays,
  map: MapPin,

  // ---- attire / garment icons (react-icons / Phosphor — real garments) ----
  suit: PiCoatHangerLight, // suit / coat & tie
  barong: PiTShirtLight, // barong tagalog (formal shirt)
  shirt: PiTShirtLight,
  dress: PiDressLight,
  gown: PiDressLight,
  jewelry: PiCrownLight,
  bag: PiHandbagLight,
  shoes: PiSneakerLight,
  watch: PiWatchLight,
  accessories: PiEyeglassesLight,
  palette: PiPaintBrushLight, // color guidance
};

/**
 * Resolve an icon key to a component. Falls back to Sparkles for unknown keys
 * so a typo in the data never crashes the UI.
 * @param {string} key
 */
export function getIcon(key) {
  return ICONS[key] ?? Sparkles;
}
