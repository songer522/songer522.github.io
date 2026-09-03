#!/usr/bin/env node
/**
 * Regenerate src/data/vlogs.ts from the YouTube playlist, and fetch thumbnails for
 * any new videos.
 *
 *   npm run sync:vlogs
 *   npm run sync:vlogs -- --dry-run
 *
 * Needs a YouTube Data API v3 key in YOUTUBE_API_KEY (environment, or a .env file
 * in the repo root, which is gitignored). The playlist is unlisted, so it is not
 * available over the RSS feed — the API is the stable way in, and the alternative
 * (scraping ytInitialData) breaks whenever YouTube reshapes its internal JSON.
 *
 * Writes files and stops. It never commits or pushes: this playlist is family
 * video, so a human should see `git diff` before anything reaches a public site.
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import { mergeVlogs } from './lib/merge-vlogs.mjs';
import { parseVlogs, renderVlogs, playlistIdFrom } from './lib/vlogs-file.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_FILE = path.join(ROOT, 'src/data/vlogs.ts');
const THUMB_DIR = path.join(ROOT, 'public/images/vlogs');
const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 270;

const dryRun = process.argv.includes('--dry-run');

/** Minimal .env reader — one variable is not worth a dependency. */
async function loadEnvFile() {
  try {
    const text = await readFile(path.join(ROOT, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // No .env; the variable may still come from the environment.
  }
}

async function fetchPlaylist(playlistId, key) {
  const items = [];
  let pageToken = '';

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,status');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', key);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    const body = await response.json();

    if (!response.ok) {
      const reason = body?.error?.errors?.[0]?.reason ?? '';
      const message = body?.error?.message ?? response.statusText;
      throw new Error(`YouTube API ${response.status} (${reason}): ${message}`);
    }

    for (const item of body.items ?? []) {
      const id = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title ?? '';
      // Videos that were deleted or made private still occupy a playlist slot but
      // carry a placeholder title and no usable thumbnail. Skip rather than publish.
      if (!id || title === 'Deleted video' || title === 'Private video') continue;
      items.push({ id, title });
    }

    pageToken = body.nextPageToken ?? '';
  } while (pageToken);

  return items;
}

async function thumbnailExists(id) {
  try {
    await access(path.join(THUMB_DIR, `${id}.jpg`));
    return true;
  } catch {
    return false;
  }
}

/**
 * hqdefault is 480x360: a 16:9 frame with letterboxing above and below. Trim that
 * back to the picture before resizing, or the bars get baked into the card.
 */
async function fetchThumbnail(id) {
  const response = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  if (!response.ok) throw new Error(`thumbnail ${id}: HTTP ${response.status}`);
  const source = Buffer.from(await response.arrayBuffer());
  const trimmed = await sharp(source).trim({ threshold: 12 }).toBuffer();
  await sharp(trimmed)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(path.join(THUMB_DIR, `${id}.jpg`));
}

async function main() {
  await loadEnvFile();
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error(
      'YOUTUBE_API_KEY is not set.\n' +
        'Create a YouTube Data API v3 key in Google Cloud, then put it in a .env file\n' +
        'at the repo root as:  YOUTUBE_API_KEY=...\n' +
        '(.env is gitignored.)',
    );
    process.exitCode = 1;
    return;
  }

  const source = await readFile(DATA_FILE, 'utf8');
  const existing = parseVlogs(source);
  const { id: playlistId, url: playlistUrl } = playlistIdFrom(source);

  const fetched = await fetchPlaylist(playlistId, key);
  if (fetched.length === 0) throw new Error('the playlist returned no usable videos — refusing to empty the file');

  const { vlogs, added, removed, drifted } = mergeVlogs(existing, fetched);

  console.log(`playlist ${playlistId}: ${fetched.length} videos`);
  console.log(`local file: ${existing.length} -> ${vlogs.length}`);

  for (const v of added) console.log(`  + ${v.id}  ${v.title}`);
  for (const v of removed) console.log(`  - ${v.id}  ${v.title}  (thumbnail left in place)`);
  for (const d of drifted) {
    console.log(`  ~ ${d.id}  title differs — keeping yours`);
    console.log(`      local:  ${d.local}`);
    console.log(`      youtube: ${d.remote}`);
  }

  const missing = [];
  for (const v of vlogs) if (!(await thumbnailExists(v.id))) missing.push(v);

  if (dryRun) {
    console.log(`\ndry run: would write ${DATA_FILE} and fetch ${missing.length} thumbnail(s)`);
    return;
  }

  for (const v of missing) {
    await fetchThumbnail(v.id);
    console.log(`  thumbnail ${v.id}.jpg`);
  }

  await writeFile(DATA_FILE, renderVlogs(vlogs, playlistUrl), 'utf8');

  const changed = added.length || removed.length || missing.length;
  console.log(changed ? '\nDone. Review `git diff`, then commit and push.' : '\nNo changes.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
