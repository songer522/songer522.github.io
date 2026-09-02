import { describe, expect, it } from 'vitest';

import { scanForPlaceholders } from './helpers/placeholder-scan.js';

/**
 * ROADMAP 2.5. Reporting-only for now: the scan prints what is left and the
 * test passes. Flip this to `true` once Yang declares the content complete,
 * and a stray placeholder card fails the build instead of shipping.
 */
const FAIL_ON_PLACEHOLDERS = false;

const TARGETS = ['src/content', 'src/components/ProfileCard.astro'];

describe('placeholder guard', () => {
  it('reports every remaining placeholder', () => {
    const findings = scanForPlaceholders(process.cwd(), TARGETS);

    if (findings.length === 0) {
      console.log('\nplaceholder guard: no placeholders left in %s.\n', TARGETS.join(', '));
    } else {
      const byFile = new Map<string, typeof findings>();
      for (const finding of findings) {
        byFile.set(finding.file, [...(byFile.get(finding.file) ?? []), finding]);
      }

      const report = [...byFile]
        .map(([file, hits]) =>
          [`  ${file}`, ...hits.map((h) => `    line ${h.line} [${h.marker}] ${h.text}`)].join('\n'),
        )
        .join('\n');

      console.log(
        '\nplaceholder guard: %d placeholder(s) across %d file(s):\n%s\n',
        findings.length,
        byFile.size,
        report,
      );
    }

    if (FAIL_ON_PLACEHOLDERS) {
      expect(findings).toEqual([]);
    }
  });
});
