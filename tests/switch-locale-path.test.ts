import { describe, expect, it } from 'vitest';
import { switchLocalePath } from '../src/i18n/utils';
import type { Locale } from '../src/i18n/ui';

const cases: Array<{ input: string; to: Locale; expected: string }> = [
  { input: '/', to: 'en', expected: '/en/' },
  { input: '/en/', to: 'zh', expected: '/' },
  { input: '/apps/', to: 'en', expected: '/en/apps/' },
  { input: '/en/apps/', to: 'zh', expected: '/apps/' },
  { input: '/apps/foo/', to: 'en', expected: '/en/apps/foo/' },
  { input: '/en/apps/foo/', to: 'zh', expected: '/apps/foo/' },
  { input: '/en', to: 'zh', expected: '/' },
];

describe('switchLocalePath', () => {
  for (const { input, to, expected } of cases) {
    it(`${input} -> ${to} === ${expected}`, () => {
      expect(switchLocalePath(input, to)).toBe(expected);
    });
  }

  // Round-trip property, over canonical (trailing-slash) paths only — '/en' (no
  // trailing slash) normalizes to '/en/' on the way back, which is the fiddly case
  // called out in PLAN.md and covered by its own exact-match case above instead.
  const canonicalPaths = ['/', '/en/', '/apps/', '/en/apps/', '/apps/foo/', '/en/apps/foo/'];

  for (const p of canonicalPaths) {
    it(`round-trips: switching ${p} away and back returns the original`, () => {
      const to: Locale = p.startsWith('/en') ? 'zh' : 'en';
      const from: Locale = to === 'en' ? 'zh' : 'en';
      const switched = switchLocalePath(p, to);
      expect(switchLocalePath(switched, from)).toBe(p);
    });
  }
});
