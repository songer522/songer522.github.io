import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import path from 'node:path';

const collections = ['apps', 'videos'];

function slugsIn(collection: string, locale: string): string[] {
  const dir = path.join(process.cwd(), 'src', 'content', collection, locale);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

describe('locale parity', () => {
  for (const collection of collections) {
    it(`${collection}: every zh slug has an en counterpart and vice versa`, () => {
      const zhSlugs = slugsIn(collection, 'zh');
      const enSlugs = slugsIn(collection, 'en');
      expect(zhSlugs).toEqual(enSlugs);
    });
  }
});
