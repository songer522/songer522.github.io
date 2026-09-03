import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { excludeCurated, youTubeIdsFrom } from '../src/lib/vlogs';
import { parseVlogs } from '../scripts/lib/vlogs-file.mjs';

const v = (id: string, title: string) => ({ id, title });

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

  it('removes the real overlap in the committed data', () => {
    // day-in-the-life.md mirrors this id, and it is also in the vlog playlist.
    const root = process.cwd();
    const vlogs = parseVlogs(readFileSync(path.join(root, 'src/data/vlogs.ts'), 'utf8'));
    const curated = new Set(['kI9aVHS7jRw']);

    expect(vlogs.some((x) => x.id === 'kI9aVHS7jRw')).toBe(true);
    expect(excludeCurated(vlogs, curated)).toHaveLength(vlogs.length - 1);
  });
});
