# songer522.github.io

Bilingual (中文 / English) personal home page, built with Astro. Static output, deployed
to GitHub Pages via GitHub Actions. Chinese is the default locale at the root; English
lives under `/en/`.

## Commands

| Command         | Action                                        |
| :--------------- | :--------------------------------------------- |
| `npm install`    | Install dependencies                          |
| `npm run dev`    | Start the local dev server at `localhost:4321` |
| `npm run build`  | Build the static site to `./dist/`             |
| `npm run preview`| Preview the production build locally           |
| `npm run test`   | Run the vitest suite (locale parity + routing) |
| `npx astro check`| Type-check `.astro` and `.ts` files            |
| `npm run sync:vlogs` | Refresh the vlog list from YouTube — see [Vlogs](#vlogs) |
| `npm run sync:weibo` | Rebuild the Weibo archive from a local export — see [Weibo archive](#weibo-archive) |

## Adding a project

Each app or video is a pair of Markdown files — one per locale, sharing the same slug
(filename), so the language switcher can jump between them.

**New app:**

1. `src/content/apps/zh/<slug>.md` and `src/content/apps/en/<slug>.md`.
2. Frontmatter: `title`, `summary`, `status`, `tags`, `cover`, `links`, `featured`, `order`.
3. `status` is one of:
   - `live` — shipped and available
   - `wip` — in progress
   - `free-tool` — a free tool/utility
4. `cover` is a plain path into `public/images/` (e.g. `/images/placeholders/app-1.svg`),
   not Astro's `image()` helper — see the migration note below.
5. Markdown body is the detail-page content.

**New video:** same idea in `src/content/videos/<locale>/<slug>.md`, with `cover`,
`publishedAt`, `featured`, and a `platforms` array — one entry per mirror of the same
video, e.g.:

```yaml
platforms:
  - { platform: youtube, id: dQw4w9WgXcQ }
  - { platform: bilibili, id: BV1xx411c7mD }
  - { platform: xiaohongshu, id: "https://www.xiaohongshu.com/explore/<id>" }
```

If the same video is posted to more than one platform, list every mirror on the *one*
entry — don't create a separate entry per platform, or the site will show duplicate
cards for the same content. `id` is the platform's video ID for `youtube`/`bilibili`;
`xiaohongshu` (RedNote) has no public embed API, so its `id` is the full post URL
instead.

`src/lib/video.ts` picks which mirror to embed, by locale preference order:

```
zh:  bilibili -> xiaohongshu -> youtube
en:  youtube  -> bilibili    -> xiaohongshu
```

zh puts reachability above playability — a RedNote card that links out beats an embed a
reader can't load at all. The remaining mirrors show as "also on" links below the
player. Platform names are localised too: bilibili renders as 哔哩哔哩 on the zh site,
and YouTube reads "YouTube（自备梯子）" — a wink at the fact that it needs a VPN there.

Only youtube and bilibili can embed; xiaohongshu has no embed API, so it always links
out. `tests/pick-primary-platform.test.ts` and `tests/platform-label.test.ts` pin both
behaviours.

Both collections are validated against a Zod schema in `src/content.config.ts` — a typo
in `status` or a missing required field fails the build instead of shipping a broken page.

A test in `tests/locale-parity.test.ts` fails the build if a `zh` slug doesn't have a
matching `en` slug (or vice versa), so a half-translated project can't go live silently.

## Vlogs

Vlogs are *not* a content collection — they're a plain list in `src/data/vlogs.ts`, one
`{ id, title }` per video, rendered as a thumbnail grid that links out to YouTube. Three
show on the home page; the rest live on `/vlogs/`. No detail pages, no per-locale copy,
so nothing for the locale-parity test to police.

They come from an **unlisted** YouTube playlist. Two consequences worth remembering:

- Unlisted means "not in search", not "private". Listing them here puts them on a public
  page, so `/vlogs/` carries a `noindex` robots tag and is filtered out of the sitemap
  (`astro.config.mjs`). That keeps search engines off; it does not hide anything from
  someone who opens the page.
- Thumbnails are downloaded into `public/images/vlogs/` rather than hotlinked, so
  loading the site doesn't call out to Google.

### Refreshing the list

After adding videos to the playlist:

```sh
npm run sync:vlogs -- --dry-run   # show what would change, write nothing
npm run sync:vlogs                # rewrite src/data/vlogs.ts, fetch new thumbnails
```

Then review `git diff`, commit and push. **The script never commits or pushes** — this
playlist is family video and the site is public, so a person should read the diff first.

**Setup (one time).** It needs a YouTube Data API v3 key, because unlisted playlists have
no RSS feed. Create one in the Google Cloud Console (enable *YouTube Data API v3*, then
Credentials → API key — a plain key, **not** a service account, which YouTube rejects),
restrict it to that one API, and put it in `.env` at the repo root:

```
YOUTUBE_API_KEY=AIza...
```

`.env` is gitignored. The free quota is 10,000 units/day and a sync costs about 1.

**What it does.** Adds videos new to the playlist, drops ones removed from it, fetches
thumbnails for new ids only (trimming YouTube's letterboxing), and sorts the list newest
first by filming date.

**That date comes from the video's YouTube description**, which has to contain a line
like `Date: 2024.08.24`; it is shown under the title on the site. The upload date is no
use for ordering — most of this playlist went up in one batch, so uploads cluster in 2025
while the footage spans years. A video whose description has no such line still appears,
undated, at the end of the list, and the sync says so.

**What it deliberately won't do:**

| Situation | Behaviour |
| :--- | :--- |
| You renamed a title in `vlogs.ts` | Keeps yours forever; reports the drift so you can decide |
| You edited a date in `vlogs.ts` | Overwrites it from the description — edit the date on YouTube |
| Playlist returns nothing | Refuses to write, so an API blip can't wipe the section |
| An entry it can't parse | Stops, rather than rewriting your hand edits away |
| Video deleted or made private | Skips it — those keep a playlist slot with a placeholder title |
| Thumbnail left over from a removed video | Reports it; deleting is your call |

Dates are the one thing that works the other way round, because the description is where
you edit them and there is no privacy reason to hold a local value. A stored date does
survive if the description stops parsing, so a typo there cannot silently unsort the list.

That first row is the important one: **titles in `vlogs.ts` are yours to edit.** Several
videos are titled in bare emoji on YouTube and read better renamed here, and some name
family members you may not want on a public page. Rename them in `vlogs.ts` — the sync
will preserve it and leave YouTube untouched.

The merge rules (`scripts/lib/merge-vlogs.mjs`), the file parser
(`scripts/lib/vlogs-file.mjs`) and the date parsing and ordering
(`scripts/lib/vlog-date.mjs`) are pure and unit-tested; the network and image work stays
in `scripts/sync-vlogs.mjs`.

## Weibo archive

`/weibo/` is 1,223 posts written on Weibo between 2009 and 2025, filtered by year the
way the [blog archive](https://github.com/songer522/blog) is. Like the vlogs it is not a
content collection — it is generated data in `src/data/weibo.json`, with types and
derived counters in `src/lib/weibo.ts`. Nobody hand-edits the JSON; rerun the sync.

The English side gets `/en/weibo/`: the counters and a link through. The posts are
Chinese and stay Chinese, so rendering 1,223 of them under English chrome would be a
page no English reader can use.

**Dates are Beijing wall-clock strings, never `Date` objects.** A post written at 23:59
in Shanghai has to stay on that day for a reader in Chicago, and "on this day" has to
mean the same date everywhere. `scripts/lib/weibo-date.mjs` is where that is enforced.

### Rebuilding it

The export is not in the repo — it is 66 MB, most of it originals. Point the script at
wherever it lives:

```sh
npm run sync:weibo -- --dry-run              # report only, write nothing
npm run sync:weibo                           # write src/data/weibo.json + images
npm run sync:weibo -- --source ~/path/to/export --quality 60 --width 800
npm run sync:weibo -- --force                # re-encode images that already exist
```

It expects `weibo-posts.json` and `weibo-images/` in the source directory, and defaults
to `~/Workspace/Weibo` (override with `--source` or `WEIBO_EXPORT_DIR`). Already-built
images are reused unless `--force`, so a rerun is fast.

Then review `git diff`, commit and push. **The script never commits or pushes.**

Three things about the export that cost time to work out, so they are worth stating:

- **No image reference matches its file by name.** Two eras of Weibo naming were
  downloaded with two different manglings — `&690` became `_690.jpg`, and newer
  references had their extension doubled (`…qae.jpg.jpg`). `scripts/lib/weibo-images.mjs`
  resolves both; `tests/weibo-images.test.ts` holds it to the real export when that
  export is on the machine, and skips otherwise.
- **17 of the 28 video covers no longer exist anywhere.** They were hosted on Miaopai,
  whose CDN no longer resolves. The 11 that survive are downloaded rather than hotlinked,
  for exactly the reason the other 17 are gone. Those posts render as text.
- **Photos are recompressed to WebP at 800px**, about 16 MB for 487 images against 46 MB
  of originals. Width is barely a lever — the originals cap at 1000px — so size is a
  quality decision, and the twenty largest files are only 13% of the total. The script
  prints what it wrote and warns past 18 MB; check that number before committing,
  because this repo keeps it in history for good.

### On this day

The archive opens on posts made on today's date in past years, falling back to one at
random when the date is empty (28 of them are). The homepage carries the same thing as a
short strip.

Neither can be server-rendered: a static build freezes the date at deploy time, and the
site only rebuilds on push. So the archive page ships every post and filters in the
browser, and the homepage fetches a single small file from
`/weibo/on-this-day/<MM-DD>.json` — 366 of them are generated, about 2 KB each.

With scripting off, `/weibo/` still renders every post under its year heading: the
filtering rules are all scoped to a `.js` class set in `BaseLayout.astro`. The heatmap is
the one thing that needs scripting, since without it there is no year to select.

## `cover` → `image()` migration

`cover` is a plain string path so placeholder SVGs are frictionless. Once real raster
screenshots exist, migrate the schema to Astro's `image()` helper for automatic
optimization (responsive sizes, format conversion) — update `src/content.config.ts` and
the `<img>` usages in `ProjectCard.astro`, `VideoEmbed.astro`, and the detail pages.

## i18n

UI chrome strings (nav, labels, badges) live in `src/i18n/ui.ts`. Content strings live in
the Markdown files themselves. Routing is directory-based — real files under
`src/pages/en/…` — not generated by Astro's i18n routing middleware, so every URL is
greppable. `src/i18n/utils.ts` has the helpers (`localeOf`, `slugOf`, `t`,
`switchLocalePath`) that every page and component uses.

## Out of scope

Newsletter, custom domain, analytics, RSS, dark mode, search, comments — see `PLAN.md`
for the full rationale.
