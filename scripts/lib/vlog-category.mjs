/**
 * Suggest a section for a new playlist entry from its title. Keep these rules
 * conservative: an ambiguous title belongs in "More vlogs" for manual review.
 * A category already stored in src/data/vlogs.ts always wins on later syncs.
 */
export function categoryFromTitle(title) {
  const text = title.normalize('NFKC').toLowerCase();

  if (/\bdisney on ice\b/.test(text)) return 'occasions';
  if (/\b(disney|epcot|magic kingdom|animal kingdom|hollywood studios?|royal caribbean|utopia of the seas?)\b/.test(text)) return 'disney';
  if (/\b(canada|quebec|banff|toronto|montreal|vancouver)\b/.test(text)) return 'canada';

  // These places are local even when a broader trip word also appears.
  if (/\b(michigan avenue|lake michigan)\b/.test(text)) return 'local';
  if (/\b(wisconsin|milwaukee|indianapolis|indiana|michigan|minnesota|galena|dubuque|kenosha|door county|rockford|starved rock|house on the rock|lake geneva|holy hill|great wolf lodge)\b/.test(text)) return 'road';
  if (/\b(birthday|christmas|halloween|trick or treat|egg hunt|gymnastics competition|national night out|grandpa|grandma)\b/.test(text)) return 'occasions';
  if (/\b(office|after work|at work|work vlog|software engineer)\b/.test(text)) return 'work';
  if (/\b(chicago|brookfield|field museum|botanic garden|morton arboretum|millennium park|millenium park|museum of science and industry|peggy notebaert|naper settlement)\b/.test(text)) return 'local';

  return 'other';
}
