import type { Vlog, VlogCategory } from '../data/vlogs';
import type { Locale } from '../i18n/ui';

type MainCategory = Exclude<VlogCategory, 'other'>;

const groups: { key: MainCategory; title: Record<Locale, string> }[] = [
  { key: 'disney', title: { en: 'Disney & cruises', zh: '迪士尼与邮轮' } },
  { key: 'occasions', title: { en: 'Special occasions', zh: '特别的日子' } },
  { key: 'local', title: { en: 'Chicago & everyday life', zh: '芝加哥与日常' } },
  { key: 'road', title: { en: 'Road trips', zh: '自驾旅行' } },
  { key: 'canada', title: { en: 'Canada trips', zh: '加拿大旅行' } },
  { key: 'work', title: { en: 'Work vlogs', zh: '工作 Vlog' } },
];

export interface VlogGroup {
  key: VlogCategory;
  title: string;
  vlogs: Vlog[];
}

/** Preserve the playlist's date order within each section. */
export function groupVlogs(vlogs: Vlog[], locale: Locale): VlogGroup[] {
  const sections: VlogGroup[] = groups.map((group) => ({
    key: group.key,
    title: group.title[locale],
    vlogs: vlogs.filter((vlog) => vlog.category === group.key),
  }));
  const other = vlogs.filter((vlog) => vlog.category === 'other');
  if (other.length) {
    sections.push({ key: 'other', title: locale === 'zh' ? '其他记录' : 'More vlogs', vlogs: other });
  }
  return sections.filter((section) => section.vlogs.length);
}
