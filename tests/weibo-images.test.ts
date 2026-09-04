import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { imageCandidates, imageSlug } from '../scripts/lib/weibo-images.mjs';

describe('imageCandidates', () => {
  it('turns the old &690 reference into the file that was saved', () => {
    expect(imageCandidates('45fb1888495891bbc9b31&690')).toContain('45fb1888495891bbc9b31_690.jpg');
  });

  it('handles the new reference, whose extension was doubled on download', () => {
    expect(imageCandidates('45fb1888gy1i77k91wprrj20u0140qae.jpg')).toContain(
      '45fb1888gy1i77k91wprrj20u0140qae.jpg.jpg',
    );
  });

  it('offers .gif as well as .jpg, since one animation is stored under the wrong one', () => {
    const candidates = imageCandidates('45fb1888gy1grvjj2vwpog20c806lqlu.gif');

    expect(candidates).toContain('45fb1888gy1grvjj2vwpog20c806lqlu.gif.jpg');
    expect(candidates).toContain('45fb1888gy1grvjj2vwpog20c806lqlu.gif.gif');
  });

  it('includes the reference as named, for an export downloaded without the mangling', () => {
    expect(imageCandidates('45fb1888abc.jpg')).toContain('45fb1888abc.jpg');
  });
});

describe('imageSlug', () => {
  it('drops the extension and normalises the size suffix', () => {
    expect(imageSlug('45fb1888495891bbc9b31&690')).toBe('45fb1888495891bbc9b31_690');
    expect(imageSlug('45fb1888gy1i77k91wprrj20u0140qae.jpg')).toBe(
      '45fb1888gy1i77k91wprrj20u0140qae',
    );
    expect(imageSlug('45fb1888gy1grvjj2vwpog20c806lqlu.gif')).toBe(
      '45fb1888gy1grvjj2vwpog20c806lqlu',
    );
  });

  it('is stable — the same reference always yields the same name', () => {
    const ref = '45fb1888gy1i77k91wprrj20u0140qae.jpg';
    expect(imageSlug(ref)).toBe(imageSlug(ref));
  });
});

// The mapping above was reverse-engineered from one specific export. If that export is
// on this machine, hold the rules to it: every reference must resolve, and no two may
// collide. Skipped elsewhere (CI, a fresh clone) rather than failing.
const EXPORT_DIR = process.env.WEIBO_EXPORT_DIR ?? path.join(os.homedir(), 'Workspace', 'Weibo');
const hasExport =
  existsSync(path.join(EXPORT_DIR, 'weibo-posts.json')) &&
  existsSync(path.join(EXPORT_DIR, 'weibo-images'));

// Vitest runs a describe's callback even when skipIf skips it, so reading the export at
// the top of the block would throw ENOENT on any machine that lacks it (CI, fresh clone)
// instead of skipping. Load lazily inside the tests instead; skipped tests never read.
function loadExport() {
  const posts = JSON.parse(readFileSync(path.join(EXPORT_DIR, 'weibo-posts.json'), 'utf8')).posts;
  const files = new Set(readdirSync(path.join(EXPORT_DIR, 'weibo-images')));
  const refs: string[] = posts.flatMap((post: { p?: string[] }) => post.p ?? []);
  return { files, refs };
}

describe.skipIf(!hasExport)('against the real export', () => {
  it('resolves every image reference to a file on disk', () => {
    const { files, refs } = loadExport();
    const unresolved = refs.filter((ref) => !imageCandidates(ref).some((name) => files.has(name)));

    expect(unresolved).toEqual([]);
  });

  it('gives every reference its own output name', () => {
    const { refs } = loadExport();
    expect(new Set(refs.map(imageSlug)).size).toBe(new Set(refs).size);
  });
});
