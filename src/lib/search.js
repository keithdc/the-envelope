/**
 * SEARCH HELPERS (pure, no React)
 * -------------------------------------------------------------------------
 * Forgiving client-side text search used by the admin gallery:
 *  - case- and accent-insensitive ("jose" matches "José")
 *  - every word in the query must appear somewhere ("rose wed" matches a
 *    wedding template titled "Classic Rose"), in any order
 * When a backend exists, the same query string can be sent to the server.
 */

/** Lowercase and strip accents so comparisons are forgiving. */
export function normalize(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Split a query into normalized words. */
export function tokenize(query) {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/**
 * True if every query word appears in at least one of `fields`.
 * An empty query matches everything.
 * @param {Array<string|undefined|null>} fields  searchable values
 * @param {string} query
 */
export function matchesQuery(fields, query) {
  const words = tokenize(query);
  if (words.length === 0) return true;
  const haystack = fields.map(normalize).join(" ");
  return words.every((w) => haystack.includes(w));
}
