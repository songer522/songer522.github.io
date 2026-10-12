import { describe, expect, it } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

import { book } from '../src/data/book';
import { ui } from '../src/i18n/ui';

/**
 * The book is hand-kept data, so the two things that can quietly go wrong are a path
 * nobody typed quite right and a size that drifted from the file. Both are checkable
 * without a browser: a download button that 404s is the one failure a reader notices.
 */
describe('the book', () => {
  it('links files that are actually in public/', () => {
    for (const file of book.files) {
      const disk = path.join(process.cwd(), 'public', file.path);

      expect(existsSync(disk), `${file.path} is missing from public/`).toBe(true);
      // A 0-byte placeholder would pass existsSync, so check it has bulk.
      expect(statSync(disk).size, `${file.path} is empty`).toBeGreaterThan(1_000_000);
    }
  });

  it('states a size that matches the file on disk', () => {
    for (const file of book.files) {
      const bytes = statSync(path.join(process.cwd(), 'public', file.path)).size;
      const stated = Number.parseFloat(file.size);

      // Stated to one decimal in MB, so half a meg of slack is rounding, not drift.
      expect(Math.abs(bytes / 1_000_000 - stated), `${file.path} is ${file.size}`).toBeLessThan(
        0.1,
      );
    }
  });

  it('lists every format exactly once', () => {
    const formats = book.files.map((file) => file.format);

    expect(new Set(formats).size).toBe(formats.length);
  });

  it('has copy in both locales', () => {
    expect(Object.keys(book.copy).sort()).toEqual(['en', 'zh']);

    for (const copy of Object.values(book.copy)) {
      for (const field of ['meta', 'summary'] as const) {
        expect(copy[field].trim(), `${field} is empty`).not.toBe('');
      }
    }
  });

  it('has a download label in both locales', () => {
    // `t` falls back to Chinese, so a key missing from English would silently ship
    // Chinese buttons — assert both locales really carry it.
    for (const locale of ['zh', 'en'] as const) {
      expect(ui[locale]['book.download'].includes('{format}'), `${locale} lacks the label`).toBe(
        true,
      );
    }
  });

  it('keeps the title in Chinese on both sites', () => {
    // The book is Chinese and stays Chinese; only the chrome around it translates.
    expect(book.title).toMatch(/通稿/);
    expect(book.cover).toBe('/images/book/tonggao.png');
    expect(existsSync(path.join(process.cwd(), 'public', book.cover))).toBe(true);
  });
});