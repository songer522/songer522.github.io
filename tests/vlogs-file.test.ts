import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { parseVlogs, renderVlogs, playlistIdFrom } from '../scripts/lib/vlogs-file.mjs';

const real = readFileSync(path.join(process.cwd(), 'src/data/vlogs.ts'), 'utf8');

describe('vlogs file', () => {
  it('parses the committed file', () => {
    const vlogs = parseVlogs(real);

    expect(vlogs.length).toBeGreaterThan(20);
    expect(vlogs[0]).toHaveProperty('id');
    expect(vlogs[0]).toHaveProperty('title');
  });

  it('reads the playlist id out of the committed url', () => {
    expect(playlistIdFrom(real).id).toBe('PLYThmuvRX57DaI0cAAHAji7hJIPOcPOe3');
  });

  it('round-trips titles containing apostrophes and emoji', () => {
    const vlogs = [
      { id: 'a', title: "Children's Museum of Indianapolis 🦖🏛️🌾" },
      { id: 'b', title: 'a back\\slash' },
      { id: 'c', title: 'plain' },
    ];

    expect(parseVlogs(renderVlogs(vlogs, 'https://example.com/?list=L'))).toEqual(vlogs);
  });

  it('round-trips the real file without changing any entry', () => {
    const { url } = playlistIdFrom(real);

    expect(parseVlogs(renderVlogs(parseVlogs(real), url))).toEqual(parseVlogs(real));
  });

  it('refuses to parse an entry shape it does not recognise', () => {
    const bad = real.replace("{ id: '", "{ ident: '");

    expect(() => parseVlogs(bad)).toThrow(/unrecognised entry/);
  });

  it('refuses a file with no playlist url', () => {
    expect(() => playlistIdFrom('export const vlogs = [];')).toThrow(/could not find playlistUrl/);
  });
});
