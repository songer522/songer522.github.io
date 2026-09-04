#!/usr/bin/env node
/**
 * Build the Weibo archive from a local export.
 *
 *   npm run sync:weibo
 *   npm run sync:weibo -- --dry-run
 *   npm run sync:weibo -- --source ~/Workspace/Weibo --quality 65 --width 800
 *
 * Reads `weibo-posts.json` and `weibo-images/` from the export directory
 * (`--source`, `WEIBO_EXPORT_DIR`, or `~/Workspace/Weibo`) and writes:
 *
 *   src/data/weibo.json        the posts, cleaned and normalised
 *   public/images/weibo/*.webp web-sized derivatives of the photos
 *
 * The 46 MB of originals stay outside the repo. Only the derivatives are committed,
 * which is why the script prints the total it wrote — this is a GitHub Pages user
 * repo, so whatever lands here is in git history for good. Check the number before
 * committing, and turn `--quality` down if it has crept up.
 *
 * Writes files and stops. Like `sync-vlogs.mjs`, it never commits or pushes: a human
 * should read `git diff` before any of this reaches a public site.
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

import { parseWeiboDate } from './lib/weibo-date.mjs';
import { cleanText } from './lib/weibo-text.mjs';
import { imageCandidates, imageSlug } from './lib/weibo-images.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_FILE = path.join(ROOT, 'src/data/weibo.json');
const IMAGE_DIR = path.join(ROOT, 'public/images/weibo');
const PUBLIC_PREFIX = '/images/weibo';

/**
 * The originals top out at 1000px wide, so width is barely a lever here — 800 is
 * roughly card width and leaves most photos untouched. Size is almost entirely a
 * quality decision, and it is spread evenly: the twenty largest files are 13% of the
 * total, so there is nothing to trim except everything at once.
 */
const DEFAULT_WIDTH = 800;
const DEFAULT_QUALITY = 60;
/**
 * A ceiling to notice, not a hard limit — the script warns, it does not refuse. Set
 * just above the ~16.3 MB the current export produces, so drift gets flagged while a
 * clean rerun stays quiet.
 */
const BUDGET_BYTES = 18 * 1024 * 1024;

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const sourceDir = path.resolve(
  arg('source', process.env.WEIBO_EXPORT_DIR ?? path.join(os.homedir(), 'Workspace', 'Weibo')),
);
const maxWidth = Number(arg('width', DEFAULT_WIDTH));
const quality = Number(arg('quality', DEFAULT_QUALITY));

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Resize one image to WebP. Returns the dimensions the browser will see, so the cards
 * can reserve space and the page does not jump as photos stream in.
 */
async function toWebp(input, outPath) {
  // A GIF has to be opened with `animated: true` or sharp keeps only the first frame.
  // The extension is no guide here — one animation in this export is stored under
  // `.jpg` — so ask sharp what the file actually is.
  const probe = await sharp(input).metadata();
  const animated = probe.format === 'gif' && (probe.pages ?? 1) > 1;

  const { data, info } = await sharp(input, { animated })
    // Phone photos carry their orientation in EXIF; bake it in before the resize, or
    // half the archive comes out sideways.
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });

  // For an animated image sharp stacks the frames, so `info.height` is every frame
  // tall. `pageHeight` is the one frame the browser shows.
  const out = await sharp(data, { animated }).metadata();
  const height = out.pageHeight ?? info.height;

  if (!dryRun) await writeFile(outPath, data);

  return { bytes: data.length, width: info.width, height };
}

async function main() {
  const raw = JSON.parse(await readFile(path.join(sourceDir, 'weibo-posts.json'), 'utf8'));
  const available = new Set(await readdir(path.join(sourceDir, 'weibo-images')));

  if (!dryRun) await mkdir(IMAGE_DIR, { recursive: true });

  const existing = new Set(
    await readdir(IMAGE_DIR).catch(() => []),
  );

  const posts = [];
  const unresolved = [];
  const undated = [];
  const lostCovers = [];
  let dropped = 0;
  let bytesWritten = 0;
  let bytesReused = 0;
  let imagesWritten = 0;

  for (const entry of raw.posts) {
    const when = parseWeiboDate(entry.t);
    if (!when) {
      // Better to lose one post than to file it under a date it was not written on.
      undated.push(entry.b);
      continue;
    }

    const images = [];
    for (const ref of entry.p ?? []) {
      const file = imageCandidates(ref).find((name) => available.has(name));
      if (!file) {
        unresolved.push(ref);
        continue;
      }

      const name = `${imageSlug(ref)}.webp`;
      const outPath = path.join(IMAGE_DIR, name);

      let size;
      if (existing.has(name) && !force) {
        // Already built on an earlier run. Read its dimensions back rather than
        // re-encoding 487 photos every time.
        const built = await sharp(outPath).metadata();
        size = { bytes: (await stat(outPath)).size, width: built.width, height: built.pageHeight ?? built.height };
        bytesReused += size.bytes;
      } else {
        size = await toWebp(path.join(sourceDir, 'weibo-images', file), outPath);
        bytesWritten += size.bytes;
        imagesWritten += 1;
      }

      images.push({ src: `${PUBLIC_PREFIX}/${name}`, w: size.width, h: size.height });
    }

    let video;
    if (entry.v?.cover) {
      // The cover lives on sinaimg.cn. Hotlinking it would put the archive at the
      // mercy of a host that is already retiring these — pull it in like the photos.
      const name = `video-${entry.b}.webp`;
      const outPath = path.join(IMAGE_DIR, name);

      try {
        let size;
        if (existing.has(name) && !force) {
          const built = await sharp(outPath).metadata();
          size = { bytes: (await stat(outPath)).size, width: built.width, height: built.height };
          bytesReused += size.bytes;
        } else {
          const response = await fetch(entry.v.cover);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          size = await toWebp(Buffer.from(await response.arrayBuffer()), outPath);
          bytesWritten += size.bytes;
          imagesWritten += 1;
        }
        video = { title: entry.v.title || '', cover: `${PUBLIC_PREFIX}/${name}`, w: size.width, h: size.height };
      } catch (error) {
        // Expected for most of these. 16 of the 28 covers were hosted on Miaopai,
        // whose CDN no longer resolves, and one bilibili URL is a 404 — the video
        // service Weibo used at the time has been retired. The post still has its
        // text and its permalink, so it renders without a cover rather than
        // failing the sync. This is also the argument for downloading the covers
        // that do survive instead of hotlinking them.
        lostCovers.push(`${entry.b} (${new URL(entry.v.cover).hostname})`);
      }
    }

    const text = cleanText(entry.x);
    if (!text && !images.length && !video) {
      // Nothing but a placeholder, and no media behind it. There is no post here.
      dropped += 1;
      continue;
    }

    posts.push({
      id: entry.b,
      date: when.date,
      time: when.time,
      text,
      images,
      ...(video ? { video } : {}),
      reposts: entry.r ?? 0,
      comments: entry.c ?? 0,
      likes: entry.a ?? 0,
    });
  }

  // Newest first, and stable within a day: the export is already in that order, and
  // `time` breaks ties for the days where it is not.
  posts.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const data = { uid: raw.uid, exported: raw.exported, posts };
  if (!dryRun) await writeFile(DATA_FILE, `${JSON.stringify(data, null, 0)}\n`, 'utf8');

  const total = bytesWritten + bytesReused;

  console.log(`${dryRun ? 'Dry run — nothing written.' : 'Wrote src/data/weibo.json'}`);
  console.log(`  source     ${sourceDir}`);
  console.log(`  posts      ${posts.length} kept, ${dropped} empty, ${undated.length} undated`);
  console.log(`  images     ${posts.reduce((n, p) => n + p.images.length, 0)} on posts, ${posts.filter((p) => p.video).length} video covers`);
  console.log(`  encoded    ${imagesWritten} new (${mb(bytesWritten)}), ${existing.size && !force ? `reused ${mb(bytesReused)}` : 'no reuse'}`);
  console.log(`  on disk    ${mb(total)} at width ${maxWidth}, quality ${quality}`);

  if (total > BUDGET_BYTES) {
    console.warn(`  ! over the ${mb(BUDGET_BYTES)} budget — lower --quality or --width and rerun with --force`);
  }
  if (lostCovers.length) {
    const hosts = [...new Set(lostCovers.map((entry) => entry.split('(')[1]?.replace(')', '')))];
    console.log(`  gone       ${lostCovers.length} video covers no longer hosted anywhere (${hosts.join(', ')})`);
  }
  if (unresolved.length) {
    console.warn(`  ! ${unresolved.length} image refs matched no file: ${unresolved.slice(0, 5).join(', ')}`);
  }
  if (undated.length) {
    console.warn(`  ! ${undated.length} posts had an unreadable timestamp: ${undated.slice(0, 5).join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
