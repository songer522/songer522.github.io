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
thumbnails for new ids only (trimming YouTube's letterboxing), and keeps playlist order.

**What it deliberately won't do:**

| Situation | Behaviour |
| :--- | :--- |
| You renamed a title in `vlogs.ts` | Keeps yours forever; reports the drift so you can decide |
| Playlist returns nothing | Refuses to write, so an API blip can't wipe the section |
| An entry it can't parse | Stops, rather than rewriting your hand edits away |
| Video deleted or made private | Skips it — those keep a playlist slot with a placeholder title |
| Thumbnail left over from a removed video | Reports it; deleting is your call |

That first row is the important one: **titles in `vlogs.ts` are yours to edit.** Several
videos are titled in bare emoji on YouTube and read better renamed here, and some name
family members you may not want on a public page. Rename them in `vlogs.ts` — the sync
will preserve it and leave YouTube untouched.

The merge rules (`scripts/lib/merge-vlogs.mjs`) and the file parser
(`scripts/lib/vlogs-file.mjs`) are pure and unit-tested; the network and image work stays
in `scripts/sync-vlogs.mjs`.

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
