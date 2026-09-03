import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { excludeCurated, formatVlogDate, youTubeIdsFrom } from '../src/lib/vlogs';
import { parseVlogs } from '../scripts/lib/vlogs-file.mjs';

const v = (id: string, title: string) => ({ id, title });

/** The youtube mirrors named by the videos collection, read straight off the markdown. */
function curatedYouTubeIds(dir: string): Set<string> {
  const ids = readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .flatMap((f) => [...readFileSync(path.join(dir, f), 'utf8').matchAll(/platform: youtube, id: (\S+?) \}/g)])
    .map((m) => m[1]);
  return new Set(ids);
}

describe('youTubeIdsFrom', () => {
  it('collects only the youtube mirrors', () => {
    const videos = [
      { data: { platforms: [{ platform: 'youtube', id: 'yt1' }, { platform: 'bilibili', id: 'BV1' }] } },
      { data: { platforms: [{ platform: 'bilibili', id: 'BV2' }] } },
    ];

    expect(youTubeIdsFrom(videos)).toEqual(new Set(['yt1']));
  });

  it('is empty when nothing is mirrored on youtube', () => {
    expect(youTubeIdsFrom([{ data: { platforms: [] } }])).toEqual(new Set());
  });
});

describe('excludeCurated', () => {
  it('drops a vlog that is also a curated video', () => {
    const result = excludeCurated([v('a', 'A'), v('b', 'B')], new Set(['b']));

    expect(result).toEqual([v('a', 'A')]);
  });

  it('leaves the list alone when nothing overlaps', () => {
    const vlogs = [v('a', 'A'), v('b', 'B')];

    expect(excludeCurated(vlogs, new Set(['zzz']))).toEqual(vlogs);
  });

  it('handles an empty curated set', () => {
    const vlogs = [v('a', 'A')];

    expect(excludeCurated(vlogs, new Set())).toEqual(vlogs);
  });

  it('drops whatever the committed data actually has in both places', () => {
    // Derived rather than hard-coded: the two lists are edited independently, so an
    // overlap can appear or disappear with any content change. Today there is none.
    const root = process.cwd();
    const vlogs = parseVlogs(readFileSync(path.join(root, 'src/data/vlogs.ts'), 'utf8'));
    const curated = curatedYouTubeIds(path.join(root, 'src/content/videos/zh'));
    const overlap = vlogs.filter((x) => curated.has(x.id));

    const kept = excludeCurated(vlogs, curated);

    expect(kept).toHaveLength(vlogs.length - overlap.length);
    expect(kept.some((x) => curated.has(x.id))).toBe(false);
  });
});

describe('formatVlogDate', () => {
  it('renders the stored date the way the descriptions write it', () => {
    expect(formatVlogDate('2024-08-24')).toBe('2024.08.24');
  });

  it('keeps the leading zeroes, so the column stays aligned', () => {
    expect(formatVlogDate('2024-03-07')).toBe('2024.03.07');
  });
});
