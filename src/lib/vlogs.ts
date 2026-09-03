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
