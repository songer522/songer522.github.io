import archive from '../data/weibo.json';

/**
 * The Weibo archive: 1,223 posts from 2009 to 2025, exported from Weibo and rebuilt
 * by `npm run sync:weibo`.
 *
 * Unlike `src/data/vlogs.ts`, `src/data/weibo.json` is machine-owned — 400 KB of
 * generated data that nobody should hand-edit. Everything derived from it lives here
 * instead, so pages stay declarative and the shape is stated in one place.
 *
 * Dates are Beijing wall-clock strings, never Date objects. See
 * `scripts/lib/weibo-date.mjs` for why that matters.
 */

export interface WeiboImage {
  src: string;
  w: number;
  h: number;
}

export interface WeiboPost {
  /** Weibo's bid — the permalink segment, and the card's anchor. */
  id: string;
  /** `YYYY-MM-DD`, Beijing. */
  date: string;
  /** `HH:MM`, Beijing. */
  time: string;
  text: string;
  images: WeiboImage[];
  /** Present on the 11 video posts whose cover still exists somewhere. */
  video?: WeiboImage & { title: string; cover: string };
  reposts: number;
  comments: number;
  likes: number;
}

const uid: string = archive.uid;

/** Newest first. */
export const posts = archive.posts as WeiboPost[];

/** Where a post still lives on Weibo, for the "view original" link on each card. */
export const permalink = (post: WeiboPost) => `https://weibo.com/${uid}/${post.id}`;

/** Only the years that actually have posts — 2017 has none, and gets no tab. */
export function yearsWithPosts(all: WeiboPost[] = posts): number[] {
  return [...new Set(all.map((post) => Number(post.date.slice(0, 4))))].sort((a, b) => b - a);
}

export function countsByYear(all: WeiboPost[] = posts): Map<number, number> {
  const counts = new Map<number, number>();
  for (const post of all) {
    const year = Number(post.date.slice(0, 4));
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }
  return counts;
}

/**
 * The four counters above the archive, matching the blog's header.
 *
 * Characters are counted by code point rather than by `length`, so an emoji counts as
 * the one character it looks like instead of the two UTF-16 units it occupies.
 */
export function stats(all: WeiboPost[] = posts) {
  const years = yearsWithPosts(all);

  return {
    posts: all.length,
    characters: all.reduce((total, post) => total + [...post.text].length, 0),
    images: all.reduce((total, post) => total + post.images.length, 0),
    firstYear: years.at(-1) ?? 0,
    lastYear: years[0] ?? 0,
  };
}

/** The stored `YYYY-MM-DD` as the cards show it: `2010.03.09`. Matches formatVlogDate. */
export const formatWeiboDate = (date: string) => date.replaceAll('-', '.');
