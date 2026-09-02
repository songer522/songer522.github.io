# Roadmap — after the withastro/action v6 upgrade

Status as of 2026-09-02: the site is **live** at https://songer522.github.io/ and the
first deploy is green. Structure is complete and bilingual; **all content is
placeholder**. The v6 action upgrade is queued as its own session and is not covered
here.

Everything below was verified against the repo at `a44abc3`, not assumed. Each item
states the evidence.

---

## Phase 1 — Ship-blocking polish (small, independent, no input needed from Yang)

These are self-contained and can be done in any order, ideally as one PR.

### 1.1 Add `og:image` — **highest priority in this phase**

`src/layouts/BaseLayout.astro` sets `twitter:card = summary_large_image` but emits **no
`og:image` and no `twitter:image`**. Every link shared to X, WeChat, Slack, or iMessage
renders with a blank preview — the card type promises an image the page never supplies.

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

### 1.2 Replace the stock Astro favicon

`public/favicon.svg` is still Astro's default logo (verified: the 128×128 Astro mark).
On a personal site this reads as unfinished. Replace `favicon.svg` and `favicon.ico`
with something of Yang's, and add an `apple-touch-icon` PNG (180×180) plus a
`site.webmanifest` if you want a decent mobile bookmark.

### 1.3 Add a 404 page

`src/pages/404.astro` does not exist, so GitHub Pages serves its own generic 404 —
which drops the visitor out of the site entirely, with no nav and no way back.

Build one on `BaseLayout` with links home and to `/apps/`. Note the bilingual wrinkle:
GitHub Pages serves a **single** `404.html` for the whole domain, so it cannot be
locale-aware server-side. Write it bilingual (both languages stacked, zh first), rather
than attempting locale detection.

### 1.4 Add a sitemap and robots.txt

Neither exists (no `@astrojs/sitemap` in `package.json`, no `public/robots.txt`).

```bash
npx astro add sitemap
```
Then create `public/robots.txt` pointing at `https://songer522.github.io/sitemap-index.xml`.

One caution specific to this domain: the blog at `songer522.github.io/blog/` is a
**different repo**. A `robots.txt` at the domain root applies to the whole origin,
including `/blog/`. Do not add `Disallow` rules casually — you would be making
crawl-policy decisions for the blog from this repo.

Confirm `@astrojs/sitemap` picks up both locales and emits `hreflang` alternates
matching the ones `BaseLayout` already renders.

---

## Phase 2 — Real content (the actual critical path)

The site is a well-built shell. Until this phase lands, none of Phase 1 or 3 makes it
useful. **This is gated on Yang, so start collecting material now, in parallel with
Phase 1.**

### 2.1 What Yang needs to supply

- A real avatar image (square, ≥400×400).
- The positioning statement — one or two lines, **in both languages**. Currently
  hardcoded placeholder text in `src/components/ProfileCard.astro` (lines with
  `占位定位文案` / `Placeholder positioning statement`).
- Real topic tags and real social URLs. `ProfileCard.astro` currently has three
  `<a href="#">` stubs for GitHub / X / Email.
- For each app: title, one-line summary, status, tags, cover screenshot, and real
  links.
- For each video: title, summary, the platform mirrors it exists on, cover, publish
  date.

### 2.2 Replace placeholder entries

Delete the six `placeholder-app-*` and six `placeholder-video-*` files as real entries
replace them. Keep the locale-parity invariant intact: **every slug must exist in both
`zh/` and `en/`** — `tests/locale-parity.test.ts` enforces this and will fail the build
otherwise. That test is doing real work here; do not weaken it to unblock a
half-translated entry.

### 2.3 Migrate `cover` to Astro's `image()` — only after real images exist

`src/content.config.ts` types `cover` as `z.string()` deliberately, because the
placeholders are SVGs in `public/`. Once real raster screenshots land, move them to
`src/assets/` and switch to:

```ts
import { defineCollection, z } from 'astro:content';
// schema: ({ image }) => z.object({ cover: image(), ... })
```

This buys width/height inference (no layout shift), automatic WebP/AVIF conversion, and
responsive `srcset` — all of which matter a lot for a screenshot-heavy portfolio, and
none of which work on `public/` SVGs. Update `ProjectCard.astro` and the detail pages
to render `<Image />` instead of `<img>`.

### 2.4 Tighten the schema once placeholders are gone

`links[].url` is `z.string()` because placeholders use `"#"`. Once real URLs are in,
change it to `z.string().url()` so a malformed link fails the build instead of shipping.
Do this **after** 2.2, not before — it will reject every placeholder.

### 2.5 Optional guard: report remaining placeholders

Add a test that greps `src/content/` and `ProfileCard.astro` for `占位` / `Placeholder`
and prints what is left. Keep it **reporting-only at first**, then flip it to failing
once Yang declares the content complete. The realistic failure mode here is not "we
forgot everything" — it is one stray placeholder card shipping among nine real ones.

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

1. **Now, in parallel:** Phase 1 as one PR (independent of Yang), and Yang starts
   gathering Phase 2 material.
2. **Then:** the v6 action upgrade (its own session, already prepped).
3. **Then:** Phase 2, incrementally — one real project at a time is fine, since parity
   is enforced per-slug.
4. **Then:** revisit Phase 3 with real traffic and real content to reason about.
