import { ui, defaultLocale, type Locale } from './ui';

export type { Locale };

export const localeOf = (id: string) => id.split('/')[0] as Locale;
export const slugOf = (id: string) => id.split('/').slice(1).join('/');

export function t(locale: Locale) {
  return (key: keyof (typeof ui)['zh']) => ui[locale][key] ?? ui[defaultLocale][key];
}

/** '/en/apps/foo/' -> 'en';  '/apps/foo/' -> 'zh' */
export function getLocaleFromUrl(url: URL): Locale {
  return url.pathname.split('/')[1] === 'en' ? 'en' : 'zh';
}

/**
 * Map the current path to its counterpart in the other locale.
 *   '/'              <-> '/en/'
 *   '/apps/'         <-> '/en/apps/'
 *   '/apps/foo/'     <-> '/en/apps/foo/'
 * Must round-trip: switchLocalePath(switchLocalePath(p, 'en'), 'zh') === p
 */
export function switchLocalePath(pathname: string, to: Locale): string {
  const isEn = pathname.startsWith('/en/') || pathname === '/en';
  const bare = isEn ? pathname.replace(/^\/en/, '') || '/' : pathname;
  return to === 'en' ? (bare === '/' ? '/en/' : `/en${bare}`) : bare;
}
