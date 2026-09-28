import { describe, expect, it } from 'vitest';
import { categoryFromTitle } from '../scripts/lib/vlog-category.mjs';

describe('new vlog category suggestions', () => {
  it.each([
    ['Disney World and cruise day 1', 'disney'],
    ['Royal Caribbean Utopia of the Sea', 'disney'],
    ['Disney on Ice', 'occasions'],
    ['Christmas Show 2026', 'occasions'],
    ['Birthday Trip to Indianapolis', 'road'],
    ['Wisconsin State Fair', 'road'],
    ['Quebec Trip 2026', 'canada'],
    ['Office Vlog', 'work'],
    ['Field Museum Chicago', 'local'],
    ['🐶🐜🤿🍦', 'other'],
  ])('%s → %s', (title, category) => {
    expect(categoryFromTitle(title)).toBe(category);
  });
});
