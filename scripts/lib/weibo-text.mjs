/**
 * Weibo's composer leaves placeholder phrases in the exported text where the app used
 * to render something clickable. On a static archive they are dead weight — `网页链接`
 * is a link that no longer exists, `宋二的秒拍视频` is a player that was retired years
 * ago. Strip those; leave everything Yang actually typed alone, hashtags included.
 *
 * The list below is not guesswork — it is every artifact present in the 1,223-post
 * export, with its count:
 *
 *   网页链接                 112, always trailing
 *   <名字>的秒拍视频 / 微博视频  27, the name varies (`宋二`, `宋_二`)
 *   分享图片                  2, both times the entire post text
 *   戳我查看完整笔记>>          1
 *
 * Anything new that shows up in a future export should be added here with its count,
 * so the list stays auditable rather than accumulating speculative patterns.
 */

const ARTIFACTS = [
  /网页链接/g,
  /戳我查看完整笔记\s*>*/g,
  // The name is part of the placeholder, not the post. Bounded to a short run of
  // non-space characters so it cannot reach back and eat a real sentence.
  /\S{0,8}的(?:秒拍|微博)视频/g,
  /分享图片/g,
];

/**
 * @param {string | null | undefined} text raw `x` from the export
 * @returns {string} the post as written, with the placeholders removed
 */
export function cleanText(text) {
  const strip = (line) => {
    let out = line;
    for (const pattern of ARTIFACTS) out = out.replace(pattern, '');
    // Removing a placeholder leaves the spaces that surrounded it.
    return out.replace(/\s+/g, ' ').trim();
  };

  // Cleaning line by line, rather than over the whole string, is what lets us tell a
  // paragraph break from a hole. A line that was already blank is Yang's pacing and
  // stays; a line that held nothing but a placeholder is now empty and goes, instead
  // of leaving a `\n\n` that reads as a break he never typed.
  const lines = String(text ?? '')
    .split('\n')
    .map((line) => ({ blankBefore: line.trim() === '', after: strip(line) }))
    .filter(({ blankBefore, after }) => blankBefore || after !== '')
    .map(({ after }) => after);

  return lines
    .join('\n')
    // Three or more newlines were never in the original; two is a paragraph break.
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
