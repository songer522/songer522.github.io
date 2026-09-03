import type { Locale } from '../i18n/utils';

export type VideoPlatform = 'youtube' | 'bilibili' | 'xiaohongshu';
export interface PlatformLink {
  platform: VideoPlatform;
  id: string;
}

const embeddablePlatforms: VideoPlatform[] = ['youtube', 'bilibili'];

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

/** Whether a mirror can play inline rather than only linking out. */
export function isEmbeddable(platform: VideoPlatform): boolean {
  return embeddablePlatforms.includes(platform);
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
  if (platform === 'bilibili') return 'Bilibili';
  return locale === 'zh' ? '小红书' : 'RedNote';
}
