import { describe, expect, it } from 'vitest';
import { embedUrl, canEmbedInline, type PlatformLink } from '../src/lib/video';

const youtube: PlatformLink = { platform: 'youtube', id: 'yt1' };
const bilibili: PlatformLink = { platform: 'bilibili', id: 'BV1uC4y1V7iv' };
const rednote: PlatformLink = { platform: 'xiaohongshu', id: 'https://example.com/explore/1' };

describe('embedUrl', () => {
  it('builds a nocookie YouTube player URL', () => {
    expect(embedUrl(youtube)).toBe('https://www.youtube-nocookie.com/embed/yt1?autoplay=1');
  });

  it('builds a bilibili player URL', () => {
    expect(embedUrl(bilibili)).toBe(
      'https://player.bilibili.com/player.html?bvid=BV1uC4y1V7iv&autoplay=1',
    );
  });

  it('uses the RedNote post URL as-is, since it has no player', () => {
    expect(embedUrl(rednote)).toBe('https://example.com/explore/1');
  });
});

describe('canEmbedInline', () => {
  it('embeds YouTube on desktop and on mobile', () => {
    expect(canEmbedInline('youtube', false)).toBe(true);
    expect(canEmbedInline('youtube', true)).toBe(true);
  });

  it('never embeds RedNote — it has no public embed API', () => {
    expect(canEmbedInline('xiaohongshu', false)).toBe(false);
    expect(canEmbedInline('xiaohongshu', true)).toBe(false);
  });

  it('embeds bilibili on desktop', () => {
    expect(canEmbedInline('bilibili', false)).toBe(true);
  });

  /**
   * bilibili has no web player that works on a phone: player.html turns mobile user
   * agents away, and the html5 mobile player requests its media with an empty buvid,
   * which the CDN drops. Linking out beats an inline player stuck on 视频连接失效.
   */
  it('does not embed bilibili on mobile, where no bilibili web player works', () => {
    expect(canEmbedInline('bilibili', true)).toBe(false);
  });
});
