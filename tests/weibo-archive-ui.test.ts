/**
 * @vitest-environment happy-dom
 *
 * The archive's browser behaviour, driven against a real DOM.
 *
 * Everything else in this suite tests pure functions, which is why the bug this file
 * exists for got through: `/weibo/#w-<id>` opened on 那年今日, and that filter hid the
 * very card the link named. No amount of unit testing on the helpers would have caught
 * it — the defect was in the wiring.
 *
 * The markup below mirrors what WeiboArchive.astro and WeiboCard.astro render. The
 * contract between them is a small set of attributes, and the last describe block
 * guards those names against drifting apart.
 */
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initArchive } from '../scripts/lib/weibo-archive-ui.mjs';
import { cardAnchor, cardElementId } from '../scripts/lib/weibo-anchor.mjs';

interface Post {
  id: string;
  date: string;
}

const LABELS = {
  today: '历年今天的 {n} 篇',
  todayEmpty: '今天没有旧帖，随手翻到这条',
  year: '{year} 年的 {n} 篇',
  all: '全部 {n} 篇',
};

function render(posts: Post[]) {
  const years = [...new Set(posts.map((p) => p.date.slice(0, 4)))].sort().reverse();
  const counts = Object.fromEntries(
    years.map((y) => [y, posts.filter((p) => p.date.startsWith(y)).length]),
  );

  document.body.innerHTML = `
    <section class="weibo-archive" data-view="all"
      data-total="${posts.length}"
      data-year-counts='${JSON.stringify(counts)}'
      data-label-today="${LABELS.today}"
      data-label-today-empty="${LABELS.todayEmpty}"
      data-label-year="${LABELS.year}"
      data-label-all="${LABELS.all}">
      <div class="weibo-tabs">
        <button data-view="today"></button>
        ${years.map((y) => `<button data-view="${y}"></button>`).join('')}
        <button data-view="all"></button>
      </div>
      <p class="weibo-count" data-count></p>
      <div class="weibo-list">
        ${posts
          .map(
            (p) =>
              `<article class="weibo-card" id="${cardElementId(p.id)}"` +
              ` data-year="${p.date.slice(0, 4)}" data-md="${p.date.slice(5)}"></article>`,
          )
          .join('')}
      </div>
    </section>`;

  return {
    archive: document.querySelector('.weibo-archive') as HTMLElement,
    label: document.querySelector('[data-count]') as HTMLElement,
    card: (id: string) => document.getElementById(cardElementId(id)) as HTMLElement,
    tab: (view: string) => document.querySelector(`button[data-view="${view}"]`) as HTMLElement,
  };
}

const POSTS: Post[] = [
  { id: 'today-a', date: '2010-03-09' },
  { id: 'today-b', date: '2018-03-09' },
  { id: 'other-2010', date: '2010-12-31' },
  { id: 'other-2018', date: '2018-06-01' },
  { id: 'lone-2023', date: '2023-07-04' },
];

/** 2026-03-09 06:00 UTC is 14:00 on 03-09 in Beijing. */
const ON_A_DAY_WITH_POSTS = new Date('2026-03-09T06:00:00Z');
/** 04-20 is one of the 28 dates with nothing on them. */
const ON_AN_EMPTY_DAY = new Date('2026-04-20T06:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  window.location.hash = '';
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('opening view', () => {
  it('opens on today, marking every post from this day in past years', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    const dom = render(POSTS);

    initArchive();

    expect(dom.archive.dataset.view).toBe('today');
    expect(dom.card('today-a').classList.contains('is-today')).toBe(true);
    expect(dom.card('today-b').classList.contains('is-today')).toBe(true);
    expect(dom.card('other-2010').classList.contains('is-today')).toBe(false);
    expect(dom.label.textContent).toBe('历年今天的 2 篇');
  });

  it('uses the Beijing day, not the day where the reader is', () => {
    // 18:00 UTC on 03-08 is already 02:00 on 03-09 in Beijing.
    vi.setSystemTime(new Date('2026-03-08T18:00:00Z'));
    const dom = render(POSTS);

    initArchive();

    expect(dom.card('today-a').classList.contains('is-today')).toBe(true);
  });

  it('draws exactly one post at random when the date has none', () => {
    vi.setSystemTime(ON_AN_EMPTY_DAY);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const dom = render(POSTS);

    initArchive();

    expect(dom.archive.dataset.view).toBe('today');
    expect(POSTS.filter((p) => dom.card(p.id).classList.contains('is-today'))).toHaveLength(1);
    expect(dom.card('today-a').classList.contains('is-today')).toBe(true);
    expect(dom.label.textContent).toBe(LABELS.todayEmpty);
  });

  it('says nothing at all when there are no posts', () => {
    vi.setSystemTime(ON_AN_EMPTY_DAY);
    const dom = render([]);

    expect(initArchive()).toBe(true);
    expect(dom.label.textContent).toBe(LABELS.todayEmpty);
  });

  it('reports when there is no archive on the page', () => {
    document.body.innerHTML = '';
    expect(initArchive()).toBe(false);
  });
});

describe('a link that names a post', () => {
  // The regression this file was written for.
  it('opens that post’s year instead of the today filter that would hide it', () => {
    vi.setSystemTime(ON_AN_EMPTY_DAY);
    window.location.hash = cardAnchor('other-2010');
    const dom = render(POSTS);

    initArchive();

    expect(dom.archive.dataset.view).toBe('2010');
    expect(dom.tab('2010').getAttribute('aria-selected')).toBe('true');
    expect(dom.tab('today').getAttribute('aria-selected')).toBe('false');
    expect(dom.label.textContent).toBe('2010 年的 2 篇');
  });

  it('works even when the named post is from today', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    window.location.hash = cardAnchor('today-b');
    render(POSTS);

    initArchive();

    expect((document.querySelector('.weibo-archive') as HTMLElement).dataset.view).toBe('2018');
  });

  it('scrolls to the card, which the browser could not reach while it was hidden', () => {
    vi.setSystemTime(ON_AN_EMPTY_DAY);
    window.location.hash = cardAnchor('lone-2023');
    const dom = render(POSTS);
    const scrollIntoView = vi.fn();
    dom.card('lone-2023').scrollIntoView = scrollIntoView;

    initArchive();

    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('falls back to today for a fragment that names nothing', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);

    for (const hash of ['', '#timeline', '#w-not-a-post']) {
      window.location.hash = hash;
      const dom = render(POSTS);

      initArchive();

      expect(dom.archive.dataset.view, `hash ${JSON.stringify(hash)}`).toBe('today');
    }
  });

  it('follows a fragment that arrives after load', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    const dom = render(POSTS);

    initArchive();
    expect(dom.archive.dataset.view).toBe('today');

    window.location.hash = cardAnchor('lone-2023');
    window.dispatchEvent(new window.Event('hashchange'));

    expect(dom.archive.dataset.view).toBe('2023');
  });
});

describe('tabs', () => {
  it('switches the view and relabels the count', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    const dom = render(POSTS);
    initArchive();

    dom.tab('2010').click();
    expect(dom.archive.dataset.view).toBe('2010');
    expect(dom.label.textContent).toBe('2010 年的 2 篇');

    dom.tab('all').click();
    expect(dom.archive.dataset.view).toBe('all');
    expect(dom.label.textContent).toBe('全部 5 篇');

    dom.tab('today').click();
    expect(dom.archive.dataset.view).toBe('today');
    expect(dom.label.textContent).toBe('历年今天的 2 篇');
  });

  it('marks exactly one tab selected at a time', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    const dom = render(POSTS);
    initArchive();

    dom.tab('2018').click();

    const selected = [...document.querySelectorAll('button')].filter(
      (t) => t.getAttribute('aria-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
    expect(selected[0].dataset.view).toBe('2018');
  });

  it('leaves no placeholder unreplaced in any label', () => {
    vi.setSystemTime(ON_A_DAY_WITH_POSTS);
    const dom = render(POSTS);
    initArchive();

    for (const view of ['today', '2010', '2018', '2023', 'all']) {
      dom.tab(view).click();
      expect(dom.label.textContent, `view ${view}`).not.toMatch(/\{n\}|\{year\}/);
    }
  });
});

// The fixture above stands in for the components. If they stop rendering the
// attributes it relies on, these tests would keep passing while the page broke.
describe('the fixture still matches the components', () => {
  const card = readFileSync('src/components/WeiboCard.astro', 'utf8');
  const archive = readFileSync('src/components/WeiboArchive.astro', 'utf8');

  it('WeiboCard renders the attributes the filtering reads', () => {
    expect(card).toContain('id={cardElementId(post.id)}');
    expect(card).toContain('data-year=');
    expect(card).toContain('data-md=');
    expect(card).toContain('class="weibo-card"');
  });

  it('WeiboArchive renders the container attributes the labels read', () => {
    for (const attr of [
      'data-total',
      'data-year-counts',
      'data-label-today',
      'data-label-today-empty',
      'data-label-year',
      'data-label-all',
    ]) {
      expect(archive, attr).toContain(attr);
    }
    expect(archive).toContain('data-count');
    expect(archive).toContain('class="weibo-tabs"');
  });

  it('WeiboArchive runs the module these tests drive', () => {
    expect(archive).toContain("from '../../scripts/lib/weibo-archive-ui.mjs'");
    expect(archive).toContain('initArchive()');
  });
});
