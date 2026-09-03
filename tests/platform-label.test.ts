import { describe, expect, it } from 'vitest';
import { platformLabel } from '../src/lib/video';

describe('platformLabel', () => {
  describe('zh', () => {
    it('names bilibili in Chinese', () => {
      expect(platformLabel('bilibili', 'zh')).toBe('哔哩哔哩');
    });

    it('names RedNote in Chinese', () => {
      expect(platformLabel('xiaohongshu', 'zh')).toBe('小红书');
    });

    it('keeps YouTube in Latin, with the VPN aside', () => {
      expect(platformLabel('youtube', 'zh')).toBe('YouTube（自备梯子）');
    });
  });

  describe('en', () => {
    it('uses the Latin platform names', () => {
      expect(platformLabel('bilibili', 'en')).toBe('Bilibili');
      expect(platformLabel('youtube', 'en')).toBe('YouTube');
      expect(platformLabel('xiaohongshu', 'en')).toBe('RedNote');
    });
  });
});
