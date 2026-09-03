import { describe, expect, it } from 'vitest';
import {
  embedUrl,
  canEmbedInline,
  isMobileDevice,
  type PlatformLink,
} from '../src/lib/video';

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

describe('isMobileDevice', () => {
  const iphone =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const android =
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const mac =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
  const windows =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  it('spots a phone from its user agent', () => {
    expect(isMobileDevice({ userAgent: iphone })).toBe(true);
    expect(isMobileDevice({ userAgent: android })).toBe(true);
  });

  it('leaves a real desktop alone', () => {
    expect(isMobileDevice({ userAgent: mac, platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
    expect(isMobileDevice({ userAgent: windows, platform: 'Win32', maxTouchPoints: 0 })).toBe(false);
  });

  /**
   * iPadOS Safari asks for desktop sites by default and reports a macOS user agent
   * with no iPad or Mobile token, so the user agent alone cannot see it. No Mac has
   * a touchscreen, so touch points give it away.
   */
  it('spots an iPad in desktop mode, which reports a macOS user agent', () => {
    expect(isMobileDevice({ userAgent: mac, platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
  });

  it('still spots an iPad that reports itself honestly', () => {
    expect(
      isMobileDevice({
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      }),
    ).toBe(true);
  });

  it('treats missing navigator hints as desktop rather than guessing', () => {
    expect(isMobileDevice({ userAgent: mac })).toBe(false);
  });
});
