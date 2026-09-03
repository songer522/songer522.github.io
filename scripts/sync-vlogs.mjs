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
import { readFile, writeFile, access, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

import { mergeVlogs, resolveUnavailable } from './lib/merge-vlogs.mjs';
import { parseVlogDate, sortByDate } from './lib/vlog-date.mjs';
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
    // Split on CRLF as well as LF. JavaScript's `.` does not match \r, so a CRLF file
    // would otherwise fail this regex outright and the key would look simply absent.
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, '').trim();
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
    // Parse defensively: an error response is not always JSON (proxies and rate
    // limiters return HTML), and a SyntaxError here would hide the real status.
    const raw = await response.text();
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }

    if (!response.ok || body === null) {
      const reason = body?.error?.errors?.[0]?.reason ?? '';
      const message = body?.error?.message ?? (raw.slice(0, 200) || response.statusText);
      throw new Error(`YouTube API ${response.status} (${reason}): ${message}`);
    }

    for (const item of body.items ?? []) {
      const id = item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title ?? '';
      if (!id) continue;
      // Deleted and private videos keep their playlist slot but carry a placeholder
      // title and no usable thumbnail. Flag rather than drop, so resolveUnavailable
      // can tell them apart from a video actually removed from the playlist.
      const unavailable = title === 'Deleted video' || title === 'Private video';
      const date = parseVlogDate(item.snippet?.description) ?? undefined;
      items.push({ id, title, date, unavailable });
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

  const raw = await fetchPlaylist(playlistId, key);
  const { items: fetched, held } = resolveUnavailable(raw, existing);
  if (fetched.length === 0) throw new Error('the playlist returned no usable videos — refusing to empty the file');

  const merged = mergeVlogs(existing, fetched);
  const { added, removed, drifted, redated } = merged;
  const vlogs = sortByDate(merged.vlogs);

  console.log(`playlist ${playlistId}: ${fetched.length} videos`);
  console.log(`local file: ${existing.length} -> ${vlogs.length}`);

  const undated = vlogs.filter((v) => !v.date);
  if (undated.length) {
    console.log(`\n${undated.length} video(s) have no \`Date:\` line in the description, so they`);
    console.log('sort to the end of the list:');
    for (const v of undated) console.log(`  ?  ${v.id}  ${v.title}`);
    console.log('');
  }

  for (const v of added) console.log(`  + ${v.id}  ${v.date ?? 'no date'}  ${v.title}`);
  for (const v of removed) console.log(`  - ${v.id}  ${v.title}`);
  for (const d of redated) {
    console.log(`  @ ${d.id}  date ${d.from ?? 'none'} -> ${d.to}  ${d.title}`);
  }
  for (const id of held) {
    console.log(`  ?  ${id}  deleted or private on YouTube — entry and title kept`);
  }
  for (const d of drifted) {
    console.log(`  ~ ${d.id}  title differs — keeping yours`);
    console.log(`      local:  ${d.local}`);
    console.log(`      youtube: ${d.remote}`);
  }

  const missing = [];
  for (const v of vlogs) if (!(await thumbnailExists(v.id))) missing.push(v);

  if (dryRun) {
    console.log(`\ndry run: would write ${DATA_FILE}, fetch ${missing.length} thumbnail(s)`);
    if (removed.length) console.log(`         and delete ${removed.length} thumbnail(s)`);
    return;
  }

  // Failures are collected rather than thrown, so one bad fetch does not abort the run
  // and leave the data file unwritten. What happens next depends on whether the entry
  // is new — see below.
  const addedIds = new Set(added.map((v) => v.id));
  const failed = new Set();
  for (const v of missing) {
    try {
      await fetchThumbnail(v.id);
      console.log(`  thumbnail ${v.id}.jpg`);
    } catch (error) {
      // Only a new entry may be dropped. Dropping an existing one would remove it from
      // the file, and the next run would re-add it under YouTube's title — quietly
      // reverting a title edited here for privacy.
      if (addedIds.has(v.id)) {
        failed.add(v.id);
        console.log(`  !  ${v.id}  thumbnail failed, new entry skipped — ${error.message}`);
      } else {
        console.log(`  !  ${v.id}  thumbnail failed, entry kept without image — ${error.message}`);
      }
    }
  }

  // Delete thumbnails for videos that left the playlist. Leaving them behind means a
  // video pulled *because* it should not be public stays publicly served at a
  // guessable URL, which defeats the point of removing it.
  for (const v of removed) {
    try {
      await unlink(path.join(THUMB_DIR, `${v.id}.jpg`));
      console.log(`  deleted thumbnail ${v.id}.jpg`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`  !  ${v.id}  could not delete thumbnail — ${error.message}`);
      }
    }
  }

  const kept = vlogs.filter((v) => !failed.has(v.id));
  await writeFile(DATA_FILE, renderVlogs(kept, playlistUrl), 'utf8');

  if (failed.size) {
    console.log(`\n${failed.size} new entr(y/ies) skipped for missing thumbnails — re-run to retry.`);
  }
  const changed = added.length || removed.length || missing.length;
  console.log(changed ? '\nDone. Review `git diff`, then commit and push.' : '\nNo changes.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
