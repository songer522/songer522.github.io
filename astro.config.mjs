// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://songer522.github.io',

  // no `base`: user-pages repo, serves from the root — see PLAN.md Setup status
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      // The vlogs pages link an unlisted YouTube playlist; keep them out of the
      // sitemap to match the noindex tag they carry.
      filter: (page) => !/\/(en\/)?vlogs\//.test(page),
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en',
        },
      },
    }),
  ],
});