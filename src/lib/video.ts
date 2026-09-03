import type { Locale } from '../i18n/utils';

export type VideoPlatform = 'youtube' | 'bilibili' | 'xiaohongshu';
export interface PlatformLink {
  platform: VideoPlatform;
  id: string;
}

/**
 * Platforms with a public web player we can drop into an iframe. xiaohongshu has no
 * embed API at all, so it only ever links out.
 */
const embeddablePlatforms: VideoPlatform[] = ['youtube', 'bilibili'];

/**
 * Platforms whose player is desktop-only, so a phone has to link out instead.
 *
 * bilibili has no web player that plays on a phone. player.html turns mobile user
 * agents away outright, and the html5 mobile player at /blackboard/ requests its
 * media with an empty buvid, which the CDN silently drops — the reader is left
 * staring at 视频连接失效，视频内容不和谐. Both are inside bilibili's own player and
 * API, so no iframe URL can work around them; opening the video on bilibili, where
 * the app can take over, is the only thing that actually plays.
 */
const desktopOnlyPlatforms: VideoPlatform[] = ['bilibili'];

/**
 * Mirror preference per locale, most preferred first.
 *
 * zh puts reachability above playability: bilibili embeds and needs no VPN, and a
 * RedNote card that links out still beats an inline YouTube player the reader may
 * not be able to load at all. en has no such constraint, so it leads with YouTube
 * and then prefers whatever embeds.
 */
const preferenceByLocale: Record<Locale, VideoPlatform[]> = {
  zh: ['bilibili', 'xiaohongshu', 'youtube'],
  en: ['youtube', 'bilibili', 'xiaohongshu'],
};

/** Pick which mirror to show in the facade, ignoring the order they were listed in. */
export function pickPrimaryPlatform(platforms: PlatformLink[], locale: Locale): PlatformLink {
  for (const platform of preferenceByLocale[locale]) {
    const match = platforms.find((p) => p.platform === platform);
    if (match) return match;
  }
  return platforms[0];
}

/** Whether a mirror has a web player at all, on any device. */
export function isEmbeddable(platform: VideoPlatform): boolean {
  return embeddablePlatforms.includes(platform);
}

/**
 * Whether a mirror can play inline on this device, rather than only linking out.
 * The device half can only be known in the browser, so the facade decides at click
 * time — see VideoEmbed.astro.
 */
export function canEmbedInline(platform: VideoPlatform, isMobile: boolean): boolean {
  if (!isEmbeddable(platform)) return false;
  return !(isMobile && desktopOnlyPlatforms.includes(platform));
}

/** The player URL to load in the facade's iframe once the reader hits play. */
export function embedUrl({ platform, id }: PlatformLink): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${id}&autoplay=1`;
    case 'xiaohongshu':
      return id; // no player; the facade links out to the post instead
  }
}

export function otherPlatforms(platforms: PlatformLink[], primary: PlatformLink): PlatformLink[] {
  return platforms.filter((p) => p !== primary);
}

export function platformUrl({ platform, id }: PlatformLink): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${id}`;
    case 'bilibili':
      return `https://www.bilibili.com/video/${id}`;
    case 'xiaohongshu':
      return id; // already a full post URL
  }
}

/** Display label for a platform link. YouTube gets a wink on the zh site: it needs a VPN there. */
export function platformLabel(platform: VideoPlatform, locale: Locale): string {
  if (platform === 'youtube') return locale === 'zh' ? 'YouTube（自备梯子）' : 'YouTube';
  if (platform === 'bilibili') return locale === 'zh' ? '哔哩哔哩' : 'Bilibili';
  return locale === 'zh' ? '小红书' : 'RedNote';
}
