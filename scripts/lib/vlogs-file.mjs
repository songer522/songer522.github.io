/**
 * Read and write src/data/vlogs.ts.
 *
 * The file is generated, but it is also hand-editable — titles in it are meant to
 * survive a sync. So parsing is deliberately strict: an entry shaped in a way we do
 * not recognise stops the sync rather than being quietly rewritten away.
 */

const HEADER = `// Videos from the unlisted "Vlog" YouTube playlist, newest first by filming date.
//
// That date comes from the video's YouTube description, which reads \`Date: 2024.08.24\`.
// The upload date is no use for ordering: most of these went up in one batch, so it
// says nothing about when the thing filmed actually happened ("2024 Disney Day 1" was
// uploaded in 2025).
//
// Regenerate with \`npm run sync:vlogs\`. Titles here are intentionally sticky: the
// sync never overwrites one you have edited, it only reports that it has drifted.
// Dates are not — they track the description, which is where you edit them.
export interface Vlog {
  id: string;
  title: string;
  /** YYYY-MM-DD, absent when the description carries no usable \`Date:\` line. */
  date?: string;
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

// The date is optional in the line shape as well as in the type: a video whose
// description has no usable `Date:` line still belongs in the file, just unsorted at
// the end rather than dropped.
const ENTRY = /^\s*\{ id: '([^']+)', title: '(.*?)'(?:, date: '(\d{4}-\d{2}-\d{2})')? \},\s*$/;

/**
 * @param {string} source the contents of src/data/vlogs.ts
 * @returns {{ id: string, title: string, date?: string }[]}
 */
export function parseVlogs(source) {
  const body = source.match(/export const vlogs: Vlog\[\] = \[([\s\S]*?)\n\];/)?.[1];
  if (body === undefined) throw new Error('could not find the vlogs array in src/data/vlogs.ts');

  const entries = [];
  for (const line of body.split('\n')) {
    if (!line.trim()) continue;
    const match = line.match(ENTRY);
    if (!match) throw new Error(`unrecognised entry in src/data/vlogs.ts: ${line.trim()}`);
    const entry = { id: match[1], title: unescapeTitle(match[2]) };
    if (match[3]) entry.date = match[3];
    entries.push(entry);
  }
  return entries;
}

/**
 * @param {{ id: string, title: string, date?: string }[]} vlogs
 * @param {string} playlistUrl
 */
export function renderVlogs(vlogs, playlistUrl) {
  const lines = vlogs.map((v) => {
    const date = v.date ? `, date: '${v.date}'` : '';
    return `  { id: '${v.id}', title: '${escapeTitle(v.title)}'${date} },`;
  });
  return HEADER.replace('__PLAYLIST_URL__', playlistUrl) + lines.join('\n') + '\n];\n';
}
