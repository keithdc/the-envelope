/**
 * CATEGORIES (event types)
 * =========================================================================
 * A dynamic layer above Templates & Projects. Every document belongs to one
 * category (wedding, birthday, …). Categories are DATA, not a hardcoded enum,
 * so a future admin screen / backend can add, rename, or reorder them without
 * code changes. Each is a small, serializable record.
 *
 * Future backend mapping:
 *   listCategories() -> GET /api/categories
 *
 * `icon` is a string key into lib/icons.js (serializable, no imports).
 * The `Category` interface lives in @/types (types/document.js).
 */

/**
 * Seeded categories. Extendable later from an admin UI / backend.
 * @type {import('@/types').Category[]}
 */
export const mockCategories = [
  { id: "wedding", label: "Wedding", icon: "rings", order: 0 },
  { id: "birthday", label: "Birthday", icon: "sparkles", order: 1 },
  { id: "christening", label: "Christening", icon: "heart", order: 2 },
  { id: "debut", label: "Debut", icon: "sparkles", order: 3 },
  { id: "corporate", label: "Corporate", icon: "users", order: 4 },
];

/** The default category for new/seed documents. */
export const DEFAULT_CATEGORY = "wedding";
