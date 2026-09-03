import type { Vlog } from '../data/vlogs';

/** The shape we need off a videos collection entry — kept structural so this file
 *  stays free of `astro:content`, and therefore unit-testable. */
interface HasPlatforms {
  data: { platforms: { platform: string; id: string }[] };
}

/** YouTube ids that appear as a mirror on any entry in the videos collection. */
export function youTubeIdsFrom(videos: HasPlatforms[]): Set<string> {
  return new Set(
    videos.flatMap((video) =>
      video.data.platforms.filter((p) => p.platform === 'youtube').map((p) => p.id),
    ),
  );
}

/**
 * Drop vlogs that are already presented as curated videos.
 *
 * The vlog playlist and the videos collection are maintained separately, so the same
 * upload can end up in both — it then shows twice under two different titles, and two
 * VideoEmbeds for one video would collide if they landed on the same page.
 */
export function excludeCurated(vlogs: Vlog[], curatedIds: Set<string>): Vlog[] {
  return vlogs.filter((vlog) => !curatedIds.has(vlog.id));
}

/**
 * The stored `YYYY-MM-DD` as it is shown under a vlog title: `2024.08.24`.
 *
 * Deliberately the same in both locales, and deliberately not run through Date or
 * toLocaleDateString. These are calendar days typed into a description, not instants —
 * parsing one as a date makes it midnight UTC, which renders as the day before for a
 * reader west of Greenwich. Digits in a fixed order also read the same to both
 * audiences, where 08/24 does not.
 */
export function formatVlogDate(date: string): string {
  return date.replaceAll('-', '.');
}
