import { describe, expect, it } from 'vitest';
import { pickPrimaryPlatform, type PlatformLink } from '../src/lib/video';

const youtube: PlatformLink = { platform: 'youtube', id: 'yt1' };
const bilibili: PlatformLink = { platform: 'bilibili', id: 'BV1' };
const rednote: PlatformLink = { platform: 'xiaohongshu', id: 'https://example.com/explore/1' };

describe('pickPrimaryPlatform', () => {
  describe('zh — prefer what the audience can actually reach', () => {
    it('picks bilibili when every mirror exists', () => {
      expect(pickPrimaryPlatform([youtube, bilibili, rednote], 'zh')).toBe(bilibili);
    });

    it('picks RedNote over YouTube, even though only YouTube embeds', () => {
      expect(pickPrimaryPlatform([youtube, rednote], 'zh')).toBe(rednote);
    });

    it('falls back to YouTube when it is the only mirror', () => {
      expect(pickPrimaryPlatform([youtube], 'zh')).toBe(youtube);
    });

    it('prefers bilibili over RedNote', () => {
      expect(pickPrimaryPlatform([rednote, bilibili], 'zh')).toBe(bilibili);
    });
  });

  describe('en — prefer YouTube, then whatever embeds', () => {
    it('picks YouTube when every mirror exists', () => {
      expect(pickPrimaryPlatform([bilibili, rednote, youtube], 'en')).toBe(youtube);
    });

    it('prefers bilibili over RedNote when there is no YouTube mirror', () => {
      expect(pickPrimaryPlatform([rednote, bilibili], 'en')).toBe(bilibili);
    });

    it('falls back to RedNote when it is the only mirror', () => {
      expect(pickPrimaryPlatform([rednote], 'en')).toBe(rednote);
    });
  });

  it('ignores the order the mirrors are listed in', () => {
    const listed = [rednote, youtube, bilibili];
    expect(pickPrimaryPlatform(listed, 'zh')).toBe(bilibili);
    expect(pickPrimaryPlatform(listed, 'en')).toBe(youtube);
  });
});
