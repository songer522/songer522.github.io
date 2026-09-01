export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

export const ui = {
  zh: {
    'nav.apps': '作品',
    'nav.videos': '视频',
    'nav.about': '关于',
    'nav.blog': '博客',
    'home.featured': '我正在做的东西',
    'home.videos': '最近的视频',
    'apps.title': '作品与工具',
    'videos.title': '视频',
    'about.title': '关于我',
    'status.live': '已上线',
    'status.wip': '进行中',
    'status.free-tool': '免费工具',
    'card.viewAll': '查看全部',
    'detail.links': '相关链接',
    'detail.back': '返回',
    'video.play': '播放视频',
    'footer.note': '占位文案 · Placeholder footer',
  },
  en: {
    'nav.apps': 'Work',
    'nav.videos': 'Videos',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'home.featured': "What I'm building",
    'home.videos': 'Recent videos',
    'apps.title': 'Apps & Tools',
    'videos.title': 'Videos',
    'about.title': 'About',
    'status.live': 'Live',
    'status.wip': 'In progress',
    'status.free-tool': 'Free tool',
    'card.viewAll': 'View all',
    'detail.links': 'Links',
    'detail.back': 'Back',
    'video.play': 'Play video',
    'footer.note': 'Placeholder footer',
  },
} as const;
