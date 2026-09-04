/**
 * Weibo stamps a post with `Mon Nov 10 23:59:36 +0800 2025` — the classic
 * Twitter-era format, offset included.
 *
 * Every timestamp in the export carries `+0800`, and Beijing wall-clock time is what
 * we want to keep: the archive shows the date Yang actually wrote the post, and the
 * "on this day" match has to mean the same thing whether you read it from Chicago or
 * Shanghai. So we normalise to +0800 and store plain strings. Nothing downstream ever
 * builds a Date, which is what keeps the page free of timezone bugs.
 *
 * We do not hand the string to `new Date()`. V8 happens to parse this shape, but it is
 * outside the spec — it is left to the implementation, and a rolled-over `Feb 31`
 * would come back as a confident March date rather than an error.
 */

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const STAMP =
  /^[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})\s+([+-])(\d{2})(\d{2})\s+(\d{4})$/;

const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * @param {string | null | undefined} stamp e.g. `Mon Nov 10 23:59:36 +0800 2025`
 * @returns {{ date: string, time: string } | null} Beijing `YYYY-MM-DD` and `HH:MM`,
 *   or null when the stamp is malformed or names a day that does not exist.
 */
export function parseWeiboDate(stamp) {
  const match = String(stamp ?? '').trim().match(STAMP);
  if (!match) return null;

  const [, monthName, day, hour, minute, second, sign, offsetHour, offsetMinute, year] = match;

  const month = MONTHS[monthName];
  if (month === undefined) return null;

  // `\d{2}` in the regex admits 99:99:99, and Date.UTC would quietly roll that into
  // the next day. Reject it here instead.
  if (+hour > 23 || +minute > 59 || +second > 59) return null;

  // Same rollover trap for the calendar: Feb 31 is in range for every field and still
  // not a day. Build the date, then require every field to survive the round trip —
  // that gets month lengths and leap years for free.
  const asUtc = new Date(Date.UTC(+year, month, +day));
  if (asUtc.getUTCFullYear() !== +year || asUtc.getUTCMonth() !== month || asUtc.getUTCDate() !== +day) {
    return null;
  }

  const offsetMs = (sign === '-' ? -1 : 1) * (+offsetHour * 60 + +offsetMinute) * 60 * 1000;
  // Shift to real UTC, then into Beijing. When the stamp already reads +0800 — as all
  // 1,223 of them do — this is a round trip and the wall clock comes out unchanged.
  const beijing = new Date(
    Date.UTC(+year, month, +day, +hour, +minute, +second) - offsetMs + BEIJING_OFFSET_MS,
  );

  const pad = (n) => String(n).padStart(2, '0');

  return {
    date: `${beijing.getUTCFullYear()}-${pad(beijing.getUTCMonth() + 1)}-${pad(beijing.getUTCDate())}`,
    time: `${pad(beijing.getUTCHours())}:${pad(beijing.getUTCMinutes())}`,
  };
}

/**
 * Today's `MM-DD` in Beijing. Shared by the ingest script and the browser, so it leans
 * on Intl rather than on the host's own timezone.
 *
 * @param {Date} [now]
 * @returns {string} e.g. `03-09`
 */
export function beijingMonthDay(now = new Date()) {
  // en-CA gives ISO order (`2026-03-09`), which is why it is the usual choice here.
  const iso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  return iso.slice(5);
}
