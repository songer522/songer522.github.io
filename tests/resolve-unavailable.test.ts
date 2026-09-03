import { describe, expect, it } from 'vitest';
import { resolveUnavailable } from '../scripts/lib/merge-vlogs.mjs';

const item = (id: string, title: string, unavailable = false) => ({ id, title, unavailable });
const v = (id: string, title: string) => ({ id, title });

describe('resolveUnavailable', () => {
  it('passes available items through untouched', () => {
    const { items, held } = resolveUnavailable([item('a', 'A')], []);

    expect(items).toEqual([v('a', 'A')]);
    expect(held).toEqual([]);
  });

  it('keeps a known entry that has gone private, preserving the local title', () => {
    // Otherwise it looks removed, gets dropped, and comes back later under the
    // upstream title — silently undoing a rename made for privacy.
    const { items, held } = resolveUnavailable(
      [item('a', 'Private video', true)],
      [v('a', 'A 6th Birthday')],
    );

    expect(items).toEqual([v('a', 'A 6th Birthday')]);
    expect(held).toEqual(['a']);
  });

  it('drops an unavailable video it has never seen, since there is no title to show', () => {
    const { items, held } = resolveUnavailable([item('x', 'Deleted video', true)], []);

    expect(items).toEqual([]);
    expect(held).toEqual([]);
  });

  it('preserves playlist order around a held entry', () => {
    const { items } = resolveUnavailable(
      [item('a', 'A'), item('b', 'Private video', true), item('c', 'C')],
      [v('b', 'kept title')],
    );

    expect(items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(items[1]).toEqual(v('b', 'kept title'));
  });
});
