import { describe, expect, it } from 'vitest';
import { vlogs } from '../src/data/vlogs';
import { groupVlogs } from '../src/lib/vlog-groups';

describe('vlog sections', () => {
  it('assigns every current vlog to exactly one of the six sections', () => {
    expect(vlogs.every((vlog) => vlog.category !== 'other')).toBe(true);
    const sections = groupVlogs(vlogs, 'en');
    expect(sections.map((section) => section.key)).toEqual([
      'disney', 'occasions', 'local', 'road', 'canada', 'work',
    ]);
    expect(sections.flatMap((section) => section.vlogs)).toHaveLength(vlogs.length);
    for (const section of sections) {
      expect(section.vlogs.every((vlog) => vlog.category === section.key)).toBe(true);
      expect(section.vlogs).toEqual(vlogs.filter((vlog) => vlog.category === section.key));
    }
  });

  it('shows newly synced vlogs in a separate section until categorized', () => {
    const fresh = { id: 'new-video', title: 'A new trip', category: 'other' as const };
    const sections = groupVlogs([fresh], 'en');
    expect(sections).toEqual([{ key: 'other', title: 'More vlogs', vlogs: [fresh] }]);
  });
});
