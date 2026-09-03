/**
 * Read and write src/data/vlogs.ts.
 *
 * The file is generated, but it is also hand-editable — titles in it are meant to
 * survive a sync. So parsing is deliberately strict: an entry shaped in a way we do
 * not recognise stops the sync rather than being quietly rewritten away.
 */

const HEADER = `// Videos from the unlisted "Vlog" YouTube playlist, in playlist order.
// Upload dates are not shown: most of these were uploaded in one batch, so the
// upload date says nothing about when the thing filmed actually happened
// ("2024 Disney Day 1" was uploaded in 2025).
//
// Regenerate with \`npm run sync:vlogs\`. Titles here are intentionally sticky: the
// sync never overwrites one you have edited, it only reports that it has drifted.
export interface Vlog {
  id: string;
  title: string;
}

export const playlistUrl =
  '__PLAYLIST_URL__';

export const vlogs: Vlog[] = [
`;

const escapeTitle = (title) => title.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const unescapeTitle = (title) => title.replace(/\\(['\\])/g, '$1');

/** Pull the playlist id out of the committed playlistUrl, so it lives in one place. */
export function playlistIdFrom(source) {
  const url = source.match(/playlistUrl\s*=\s*\n?\s*'([^']+)'/)?.[1];
  if (!url) throw new Error('could not find playlistUrl in src/data/vlogs.ts');
  const id = new URL(url).searchParams.get('list');
  if (!id) throw new Error(`playlistUrl has no ?list= parameter: ${url}`);
  return { url, id };
}

export function parseVlogs(source) {
  const body = source.match(/export const vlogs: Vlog\[\] = \[([\s\S]*?)\n\];/)?.[1];
  if (body === undefined) throw new Error('could not find the vlogs array in src/data/vlogs.ts');

  const entries = [];
  for (const line of body.split('\n')) {
    if (!line.trim()) continue;
    const match = line.match(/^\s*\{ id: '([^']+)', title: '(.*)' \},\s*$/);
    if (!match) throw new Error(`unrecognised entry in src/data/vlogs.ts: ${line.trim()}`);
    entries.push({ id: match[1], title: unescapeTitle(match[2]) });
  }
  return entries;
}

export function renderVlogs(vlogs, playlistUrl) {
  const lines = vlogs.map((v) => `  { id: '${v.id}', title: '${escapeTitle(v.title)}' },`);
  return HEADER.replace('__PLAYLIST_URL__', playlistUrl) + lines.join('\n') + '\n];\n';
}
