import { describe, expect, it } from 'vitest';

import { parseWeiboDate, beijingMonthDay } from '../scripts/lib/weibo-date.mjs';

describe('parseWeiboDate', () => {
  it('reads the format the export uses', () => {
    expect(parseWeiboDate('Mon Nov 10 23:59:36 +0800 2025')).toEqual({
      date: '2025-11-10',
      time: '23:59',
    });
  });

  it('keeps a late-night post on the day it was written', () => {
    // The whole point of normalising to Beijing: 23:59 must not become tomorrow.
    expect(parseWeiboDate('Sat Mar 09 23:59:00 +0800 2010')?.date).toBe('2010-03-09');
    expect(parseWeiboDate('Sat Mar 09 00:00:00 +0800 2010')?.date).toBe('2010-03-09');
  });

  it('does not move with the machine running it', () => {
    const original = process.env.TZ;
    const seen = new Set<string>();

    for (const tz of ['UTC', 'America/Chicago', 'Pacific/Kiritimati', 'Asia/Shanghai']) {
      process.env.TZ = tz;
      seen.add(JSON.stringify(parseWeiboDate('Mon Nov 10 23:59:36 +0800 2025')));
    }

    process.env.TZ = original;
    expect(seen.size).toBe(1);
  });

  it('converts a stamp that is not already Beijing time', () => {
    // No post in this export carries another offset, but the parser should not be the
    // reason a future one is read wrong.
    expect(parseWeiboDate('Mon Nov 10 12:00:00 +0000 2025')).toEqual({
      date: '2025-11-10',
      time: '20:00',
    });
    expect(parseWeiboDate('Mon Nov 10 20:00:00 -0500 2025')).toEqual({
      date: '2025-11-11',
      time: '09:00',
    });
  });

  it('pads a single-digit day', () => {
    expect(parseWeiboDate('Tue Jan 5 08:04:00 +0800 2010')).toEqual({
      date: '2010-01-05',
      time: '08:04',
    });
  });

  it('reads every month name', () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    months.forEach((name, index) => {
      expect(parseWeiboDate(`Mon ${name} 15 12:00:00 +0800 2015`)?.date).toBe(
        `2015-${String(index + 1).padStart(2, '0')}-15`,
      );
    });
  });

  it('returns null for a malformed stamp', () => {
    expect(parseWeiboDate('')).toBeNull();
    expect(parseWeiboDate(undefined)).toBeNull();
    expect(parseWeiboDate('2025-11-10 23:59:36')).toBeNull();
    expect(parseWeiboDate('Mon Xxx 10 23:59:36 +0800 2025')).toBeNull();
    expect(parseWeiboDate('Mon Nov 10 23:59:36 2025')).toBeNull();
  });

  it('rejects a time that is not a time rather than rolling it over', () => {
    expect(parseWeiboDate('Mon Nov 10 24:00:00 +0800 2025')).toBeNull();
    expect(parseWeiboDate('Mon Nov 10 23:60:00 +0800 2025')).toBeNull();
    expect(parseWeiboDate('Mon Nov 10 23:59:99 +0800 2025')).toBeNull();
  });

  it('rejects a day that is in range but not on the calendar', () => {
    expect(parseWeiboDate('Mon Feb 31 12:00:00 +0800 2025')).toBeNull();
    expect(parseWeiboDate('Mon Apr 31 12:00:00 +0800 2025')).toBeNull();
  });

  it('knows which Februaries have a 29th', () => {
    expect(parseWeiboDate('Wed Feb 29 12:00:00 +0800 2012')?.date).toBe('2012-02-29');
    expect(parseWeiboDate('Wed Feb 29 12:00:00 +0800 2011')).toBeNull();
  });
});

describe('beijingMonthDay', () => {
  it('reports the Beijing day, not the host machine day', () => {
    // 2026-03-09 18:00 UTC is already 2026-03-10 in Beijing.
    expect(beijingMonthDay(new Date('2026-03-09T18:00:00Z'))).toBe('03-10');
    expect(beijingMonthDay(new Date('2026-03-09T10:00:00Z'))).toBe('03-09');
  });

  it('yields 02-29 only on a leap day', () => {
    expect(beijingMonthDay(new Date('2024-02-29T04:00:00Z'))).toBe('02-29');
    expect(beijingMonthDay(new Date('2025-02-28T04:00:00Z'))).toBe('02-28');
  });

  it('always returns MM-DD', () => {
    expect(beijingMonthDay(new Date('2026-01-01T04:00:00Z'))).toBe('01-01');
    expect(beijingMonthDay(new Date('2026-12-31T04:00:00Z'))).toBe('12-31');
  });
});
