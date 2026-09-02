import type { Locale } from '../i18n/utils';

export type VideoPlatform = 'youtube' | 'bilibili' | 'xiaohongshu';
export interface PlatformLink {
  platform: VideoPlatform;
  id: string;
}

const embeddablePlatforms: VideoPlatform[] = ['youtube', 'bilibili'];

/**
 * Pick which mirror to show in the facade. Prefer an embeddable platform, and among
 * those prefer the one that's actually reachable for the locale's audience: bilibili
 * for zh (no VPN needed), youtube for en. Falls back to xiaohongshu (link-out only)
 * when that's the only mirror available.
 */
export function pickPrimaryPlatform(platforms: PlatformLink[], locale: Locale): PlatformLink {
  const embeddable = platforms.filter((p) => embeddablePlatforms.includes(p.platform));
  if (embeddable.length > 0) {
    const preferred: VideoPlatform = locale === 'zh' ? 'bilibili' : 'youtube';
    return embeddable.find((p) => p.platform === preferred) ?? embeddable[0];
  }
  return platforms[0];
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
