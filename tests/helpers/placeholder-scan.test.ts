import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { scanForPlaceholders } from './placeholder-scan.js';

let root: string;

function write(relative: string, contents: string): void {
  const full = path.join(root, relative);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'placeholder-scan-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('scanForPlaceholders', () => {
  it('reports nothing for a file with real content', () => {
    write('content/apps/zh/real.md', '---\ntitle: 真实应用\ncover: /images/apps/real.png\n---\n\n正文。\n');

    expect(scanForPlaceholders(root, ['content'])).toEqual([]);
  });

  it('flags Chinese placeholder copy with a 1-indexed line number', () => {
    write('content/apps/zh/one.md', '---\ntitle: 占位应用一\n---\n');

    const findings = scanForPlaceholders(root, ['content']);

    expect(findings).toEqual([
      {
        file: 'content/apps/zh/one.md',
        line: 2,
        marker: '占位',
        text: 'title: 占位应用一',
      },
    ]);
  });

  it('flags English placeholder copy regardless of case', () => {
    write('content/apps/en/one.md', 'summary: One-line PLACEHOLDER summary.\n');

    const findings = scanForPlaceholders(root, ['content']);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.marker).toBe('Placeholder');
  });

  it('flags a dead "#" link even when the surrounding copy is real', () => {
    write('content/apps/zh/one.md', '---\ntitle: 真实应用\nlinks:\n  - { label: "访问网站", url: "#" }\n---\n');

    const findings = scanForPlaceholders(root, ['content']);

    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ line: 4, marker: 'dead link' });
  });

  it('flags a leftover placeholder cover path', () => {
    write('content/apps/zh/one.md', 'cover: /images/placeholders/app-1.svg\n');

    const findings = scanForPlaceholders(root, ['content']);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.marker).toBe('placeholder cover');
  });

  it('flags a leftover placeholder platform id', () => {
    write('content/videos/zh/one.md', '  - { platform: bilibili, id: BV_PLACEHOLDER_ONE }\n');

    const findings = scanForPlaceholders(root, ['content']);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.marker).toBe('placeholder id');
  });

  it('reports each line once, using the most specific marker', () => {
    write('content/apps/zh/one.md', 'cover: /images/placeholders/app-1.svg\n');

    const markers = scanForPlaceholders(root, ['content']).map((f) => f.marker);

    expect(markers).toEqual(['placeholder cover']);
  });

  it('walks directories recursively and accepts single files as targets, in target order', () => {
    write('content/apps/zh/nested.md', 'title: 占位应用一\n');
    write('components/ProfileCard.astro', '<p>Placeholder bio</p>\n');

    const files = scanForPlaceholders(root, ['content', 'components/ProfileCard.astro']).map((f) => f.file);

    expect(files).toEqual(['content/apps/zh/nested.md', 'components/ProfileCard.astro']);
  });

  it('ignores files that are neither .md nor .astro', () => {
    write('content/notes.txt', 'placeholder\n');

    expect(scanForPlaceholders(root, ['content'])).toEqual([]);
  });

  it('throws when a target is missing, rather than silently scanning nothing', () => {
    expect(() => scanForPlaceholders(root, ['content/gone.md'])).toThrow(/content\/gone\.md/);
  });
});
