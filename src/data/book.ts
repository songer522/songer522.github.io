// 《通稿（2005 — 2025）》— 宋二's writing for those twenty years, self-edited into
// eleven themed chapters with annotations, and handed over as two files.
//
// Not a content collection, deliberately. There is one book, nobody is adding to it,
// and its text is Chinese on both sites — so there is no per-locale Markdown pair to
// keep in step and nothing for `tests/locale-parity.test.ts` to police. It works the
// way the vlogs do: one small hand-kept record, rendered by a component.
//
// The `copy` travels with the record because it describes this one object. Labels that
// could apply to anything — the download button — stay in `src/i18n/ui.ts`.

import type { Locale } from '../i18n/utils';

/**
 * Both files are committed under `public/book/`: about 11 MB that now lives in git
 * history for good. That is the price of a book nobody can download.
 *
 * Keep `/book/` Disallowed in `public/robots.txt` and the links `rel="nofollow"`. The
 * book names real classmates, old friends and family, so search engines stay off it —
 * which keeps it out of search results, not out of reach: anyone who guesses the URL
 * still gets it. Treat the folder as public, and don't put anything in it that you
 * have not read with that in mind.
 */
export interface BookFile {
  /** Shown on the button as-is: `PDF`, `EPUB`. */
  format: 'pdf' | 'epub';
  /** Site path into `public/`. `tests/book.test.ts` fails if the file is missing. */
  path: string;
  /** What a reader sees, so it is stated rather than computed from bytes. */
  size: string;
  /** Pages, where the format has them. An EPUB reflows, so it has none. */
  pages?: number;
}

export interface BookCopy {
  /** One line of facts under the title. Written, not generated. */
  meta: string;
  /** Why anyone would open it, and what to expect if they do. */
  summary: string;
}

export interface Book {
  /** Same on both sites: a Chinese book keeps its Chinese title. */
  title: string;
  cover: string;
  files: BookFile[];
  copy: Record<Locale, BookCopy>;
}

export const book: Book = {
  title: '通稿（2005 — 2025）',
  cover: '/images/book/tonggao.png',
  files: [
    // PDF first: it prints, and it is the format people expect a book in.
    { format: 'pdf', path: '/book/tonggao-2005-2025.pdf', size: '7.4 MB', pages: 747 },
    { format: 'epub', path: '/book/tonggao-2005-2025.epub', size: '3.7 MB' },
  ],
  copy: {
    zh: {
      meta: '十一章 · 1,500 余则 · 约 33 万字',
      summary:
        '从 2005 年 12 月 31 日的第一篇，到 2025 年 11 月的最后一篇，按主题排成十一章。原文照排，错别字和中英混用的标点都不动；注释只交代必要的人、地、物和出处，也标出前后互相呼应的地方，不评价当年的判断。',
    },
    en: {
      meta: 'Eleven chapters · 1,500+ pieces · about 330,000 characters',
      summary:
        'From the first piece on 31 December 2005 to the last in November 2025, arranged into eleven themed chapters. The texts are set exactly as written — old typos and mismatched punctuation included. The annotations only identify people, places and sources, and point out where one piece answers another. They never correct the judgement on the page.',
    },
  },
};
