import type { APIRoute } from 'astro';
import { posts, type WeiboPost } from '../../../lib/weibo';
import { daysOfYear } from '../../../../scripts/lib/weibo-heatmap.mjs';

/**
 * One tiny JSON file per calendar day, for the homepage's "on this day" strip.
 *
 * The strip cannot be server-rendered: a static build freezes the date at deploy time,
 * and this site is rebuilt only when something is pushed, so by the day after a deploy
 * it would be showing the wrong day's posts. Nor can the homepage carry the whole
 * archive — that is 400 KB to render three cards.
 *
 * So the split falls out: 366 files of a couple of kilobytes each, and the browser
 * asks for the one that matches today in Beijing. Each file also carries a few
 * fallback posts, chosen at build from across the years, so a date with nothing on it
 * still has something to show without a second request.
 */

const MAX_POSTS = 3;
const MAX_FALLBACK = 3;
/** The strip is a teaser, not the archive — long posts are cut and linked through. */
const EXCERPT = 90;

function compact(post: WeiboPost) {
  const text = [...post.text];

  return {
    id: post.id,
    date: post.date,
    text: text.length > EXCERPT ? `${text.slice(0, EXCERPT).join('')}…` : post.text,
    truncated: text.length > EXCERPT,
    image: post.images[0] ?? post.video ?? null,
  };
}

export const getStaticPaths = () => {
  // 2012 is a leap year, so this yields all 366 possible days including 02-29.
  return daysOfYear(2012).map((day: string) => ({ params: { md: day.slice(5) } }));
};

export const GET: APIRoute = ({ params }) => {
  const md = params.md as string;
  const matches = posts.filter((post) => post.date.slice(5) === md);

  // Spread the fallbacks across the archive rather than taking the newest few, and
  // offset them by the day so different dates fall back to different posts.
  const offset = daysOfYear(2012).indexOf(`2012-${md}`);
  const step = Math.floor(posts.length / MAX_FALLBACK);
  const fallback = Array.from({ length: MAX_FALLBACK }, (_, i) =>
    posts[(offset + i * step) % posts.length],
  );

  return new Response(
    JSON.stringify({
      md,
      posts: matches.slice(0, MAX_POSTS).map(compact),
      total: matches.length,
      fallback: fallback.map(compact),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
