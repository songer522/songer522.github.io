/**
 * The Weibo archive's behaviour in the browser: which view opens, and what the tabs do.
 *
 * This lives in a module rather than inline in WeiboArchive.astro so that the code the
 * page runs is the code the tests run. `tests/weibo-archive-ui.test.ts` drives it
 * against a real DOM.
 *
 * The filtering itself is left to CSS. Cards carry `data-year` and `data-md`, the
 * container carries the active view, and WeiboArchive generates a rule per year — so a
 * tab click writes one attribute rather than walking 1,223 elements.
 */
import { beijingMonthDay } from './weibo-date.mjs';
import { pickRandom } from './weibo-on-this-day.mjs';
import { cardElementId, cardIdFromHash } from './weibo-anchor.mjs';

/**
 * @param {Element | null} [root] the archive container; found in the document if omitted
 * @returns {boolean} whether there was an archive to wire up
 */
export function initArchive(root = document.querySelector('.weibo-archive')) {
  if (!root) return false;

  const archive = /** @type {HTMLElement} */ (root);
  const label = archive.querySelector('[data-count]');
  const tabs = [...archive.querySelectorAll('.weibo-tabs button')];
  const cards = [...archive.querySelectorAll('.weibo-card')];

  const total = archive.dataset.total ?? '0';
  const yearCounts = JSON.parse(archive.dataset.yearCounts ?? '{}');

  const monthDay = beijingMonthDay();
  let todays = cards.filter((card) => card.dataset.md === monthDay);

  // Nothing on this date in sixteen years of posting — 28 dates are like this. Rather
  // than show an empty archive, turn up one post at random and say that is what
  // happened.
  const drewRandom = todays.length === 0;
  if (drewRandom) {
    const one = pickRandom(cards);
    todays = one ? [one] : [];
  }

  for (const card of todays) card.classList.add('is-today');

  const show = (view) => {
    archive.dataset.view = view;
    for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.dataset.view === view));

    if (!label) return;

    if (view === 'all') {
      label.textContent = (archive.dataset.labelAll ?? '').replace('{n}', total);
    } else if (view === 'today') {
      label.textContent = drewRandom
        ? (archive.dataset.labelTodayEmpty ?? '')
        : (archive.dataset.labelToday ?? '').replace('{n}', String(todays.length));
    } else {
      label.textContent = (archive.dataset.labelYear ?? '')
        .replace('{year}', view)
        .replace('{n}', String(yearCounts[view] ?? 0));
    }
  };

  for (const tab of tabs) {
    tab.addEventListener('click', () => show(tab.dataset.view ?? 'all'));
  }

  /**
   * A link that names a post wins over the default view.
   *
   * Without this, `/weibo/#w-<id>` opens on 那年今日 and the filter hides the very card
   * the link pointed at — the reader lands on someone else's post, or on nothing. The
   * homepage strip hits this every time a date has no posts in past years, since it
   * and the archive draw at random independently, and so does any shared or bookmarked
   * link to a single post.
   */
  const targeted = () => {
    const id = cardIdFromHash(globalThis.location?.hash);
    if (!id) return null;

    // The id comes off the URL, so escape it before it becomes a selector.
    return archive.querySelector(`#${CSS.escape(cardElementId(id))}`);
  };

  const reveal = (card) => {
    show(card.dataset.year ?? 'all');
    // The browser already tried to jump here, while the card was still hidden.
    card.scrollIntoView();
  };

  const target = targeted();
  if (target) reveal(target);
  else show('today');

  // A fragment can also arrive after load, from a link elsewhere on the page.
  globalThis.addEventListener?.('hashchange', () => {
    const card = targeted();
    if (card) reveal(card);
  });

  return true;
}
