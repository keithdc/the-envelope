/**
 * DATE FORMATTING HELPERS
 * -------------------------------------------------------------------------
 * The invitation stores ONE source of truth for the wedding moment: `dateISO`
 * (an ISO datetime string). These helpers derive every display string from it,
 * so you never hand-maintain `date`, `dateShort`, and `time` separately.
 *
 * All parse in the viewer's local time. For a fixed wedding-local time
 * regardless of the guest's timezone, keep the ISO string without a zone
 * offset (e.g. "2027-04-17T16:00:00") as we do here.
 */

/** "Saturday, April 17, 2027" */
export function formatLong(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** "04 . 17 . 2027" */
export function formatShort(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${mm} . ${dd} . ${d.getFullYear()}`
}

/** "4:00 in the afternoon" */
export function formatTime(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  const mm = String(minutes).padStart(2, "0")

  // part of day, wedding-invitation style
  let partOfDay = "in the evening"
  if (hours < 12) partOfDay = "in the morning"
  else if (hours < 17) partOfDay = "in the afternoon"

  return `${h12}:${mm} ${partOfDay}`
}
