/**
 * The anchor a post card carries, defined once.
 *
 * Three places need to agree on it: the card that renders the id, the homepage strip
 * that links to it, and the archive that reads it back off the URL to decide which
 * view to open. When each spelled it out for itself, the archive could open on a view
 * that hid the very card the link pointed at.
 */

/** The `id` attribute on a post card. */
export const cardElementId = (id) => `w-${id}`;

/** The href fragment that points at one. */
export const cardAnchor = (id) => `#${cardElementId(id)}`;

/**
 * The post id in a URL fragment, or null when the fragment points at something else.
 *
 * @param {string | null | undefined} hash e.g. `#w-QdfExstG5`
 * @returns {string | null}
 */
export function cardIdFromHash(hash) {
  const match = /^#w-(.+)$/.exec(String(hash ?? ''));
  if (!match) return null;

  try {
    // A shared link may arrive percent-encoded.
    return decodeURIComponent(match[1]);
  } catch {
    // Malformed encoding — take the fragment as written rather than throwing.
    return match[1];
  }
}
