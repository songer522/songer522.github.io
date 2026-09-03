/**
 * The date a vlog was filmed, which lives in the YouTube description as `Date: 2024.08.24`.
 *
 * It is not the upload date and cannot be derived from one: most of this playlist went
 * up in a single batch, so uploads cluster in 2025 while the footage spans years. The
 * description is the only place the real date exists.
 */

// Tolerates the separators and stray spaces that creep into a hand-typed line —
// `2024. 03.22` is in the playlist today.
const DATE_LINE = /Date:\s*(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/;

/**
 * @param {string | null | undefined} description a YouTube description
 * @returns {string | null} ISO `YYYY-MM-DD`, or null if there is no usable date line
 */
export function parseVlogDate(description) {
  const match = String(description ?? '').match(DATE_LINE);
  if (!match) return null;

  const [, year, month, day] = match;
  // A nonsense date is worse than no date: it would sort the video to a confident but
  // wrong place. Bounding the day at 31 is not enough — 2024.02.31 is in range and
  // still not a day. Date.UTC normalises anything out of range (Feb 31 becomes Mar 2,
  // month 13 becomes next January), so build the date and reject it unless every field
  // survives the round trip. That gets the month lengths and leap years for free.
  const utc = new Date(Date.UTC(+year, +month - 1, +day));
  if (
    utc.getUTCFullYear() !== +year ||
    utc.getUTCMonth() !== +month - 1 ||
    utc.getUTCDate() !== +day
  ) {
    return null;
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Newest first, by filming date. Undated entries keep their playlist order at the end,
 * where they are visible as needing a `Date:` line rather than silently misplaced.
 *
 * @template {{ date?: string }} T
 * @param {T[]} vlogs
 * @returns {T[]} a new array; the input is left alone
 */
export function sortByDate(vlogs) {
  const dated = vlogs.filter((v) => v.date);
  const undated = vlogs.filter((v) => !v.date);

  // Array.prototype.sort is stable, so same-day videos stay in playlist order.
  return [...dated.sort((a, b) => b.date.localeCompare(a.date)), ...undated];
}
