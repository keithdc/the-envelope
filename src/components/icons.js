/**
 * ICON MAP
 * -------------------------------------------------------------------------
 * Maps plain string keys (used in data like invitation.timeline[].icon) to
 * Lucide icon components. Keeping data as strings (not imported components)
 * means the invitation data stays serializable — it could come from JSON, an
 * API, or a form without importing React.
 *
 * Add an icon: import it from lucide-react and add a key here. Browse icons at
 * https://lucide.dev/icons/
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
} from "lucide-react"

export const ICONS = {
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
}

/**
 * Resolve an icon key to a component. Falls back to Sparkles for unknown keys
 * so a typo in the data never crashes the UI.
 * @param {string} key
 */
export function getIcon(key) {
  return ICONS[key] ?? Sparkles
}
