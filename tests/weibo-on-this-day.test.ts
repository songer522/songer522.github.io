import { describe, expect, it } from 'vitest';

import { matchesOnThisDay, pickRandom } from '../scripts/lib/weibo-on-this-day.mjs';

const posts = [
  { id: 'a', date: '2010-03-09' },
  { id: 'b', date: '2018-03-09' },
  { id: 'c', date: '2018-03-10' },
  { id: 'd', date: '2012-02-29' },
];

describe('matchesOnThisDay', () => {
  it('finds the same day across every year', () => {
    expect(matchesOnThisDay(posts, '03-09').map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('keeps the order it was given', () => {
    expect(matchesOnThisDay([...posts].reverse(), '03-09').map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('returns nothing for a day with no posts, so the caller can fall back', () => {
    expect(matchesOnThisDay(posts, '07-04')).toEqual([]);
  });

  it('surfaces a leap-day post only on a leap day', () => {
    expect(matchesOnThisDay(posts, '02-29').map((p) => p.id)).toEqual(['d']);
    expect(matchesOnThisDay(posts, '02-28')).toEqual([]);
    expect(matchesOnThisDay(posts, '03-01')).toEqual([]);
  });

  it('ignores anything that is not an MM-DD', () => {
    expect(matchesOnThisDay(posts, '3-9')).toEqual([]);
    expect(matchesOnThisDay(posts, '')).toEqual([]);
    expect(matchesOnThisDay(posts, undefined as unknown as string)).toEqual([]);
  });
});

describe('pickRandom', () => {
  it('picks by the given random value', () => {
    expect(pickRandom(posts, () => 0)?.id).toBe('a');
    expect(pickRandom(posts, () => 0.5)?.id).toBe('c');
  });

  it('stays in bounds when random returns its exclusive upper limit', () => {
    expect(pickRandom(posts, () => 0.999999999)?.id).toBe('d');
    expect(pickRandom(posts, () => 1)?.id).toBe('d');
  });

  it('returns null rather than undefined when there is nothing to pick', () => {
    expect(pickRandom([], () => 0)).toBeNull();
  });
});
