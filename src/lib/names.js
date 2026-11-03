/**
 * NAME HELPERS
 * -------------------------------------------------------------------------
 * The source of truth for who an event is for is `names` (an array of first
 * names). The display string and the seal monogram are DERIVED from it, so you
 * never hand-maintain `couple` / `sealMonogram` separately.
 *
 * Event-type agnostic: works for a wedding (two names), a birthday or christening
 * (one name), or any gathering (several names).
 *
 *   names: ["Karen", "Bert"]         -> displayNames: "Karen & Bert", monogram: "K & B"
 *   names: ["Mateo"]                 -> displayNames: "Mateo",         monogram: "M"
 *   names: ["Ana", "Ben", "Cy"]      -> displayNames: "Ana, Ben & Cy", monogram: "A B C"
 */

/**
 * Human-readable joined names, e.g. "Karen & Bert" or "Ana, Ben & Cy".
 * @param {string[]} names
 * @param {string} [joiner="&"] the final separator (e.g. "&", "and", "+")
 */
export function displayNames(names = [], joiner = "&") {
  const clean = names.map((n) => (n ?? "").trim()).filter(Boolean)
  if (clean.length === 0) return ""
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} ${joiner} ${clean[1]}`
  return `${clean.slice(0, -1).join(", ")} ${joiner} ${clean[clean.length - 1]}`
}

/**
 * Monogram from the first letters, e.g. ["Karen","Bert"] -> "K & B".
 * @param {string[]} names
 * @param {string} [joiner="&"]
 */
export function monogram(names = [], joiner = "&") {
  const initials = names
    .map((n) => (n ?? "").trim()[0])
    .filter(Boolean)
    .map((c) => c.toUpperCase())
  if (initials.length === 0) return ""
  if (initials.length === 1) return initials[0]
  return initials.join(` ${joiner} `)
}
