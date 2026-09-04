import { describe, expect, it } from 'vitest';

import { buildHeatmap, daysOfYear, levelFor } from '../scripts/lib/weibo-heatmap.mjs';

describe('daysOfYear', () => {
  it('has a cell for every day', () => {
    expect(daysOfYear(2011)).toHaveLength(365);
    expect(daysOfYear(2012)).toHaveLength(366);
    expect(daysOfYear(2100)).toHaveLength(365); // not a leap year, despite the /4
  });

  it('runs from January 1st to December 31st', () => {
    const days = daysOfYear(2010);

    expect(days[0]).toBe('2010-01-01');
    expect(days.at(-1)).toBe('2010-12-31');
  });

  it('includes February 29th only in a leap year', () => {
    expect(daysOfYear(2012)).toContain('2012-02-29');
    expect(daysOfYear(2011)).not.toContain('2011-02-29');
  });
});

describe('levelFor', () => {
  it('leaves an empty day at zero', () => {
    expect(levelFor(0)).toBe(0);
  });

  it('climbs with the count and stops at four', () => {
    expect(levelFor(1)).toBe(1);
    expect(levelFor(2)).toBe(2);
    expect(levelFor(3)).toBe(3);
    expect(levelFor(4)).toBe(3);
    expect(levelFor(5)).toBe(4);
    expect(levelFor(40)).toBe(4);
  });
});

describe('buildHeatmap', () => {
  const posts = [
    { date: '2010-01-01' },
    { date: '2010-01-01' },
    { date: '2010-06-15' },
    { date: '2011-03-02' },
  ];

  it('counts only the year asked for', () => {
    expect(buildHeatmap(posts, 2010).total).toBe(3);
    expect(buildHeatmap(posts, 2011).total).toBe(1);
  });

  it('puts each post on its own day', () => {
    const days = buildHeatmap(posts, 2010).days;

    expect(days.find((d) => d.date === '2010-01-01')).toMatchObject({ count: 2, level: 2 });
    expect(days.find((d) => d.date === '2010-06-15')).toMatchObject({ count: 1, level: 1 });
    expect(days.find((d) => d.date === '2010-06-16')).toMatchObject({ count: 0, level: 0 });
  });

  it('gives a year with no posts a full, empty grid', () => {
    const grid = buildHeatmap(posts, 2017);

    expect(grid.total).toBe(0);
    expect(grid.days).toHaveLength(365);
    expect(grid.days.every((day) => day.level === 0)).toBe(true);
  });

  it('pads the first column so every row is a fixed weekday', () => {
    // 2010-01-01 was a Friday, so five blanks come before it in a Sunday-first grid.
    expect(buildHeatmap(posts, 2010).leadingBlanks).toBe(5);
    // 2012-01-01 was a Sunday — the grid starts flush.
    expect(buildHeatmap(posts, 2012).leadingBlanks).toBe(0);
  });

  it('keeps the grid a whole number of weeks or fewer', () => {
    for (const year of [2009, 2010, 2011, 2012, 2025]) {
      const grid = buildHeatmap(posts, year);
      expect(grid.leadingBlanks + grid.days.length).toBeLessThanOrEqual(53 * 7);
    }
  });
});
