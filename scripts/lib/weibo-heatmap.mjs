/**
 * The per-year day grid, in the shape the blog archive uses: one cell per day, seven
 * rows, weeks running left to right.
 *
 * The grid is laid out with `grid-auto-flow: column` over seven rows, so the browser
 * fills it column by column all on its own. All this module has to get right is how
 * many blank cells come before January 1st, so that every row is a fixed weekday.
 */

/** Sunday-first, matching the convention the blog grid already reads in. */
const WEEK_STARTS_ON_SUNDAY = true;

/**
 * Post counts are small and we want a 2010 cell and a 2023 cell to mean the same
 * thing, so the buckets are absolute rather than scaled to each year's own maximum.
 * Scaling per year would paint a one-post day in a quiet year as darkly as a
 * five-post day in a busy one.
 *
 * @param {number} count
 * @returns {0 | 1 | 2 | 3 | 4}
 */
export function levelFor(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

/**
 * Every day in a year as `YYYY-MM-DD`, in order. 365 days, 366 in a leap year.
 *
 * @param {number} year
 * @returns {string[]}
 */
export function daysOfYear(year) {
  const days = [];
  const pad = (n) => String(n).padStart(2, '0');

  // Step in UTC. Stepping a local Date would lose or repeat a day in any timezone
  // with daylight saving, which would silently shorten the grid.
  for (
    let day = new Date(Date.UTC(year, 0, 1));
    day.getUTCFullYear() === year;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    days.push(`${year}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`);
  }

  return days;
}

/**
 * @param {{ date: string }[]} posts every post, any year
 * @param {number} year
 * @returns {{ year: number, leadingBlanks: number, total: number,
 *            days: { date: string, count: number, level: number }[] }}
 */
export function buildHeatmap(posts, year) {
  const counts = new Map();
  for (const post of posts) {
    if (Number(post.date.slice(0, 4)) !== year) continue;
    counts.set(post.date, (counts.get(post.date) ?? 0) + 1);
  }

  const days = daysOfYear(year).map((date) => {
    const count = counts.get(date) ?? 0;
    return { date, count, level: levelFor(count) };
  });

  const firstWeekday = new Date(Date.UTC(year, 0, 1)).getUTCDay();

  return {
    year,
    leadingBlanks: WEEK_STARTS_ON_SUNDAY ? firstWeekday : (firstWeekday + 6) % 7,
    total: days.reduce((sum, day) => sum + day.count, 0),
    days,
  };
}
