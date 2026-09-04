/**
 * Bridging the export's image references to the files that were actually downloaded.
 *
 * Not one of the 487 references in `weibo-posts.json` matches a filename in
 * `weibo-images/` directly. Two eras of Weibo naming are mixed together, and the
 * downloader mangled each differently:
 *
 *   ref `45fb1888495891bbc9b31&690`                -> `45fb1888495891bbc9b31_690.jpg`
 *        (old style, no extension; `&` became `_` and an extension was appended)  79 refs
 *
 *   ref `45fb1888gy1i77k91wprrj20u0140qae.jpg`     -> `...qae.jpg.jpg`
 *        (new style, already had an extension; another one was appended anyway)  408 refs
 *
 * So the rule is the same in both cases — replace `&`, then append an extension — and
 * the only unknown is which extension. We return candidates in order and let the
 * caller take the first that exists on disk. One animated GIF is stored under `.jpg`
 * despite being a GIF, which is why both extensions are always tried.
 */

const EXTENSIONS = ['.jpg', '.gif', '.jpeg', '.png', '.webp'];

/** The reference with Weibo's `&` size suffix turned into the `_` the files use. */
const normalize = (ref) => String(ref ?? '').replace(/&/g, '_');

/**
 * Filenames to look for in `weibo-images/`, best guess first.
 *
 * @param {string} ref one entry from a post's `p` array
 * @returns {string[]}
 */
export function imageCandidates(ref) {
  const base = normalize(ref);

  return [
    // The doubled-extension case and the appended-extension case are the same shape.
    ...EXTENSIONS.map((ext) => base + ext),
    // The file as named, in case a future export is downloaded without the mangling.
    base,
  ];
}

/**
 * Stable output basename for a reference, without extension. Derived from the
 * reference rather than from whichever file happened to match, so re-running the sync
 * against a re-downloaded export produces the same filenames and the same git diff.
 *
 * @param {string} ref
 * @returns {string}
 */
export function imageSlug(ref) {
  return normalize(ref).replace(/\.(jpe?g|gif|png|webp)$/i, '');
}
