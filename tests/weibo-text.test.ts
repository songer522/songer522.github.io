import { describe, expect, it } from 'vitest';

import { cleanText } from '../scripts/lib/weibo-text.mjs';

describe('cleanText', () => {
  it('strips the dead 网页链接 placeholder', () => {
    expect(cleanText('芝加哥看脱口秀展 网页链接 ')).toBe('芝加哥看脱口秀展');
  });

  it('strips the retired video-player placeholder, whatever the name reads', () => {
    expect(cleanText('AI 还不会做韭菜盒子。 宋二的微博视频 ')).toBe('AI 还不会做韭菜盒子。');
    expect(cleanText('感谢，珍重，再会。 宋二的秒拍视频 ')).toBe('感谢，珍重，再会。');
    // One post signs itself differently.
    expect(cleanText('如何免费升级到 iPhone Xs。\n宋_二的秒拍视频 ')).toBe(
      '如何免费升级到 iPhone Xs。',
    );
  });

  it('strips the note teaser and the link that trails it', () => {
    expect(cleanText('🚶🚶芝加哥城市漫步Chicago City W… 戳我查看完整笔记>> 网页链接 ')).toBe(
      '🚶🚶芝加哥城市漫步Chicago City W…',
    );
  });

  it('leaves hashtags exactly as written', () => {
    expect(cleanText('这周太多外国人要在芝加哥跑。#芝加哥马拉松# ')).toBe(
      '这周太多外国人要在芝加哥跑。#芝加哥马拉松#',
    );
    expect(cleanText('#超人# 网页链接 ')).toBe('#超人#');
  });

  it('keeps the paragraph breaks in a long post', () => {
    expect(cleanText('第一段。\n\n第二段。\n\n第三段。')).toBe('第一段。\n\n第二段。\n\n第三段。');
  });

  it('collapses the spaces a removed placeholder leaves behind', () => {
    expect(cleanText('前面 网页链接 后面')).toBe('前面 后面');
    expect(cleanText('前面   后面')).toBe('前面 后面');
  });

  it('does not leave a blank line looking indented', () => {
    expect(cleanText('一句话。\n网页链接\n另一句。')).toBe('一句话。\n另一句。');
  });

  it('empties a post whose whole text was a placeholder', () => {
    // The three posts this happens to all carry images, so the caller keeps them.
    expect(cleanText('分享图片 ')).toBe('');
    expect(cleanText(' ')).toBe('');
  });

  it('does not reach back into real text', () => {
    // The name in the placeholder is bounded, so an ordinary sentence ending in
    // 视频 survives.
    expect(cleanText('今天拍了一段视频')).toBe('今天拍了一段视频');
    expect(cleanText('这是我最喜欢的视频')).toBe('这是我最喜欢的视频');
  });

  it('handles missing text', () => {
    expect(cleanText(undefined)).toBe('');
    expect(cleanText(null)).toBe('');
  });
});
