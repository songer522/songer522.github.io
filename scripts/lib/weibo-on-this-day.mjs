/**
 * "On this day" — the archive's default view, and the homepage strip.
 *
 * Matching is on the Beijing `MM-DD` already stored on each post, so it is a string
 * comparison with no Date construction anywhere. That is deliberate: this code runs in
 * the browser, where the visitor's timezone would otherwise decide which day's posts
 * they see.
 *
 * This module is imported by both the ingest script and the page, so it stays
 * dependency-free and side-effect-free.
 */

/**
 * @template {{ date: string }} T
 * @param {T[]} posts
 * @param {string} monthDay `MM-DD`, from `beijingMonthDay()`
 * @returns {T[]} matches in the order given; empty when the day has none
 */
export function matchesOnThisDay(posts, monthDay) {
  if (!/^\d{2}-\d{2}$/.test(String(monthDay ?? ''))) return [];

  // Feb 29 needs no special case and should not get one. `beijingMonthDay()` only
  // yields `02-29` on a leap day, which is exactly when a leap-day post should
  // resurface; on every other date it simply does not match.
  return posts.filter((post) => post.date.slice(5) === monthDay);
}

/**
 * The fallback for a day with no matches. `random` is injectable so the choice can be
 * pinned in tests.
 *
 * @template T
 * @param {T[]} posts
 * @param {() => number} [random]
 * @returns {T | null}
 */
export function pickRandom(posts, random = Math.random) {
  if (!posts.length) return null;
  return posts[Math.min(posts.length - 1, Math.floor(random() * posts.length))];
}
