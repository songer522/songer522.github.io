import { describe, expect, it } from 'vitest';

import { parseVlogDate, sortByDate } from '../scripts/lib/vlog-date.mjs';

describe('parseVlogDate', () => {
  it('reads the date line', () => {
    expect(parseVlogDate('Date: 2024.08.24')).toBe('2024-08-24');
  });

  it('pads a single-digit month and day', () => {
    expect(parseVlogDate('Date: 2024.3.7')).toBe('2024-03-07');
  });

  it('tolerates the stray space in the one description that has it', () => {
    expect(parseVlogDate('Date: 2024. 03.22')).toBe('2024-03-22');
  });

  it('accepts dashes and slashes as separators', () => {
    expect(parseVlogDate('Date: 2024-08-24')).toBe('2024-08-24');
    expect(parseVlogDate('Date: 2024/08/24')).toBe('2024-08-24');
  });

  it('finds the line among other description text', () => {
    expect(parseVlogDate('A day out.\n\nDate: 2023.11.02\nShot on iPhone')).toBe('2023-11-02');
  });

  it('returns null when there is no date line', () => {
    expect(parseVlogDate('')).toBeNull();
    expect(parseVlogDate('no date here')).toBeNull();
    expect(parseVlogDate(undefined)).toBeNull();
  });

  it('rejects an impossible date rather than rolling it over', () => {
    expect(parseVlogDate('Date: 2024.13.01')).toBeNull();
    expect(parseVlogDate('Date: 2024.02.32')).toBeNull();
    expect(parseVlogDate('Date: 2024.00.10')).toBeNull();
    expect(parseVlogDate('Date: 2024.05.00')).toBeNull();
  });

  it('rejects a day that is in range but not in that month', () => {
    expect(parseVlogDate('Date: 2024.02.31')).toBeNull();
    expect(parseVlogDate('Date: 2024.04.31')).toBeNull();
    expect(parseVlogDate('Date: 2024.06.31')).toBeNull();
  });

  it('knows which Februaries have a 29th', () => {
    expect(parseVlogDate('Date: 2024.02.29')).toBe('2024-02-29');
    expect(parseVlogDate('Date: 2000.02.29')).toBe('2000-02-29');
    expect(parseVlogDate('Date: 2023.02.29')).toBeNull();
    expect(parseVlogDate('Date: 1900.02.29')).toBeNull();
  });

  it('keeps the last day of the months that have 30 and 31', () => {
    expect(parseVlogDate('Date: 2024.04.30')).toBe('2024-04-30');
    expect(parseVlogDate('Date: 2024.12.31')).toBe('2024-12-31');
  });
});

describe('sortByDate', () => {
  const v = (id: string, date?: string) => ({ id, title: id, date });

  it('puts the newest first', () => {
    const sorted = sortByDate([v('a', '2023-01-01'), v('b', '2025-06-01'), v('c', '2024-02-02')]);

    expect(sorted.map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });

  it('keeps same-day videos in the order they came in', () => {
    const sorted = sortByDate([v('a', '2024-01-01'), v('b', '2024-01-01')]);

    expect(sorted.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('sends undated entries to the end, in their original order', () => {
    const sorted = sortByDate([v('a'), v('b', '2024-01-01'), v('c')]);

    expect(sorted.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('leaves the input array alone', () => {
    const input = [v('a', '2023-01-01'), v('b', '2025-01-01')];

    sortByDate(input);

    expect(input.map((x) => x.id)).toEqual(['a', 'b']);
  });
});
