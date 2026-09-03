import { describe, expect, it } from 'vitest';
import { mergeVlogs } from '../scripts/lib/merge-vlogs.mjs';

const v = (id: string, title: string) => ({ id, title });

describe('mergeVlogs', () => {
  it('adds videos that are new to the playlist', () => {
    const result = mergeVlogs([v('a', 'A')], [v('a', 'A'), v('b', 'B')]);

    expect(result.vlogs).toEqual([v('a', 'A'), v('b', 'B')]);
    expect(result.added).toEqual([v('b', 'B')]);
  });

  it('keeps a locally edited title instead of overwriting it from YouTube', () => {
    const result = mergeVlogs([v('a', '芝加哥街头漫步')], [v('a', '🎡🏇🏽🎶 raw yt title')]);

    expect(result.vlogs).toEqual([v('a', '芝加哥街头漫步')]);
    expect(result.added).toEqual([]);
  });

  it('reports a drifted title rather than acting on it', () => {
    const result = mergeVlogs([v('a', 'my title')], [v('a', 'their title')]);

    expect(result.drifted).toEqual([{ id: 'a', local: 'my title', remote: 'their title' }]);
  });

  it('does not report drift when the titles still agree', () => {
    expect(mergeVlogs([v('a', 'same')], [v('a', 'same')]).drifted).toEqual([]);
  });

  it('drops videos that have left the playlist, and reports them', () => {
    const result = mergeVlogs([v('a', 'A'), v('gone', 'Gone')], [v('a', 'A')]);

    expect(result.vlogs).toEqual([v('a', 'A')]);
    expect(result.removed).toEqual([v('gone', 'Gone')]);
  });

  it('follows playlist order, not the order of the existing file', () => {
    const result = mergeVlogs([v('b', 'B'), v('a', 'A')], [v('a', 'A'), v('b', 'B')]);

    expect(result.vlogs.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('handles a first run against an empty file', () => {
    const result = mergeVlogs([], [v('a', 'A')]);

    expect(result.vlogs).toEqual([v('a', 'A')]);
    expect(result.added).toEqual([v('a', 'A')]);
    expect(result.removed).toEqual([]);
  });

  it('keeps only the first of a duplicated playlist entry', () => {
    // YouTube allows the same video to sit in a playlist twice.
    const result = mergeVlogs([], [v('a', 'A'), v('b', 'B'), v('a', 'A again')]);

    expect(result.vlogs).toEqual([v('a', 'A'), v('b', 'B')]);
    expect(result.added).toEqual([v('a', 'A'), v('b', 'B')]);
  });

  it('does not re-add a duplicate that already exists locally', () => {
    const result = mergeVlogs([v('a', 'mine')], [v('a', 'theirs'), v('a', 'theirs')]);

    expect(result.vlogs).toEqual([v('a', 'mine')]);
    expect(result.drifted).toHaveLength(1);
  });

  it('reports no changes when nothing moved', () => {
    const existing = [v('a', 'A'), v('b', 'B')];
    const result = mergeVlogs(existing, existing);

    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.drifted).toEqual([]);
  });
});
