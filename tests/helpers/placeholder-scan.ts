import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export interface Finding {
  /** Path relative to the scanned root, POSIX-separated. */
  file: string;
  /** 1-indexed line number. */
  line: number;
  marker: string;
  text: string;
}

/**
 * Ordered most-specific first: a line is reported once, under the first
 * marker that matches it. `/images/placeholders/app-1.svg` is a leftover
 * cover, not just a line containing the word "placeholder".
 */
const MARKERS: { marker: string; pattern: RegExp }[] = [
  { marker: 'placeholder cover', pattern: /\/images\/placeholders\// },
  { marker: 'placeholder id', pattern: /_PLACEHOLDER/ },
  { marker: 'dead link', pattern: /url:\s*"?#"?\s*[},]/ },
  { marker: '占位', pattern: /占位/ },
  { marker: 'Placeholder', pattern: /placeholder/i },
];

const SCANNED_EXTENSIONS = ['.md', '.astro'];

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return filesUnder(full);
      return SCANNED_EXTENSIONS.includes(path.extname(entry.name)) ? [full] : [];
    });
}

function scanFile(root: string, file: string): Finding[] {
  const relative = path.relative(root, file).split(path.sep).join('/');

  return readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((text, index) => {
      const hit = MARKERS.find(({ pattern }) => pattern.test(text));
      if (!hit) return [];
      return [{ file: relative, line: index + 1, marker: hit.marker, text: text.trim() }];
    });
}

/**
 * Scan `targets` (files or directories, relative to `root`) for leftover
 * placeholder content. Missing targets throw rather than silently scanning
 * nothing — a renamed path should be loud, not quietly clean.
 */
export function scanForPlaceholders(root: string, targets: string[]): Finding[] {
  return targets.flatMap((target) => {
    const full = path.join(root, target);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      throw new Error(`placeholder scan target does not exist: ${target}`);
    }
    const files = stats.isDirectory() ? filesUnder(full) : [full];
    return files.flatMap((file) => scanFile(root, file));
  });
}
