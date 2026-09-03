# Roadmap — after the withastro/action v6 upgrade

Status as of 2026-09-02 (end of `feature/phase2.2`): the site is **live** at
https://songer522.github.io/ and the first deploy is green. Structure is complete and
bilingual, and **Phase 2 content is now real** — every placeholder is gone from both
collections. The v6 action upgrade is queued as its own session and is not covered here.

Everything below was verified against the repo, not assumed. Each item states the
evidence.

---

## Phase 1 — Ship-blocking polish (small, independent, no input needed from Yang)

These are self-contained and can be done in any order, ideally as one PR.

### 1.1 Add `og:image` — **DONE (2026-09-01)**

`src/layouts/BaseLayout.astro` now accepts an optional `ogImage` prop, falls back to
`public/images/og-default.png` (a real 1200×630 PNG, not SVG), and emits absolute
`og:image` / `twitter:image` URLs plus `og:locale` and `og:site_name`. Both content
collections gained an optional `ogImage` field, and all four detail pages
(`apps`/`videos` × `zh`/`en`) pass their entry's `ogImage` through. Verified via
`npm run build` — emitted HTML has correct absolute URLs — and `npm test` (still
15/15 passing). Still worth running the URL through opengraph.xyz or X's card
validator after the next real deploy.

<details>
<summary>Original steps (for reference)</summary>

Steps:
1. Create a site-wide default OG image at `public/images/og-default.png`,
   **1200×630 PNG**. Not SVG — most scrapers (X, Facebook, WeChat) do not render SVG
   OG images. This matters because every existing cover in
   `public/images/placeholders/` is an SVG and therefore cannot be reused here.
2. Add an optional `ogImage: z.string().optional()` to both collections in
   `src/content.config.ts`.
3. In `BaseLayout.astro`, accept an optional `ogImage` prop, fall back to the default,
   and emit both tags as **absolute** URLs — relative paths are invalid here:
   ```astro
   const ogImageUrl = new URL(ogImage ?? '/images/og-default.png', Astro.site);
   <meta property="og:image" content={ogImageUrl.href} />
   <meta name="twitter:image" content={ogImageUrl.href} />
   ```
4. Pass the entry's `ogImage` (or `cover`, once covers are real raster files) from the
   four detail pages: `src/pages/{apps,videos}/[slug].astro` and their `en/` twins.
5. Also add `<meta property="og:locale">` — `zh_CN` / `en_US` — and an `og:site_name`.

Verify with a real scraper, not by reading the HTML: after deploy, run the URL through
opengraph.xyz or X's card validator. A tag that is present but points at a 404 looks
identical in source to one that works.

</details>

### 1.2 Replace the stock Astro favicon — **DONE (2026-09-01)**

`public/favicon.svg` (Astro's default logo) is removed. In its place: `public/favicon.ico`
(16/32/48/256 sizes, cropped/rasterized from a real photo Yang supplied), an
`apple-touch-icon.png` (180×180), `icon-192.png`/`icon-512.png`, and a
`site.webmanifest` (`theme_color` matched to the site's real `--accent` value,
`#c2703d`). `BaseLayout.astro`'s `<head>` now links all three (`icon`,
`apple-touch-icon`, `manifest`). Verified via `npm run build` (links present in
emitted HTML) and `npm test` (15/15 passing).

### 1.3 Add a 404 page — **DONE (2026-09-01)**

`src/pages/404.astro` now exists, built on `BaseLayout`, with links home and to
`/apps/`. Bilingual as specced: both languages stacked, zh first (no locale
detection attempted, since GitHub Pages serves one `404.html` for the whole
domain). Verified via `npm run build` — `dist/404.html` contains both `<h1>`s —
and `npm test` (15/15 passing).

### 1.4 Add a sitemap and robots.txt — **DONE (2026-09-01)**

`@astrojs/sitemap` is installed and configured in `astro.config.mjs` with an
explicit `i18n` block (`defaultLocale: 'zh'`, `locales: { zh: 'zh-CN', en: 'en' }`)
so each URL in `sitemap-0.xml` carries `xhtml:link rel="alternate"` entries for
both locales. These codes (`zh-CN` / `en`) match `<html lang>` and the page-level
`hreflang` tags in `BaseLayout.astro` exactly — a review caught the initial
mismatch (`en-US` in the sitemap vs `en` on the page), fixed 2026-09-01.
`public/robots.txt` points at `https://songer522.github.io/sitemap-index.xml` and
adds no `Disallow` rules, so it makes no crawl-policy decisions for the separate
`/blog/` repo. Verified via `npm run build` (inspected `dist/sitemap-0.xml` and
`dist/robots.txt` directly) and `npm test`.

---

## Phase 2 — Real content (the actual critical path)

The site is a well-built shell. Until this phase lands, none of Phase 1 or 3 makes it
useful. **This is gated on Yang, so start collecting material now, in parallel with
Phase 1.**

### 2.1 What Yang needs to supply

#### Profile — **DONE (2026-09-02)**

`src/components/ProfileCard.astro` now has real content: `public/images/avatar.jpg`
(480×480 JPEG), a bilingual positioning statement (Chicago-based, works in tech,
builds indie apps, records life on camera), real tags (独立开发/Indie dev,
视频创作/Video, 芝加哥生活/Life in Chicago), and real social links — GitHub, YouTube,
RedNote (小红书), Weibo, and Email (`mailto:`). No `og:image` or schema change was
needed here since the avatar is a static `<img>`, not a content-collection field.

Apps and videos have since been supplied too — see 2.2.

### 2.2 Replace placeholder entries — **DONE (2026-09-02)**

All twelve placeholder files are gone. Both collections are entirely real, in both
locales, and the locale-parity invariant held throughout — no slug ever existed in one
language only.

**Apps (4):**

| Slug | Status | Notes |
| :--- | :--- | :--- |
| `rewind` | live | Rewind: Memories on This Day. App Store + GitHub. |
| `cochleo` | live | Listening practice for cochlear implant users. Copy is deliberately descriptive — no claims about hearing outcomes. |
| `track-lapse` | wip | 2012 cocos2d game being restored. GitHub only; the company behind it no longer exists and the game is off the App Store. States facts, claims no rights. |
| `fun-collages` | free-tool | Early work, App Store only. Cover is generated rather than taken from the listing's screenshots, which are full of identifiable family photos. |

**Videos (3):** `chicago-city-walk`, `day-in-the-life`, `iphone-vs-full-frame`. Each
lists its bilibili mirror alongside YouTube, so `src/lib/video.ts` picks a player by
locale — bilibili for zh, YouTube for en. BV ids were matched to the YouTube originals
on duration, title and cover, not guessed.

**Caveat worth keeping visible:** the Chinese copy across all seven entries was drafted
by Claude from repo READMEs and App Store listings, then reviewed by Yang — it is not
originally his writing. The one exception is Rewind's 「为什么做这个」 line, which is
verbatim his.

Work not in the original roadmap that landed alongside it: a lightbox for in-body
images, the Vlogs section (61 videos from an unlisted playlist, `noindex` and
sitemap-excluded), `npm run sync:vlogs` to maintain it, and 宋二 as the zh site name.

### 2.3 Migrate `cover` to Astro's `image()` — **UNBLOCKED, not done**

Every cover is now a real raster in `public/images/` (PNG for apps, JPEG for videos),
so the reason this was deferred is gone. Note the scope grew: there are now app covers,
video covers, in-body screenshots on two detail pages, and 61 vlog thumbnails, though
the vlog grid is a plain data file rather than a content collection and would need
handling separately.

`src/content.config.ts` types `cover` as `z.string()`, which was deliberate while the
placeholders were SVGs in `public/`. To migrate, move them to `src/assets/` and switch
to:

```ts
import { defineCollection, z } from 'astro:content';
// schema: ({ image }) => z.object({ cover: image(), ... })
```

This buys width/height inference (no layout shift), automatic WebP/AVIF conversion, and
responsive `srcset` — all of which matter a lot for a screenshot-heavy portfolio, and
none of which work on `public/` SVGs. Update `ProjectCard.astro` and the detail pages
to render `<Image />` instead of `<img>`.

### 2.4 Tighten the schema once placeholders are gone — **UNBLOCKED, not done**

`links[].url` is still `z.string()`. The blocker is gone: `grep -rn 'url: *"#"'
src/content/` returns nothing, so changing it to `z.string().url()` would pass today and
make a malformed link fail the build instead of shipping. A one-line change in
`src/content.config.ts`.

### 2.5 Optional guard: report remaining placeholders — **DONE (2026-09-02)**

`tests/placeholder-guard.test.ts` scans `src/content/` and
`src/components/ProfileCard.astro` and prints every remaining placeholder, grouped by
file with line numbers. The scan itself lives in `tests/helpers/placeholder-scan.ts`
as a pure `scanForPlaceholders(root, targets)` and is unit-tested against temp-dir
fixtures.

Beyond the `占位` / `Placeholder` markers this item named, it also flags leftover
`/images/placeholders/` covers, `url: "#"` dead links, and `_PLACEHOLDER` platform
ids — because the failure mode described below is a *half*-converted entry (real
title, forgotten cover), which title-only matching would pass.

**Reporting-only**: the `FAIL_ON_PLACEHOLDERS` constant at the top of the guard is
`false`, so it logs and passes. Flip it to `true` once Yang declares the content
complete and a stray placeholder fails the build instead of shipping. Both modes were
verified. A `vitest.config.ts` was added with `disableConsoleIntercept: true` — the
default reporter swallows stdout from passing tests, which would have made the report
invisible. Current baseline: **78 placeholders across 12 files**; `npm test` is 26/26.

---

## Phase 3 — Growth (only worth doing once Phase 2 is real)

Listed roughly in order of value. None of these are urgent; several were explicitly
ruled out of the original scope and are re-listed here only as options.

### 3.1 Visual coherence with the blog

The blog at `/blog/` is dark and elegant; this site is warm and light. They currently
read as two different people's sites, and the nav links between them. Decide
deliberately: either accept the contrast as intentional (two distinct spaces), or bring
them closer. Adding dark mode here was ruled out of the original scope; revisit it only
as part of this decision, not on its own.

### 3.2 Analytics

None installed. If Yang wants to know what people actually look at, a privacy-friendly,
cookie-less option (Plausible, Umami, GoatCounter) fits a personal site better than GA
and needs no consent banner. One script tag in `BaseLayout`.

### 3.3 RSS

Ruled out of the original scope. Only worth adding if the site starts hosting writing
of its own — the existing blog is the natural home for that, and it is a separate repo.
Do not add an empty feed for completeness.

### 3.4 Per-project OG images

If sharing individual projects becomes common, generate per-page OG cards at build time
(`astro-og-canvas` or Satori) instead of hand-making PNGs. Do this only after 1.1 has a
static default working — it is an optimization of a solved problem, not a substitute.

---

## Explicitly NOT next

- **Any change to the blog repo.** It is separate and self-contained.
- **A CMS.** Markdown files in git are the right weight for this; adding a CMS would be
  solving a problem the site does not have.
- **A custom domain.** Deliberately deferred. If it happens later, it is a `CNAME` file
  plus DNS, and `site` in `astro.config.mjs` must be updated to match or every canonical
  and OG URL silently points at the old domain.

---

## Suggested sequencing

Phase 1 and Phase 2 are both done. What is left, cheapest first:

1. **2.4** — one line, unblocked, nothing currently violates it.
2. **2.5's switch** — flip `FAIL_ON_PLACEHOLDERS` to `true` in
   `tests/placeholder-guard.test.ts`. The guard reports zero today, so this turns a
   report into an enforced invariant.
3. **The v6 action upgrade** — its own session, already prepped.
4. **2.3** — the `image()` migration; the largest of these, and the one with real
   payoff for a screenshot-heavy site.
5. **Phase 3** — revisit with real traffic and real content to reason about.
