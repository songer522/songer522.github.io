import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const apps = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/apps' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one line, shown on the card
    status: z.enum(['live', 'wip', 'free-tool']),
    tags: z.array(z.string()).default([]),
    cover: z.string(), // e.g. /images/placeholders/app-1.svg
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
    platform: z.enum(['youtube', 'bilibili']),
    videoId: z.string(),
    cover: z.string(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { apps, videos };
