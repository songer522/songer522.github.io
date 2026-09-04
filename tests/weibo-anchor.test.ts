import { describe, expect, it } from 'vitest';

import { cardAnchor, cardElementId, cardIdFromHash } from '../scripts/lib/weibo-anchor.mjs';

describe('card anchors', () => {
  it('builds the id and the fragment from a post id', () => {
    expect(cardElementId('QdfExstG5')).toBe('w-QdfExstG5');
    expect(cardAnchor('QdfExstG5')).toBe('#w-QdfExstG5');
  });

  it('round-trips', () => {
    for (const id of ['QdfExstG5', 'gGc6', 'MpJBpcuLb']) {
      expect(cardIdFromHash(cardAnchor(id))).toBe(id);
    }
  });

  it('reads a percent-encoded fragment, as a shared link may arrive', () => {
    expect(cardIdFromHash('#w-a%20b')).toBe('a b');
  });

  it('takes a malformed encoding as written rather than throwing', () => {
    expect(cardIdFromHash('#w-100%')).toBe('100%');
  });

  it('ignores a fragment that points at something else', () => {
    expect(cardIdFromHash('#timeline')).toBeNull();
    expect(cardIdFromHash('#w-')).toBeNull();
    expect(cardIdFromHash('')).toBeNull();
    expect(cardIdFromHash(null)).toBeNull();
    expect(cardIdFromHash(undefined)).toBeNull();
  });
});
