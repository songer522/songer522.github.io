import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const apps = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apps' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one line, shown on the card
    status: z.enum(['live', 'wip', 'free-tool']),
    tags: z.array(z.string()).default([]),
    cover: z.string(), // e.g. /images/placeholders/app-1.svg
    ogImage: z.string().optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .default([]), // App Store + GitHub + site, etc.
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    // One piece of content can be mirrored across platforms — list every mirror here
    // instead of creating a separate entry per platform, so the site shows one card,
    // not duplicates. id: youtube/bilibili take the platform's video ID; xiaohongshu
    // has no public embed API, so its id is the full post URL instead.
    platforms: z
      .array(
        z.object({
          platform: z.enum(['youtube', 'bilibili', 'xiaohongshu']),
          id: z.string(),
        }),
      )
      .min(1),
    cover: z.string(),
    ogImage: z.string().optional(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { apps, videos };
