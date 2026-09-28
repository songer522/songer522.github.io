/**
 * Suggest a section for a new playlist entry from its title. Keep these rules
 * conservative: an ambiguous title belongs in "More vlogs" for manual review.
 * A category already stored in src/data/vlogs.ts always wins on later syncs.
 */
export function categoryFromTitle(title) {
  const text = title.normalize('NFKC').toLowerCase();

  if (/disney on ice/.test(text)) return 'occasions';
  if (/disney|epcot|magic kingdom|animal kingdom|hollywood studios?|castaway|cruise|sailing|royal caribbean|utopia of the seas?/.test(text)) return 'disney';
  if (/canada|quebec|banff|toronto|montreal|vancouver/.test(text)) return 'canada';
  if (/office|after work|at work|work vlog|software engineer/.test(text)) return 'work';
  if (/wisconsin|milwaukee|indianapolis|indiana|michigan|minnesota|galena|dubuque|kenosha|door county|rockford|starved rock|house on the rock|lake geneva|holy hill|great wolf lodge/.test(text)) return 'road';
  if (/birthday|christmas|halloween|trick or treat|egg hunt|gymnastics competition|national night out|grandpa|grandma/.test(text)) return 'occasions';
  if (/chicago|brookfield|field museum|botanic garden|morton arboretum|millennium park|millenium park|museum of science and industry|peggy notebaert|naper settlement/.test(text)) return 'local';

  return 'other';
}
