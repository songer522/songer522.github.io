// Videos from the unlisted "Vlog" YouTube playlist, newest first by filming date.
//
// That date comes from the video's YouTube description, which reads `Date: 2024.08.24`.
// The upload date is no use for ordering: most of these went up in one batch, so it
// says nothing about when the thing filmed actually happened ("2024 Disney Day 1" was
// uploaded in 2025).
//
// Regenerate with `npm run sync:vlogs`. Titles here are intentionally sticky: the
// sync never overwrites one you have edited, it only reports that it has drifted.
// Dates are not — they track the description, which is where you edit them.
export interface Vlog {
  id: string;
  title: string;
  /** YYYY-MM-DD, absent when the description carries no usable `Date:` line. */
  date?: string;
}

export const playlistUrl =
  'https://www.youtube.com/playlist?list=PLYThmuvRX57DaI0cAAHAji7hJIPOcPOe3';

export const vlogs: Vlog[] = [
  { id: '0T8TbgsQ39o', title: 'Naper Settlement Field Trip', date: '2025-10-18' },
  { id: 'Ng8pVpZI0dg', title: 'Matthiessen State Park', date: '2025-08-25' },
  { id: '6sAuqLp9TPk', title: 'Blackberry Farm', date: '2025-08-23' },
  { id: 'rv7JoL6GQj4', title: 'Seven Bridges and Kenosha', date: '2025-08-17' },
  { id: 'aFjh9qPzPmg', title: 'Stade farm veggie picking', date: '2025-08-17' },
  { id: '-Hn9HQ7pYuE', title: 'Peggy Notebaert and downtown', date: '2025-08-09' },
  { id: 'osAsmIuXKs8', title: 'A day at work', date: '2025-08-07' },
  { id: 's4x28YMWHL8', title: 'National night out 2025', date: '2025-08-05' },
  { id: 'Ou7_2VMoFeg', title: 'Field Museum 2025', date: '2025-07-20' },
  { id: 'X6SY9bZUKaI', title: 'Minnesota Trip 2025', date: '2025-07-04' },
  { id: 'tA6S6gHKO9A', title: 'Trip to Galena and Dubuque 2025', date: '2025-06-25' },
  { id: 'thphfjc6M1U', title: 'Door County Wisconsin 2025', date: '2025-05-25' },
  { id: 'FjsncZwtNXQ', title: 'Royal Caribbean Utopia of the Sea 2025', date: '2025-05-12' },
  { id: 'l34dAleBF3c', title: 'Kennedy Center and Animal Kingdom', date: '2025-05-10' },
  { id: 't8sT7_adOsU', title: 'Birthday Trip to Indianapolis', date: '2025-03-08' },
  { id: 'WZtZ4zVjIOU', title: 'Christmas 2024', date: '2024-12-25' },
  { id: 'Pon7vc6ULIc', title: 'School Christmas Show 2024', date: '2024-12-13' },
  { id: 'TRuTFzP1w7w', title: 'Trip to Banff Canada', date: '2024-12-03' },
  { id: 'yx7WyZf8Ohc', title: 'Wisconsin State Fair 2024', date: '2024-08-11' },
  { id: 'Q6S2gzVhS6s', title: '2024 2nd trip，Disney day 5 castaway keys', date: '2024-08-11' },
  { id: 'ddmBvsVfXK4', title: 'Grandpa & Grandma visiting Chicago', date: '2024-08-11' },
  { id: 'jRwakGUQfjQ', title: '2024 2nd trip，Disney day 4 Nassu', date: '2024-08-10' },
  { id: '0R0Udsis9-g', title: '2024 2nd trip，Disney day 3 Sailing day', date: '2024-08-09' },
  { id: '2JDK1f1ysH0', title: '2024 2nd trip，Disney day 2 epcot', date: '2024-08-08' },
  { id: 'DDKFsXB2olg', title: '2024 2nd trip，Disney day 1 arrival', date: '2024-08-07' },
  { id: 'vTpww3IXqZE', title: 'Taste of Wisconsin & Nature Museum 2024', date: '2024-07-27' },
  { id: 'ULMQPXa6AIA', title: 'Raneissance Fair 2024', date: '2024-07-20' },
  { id: '4RmcyRNiCk0', title: 'Bluey museum and Millenium Park 2024', date: '2024-07-13' },
  { id: 'cIPL9kQlcQE', title: 'Indianapolis 2024', date: '2024-07-04' },
  { id: 'eSmMOPMFZU4', title: 'Starved Rock 2024', date: '2024-06-14' },
  { id: 'WS3borGwqPg', title: 'Strawberry Picking', date: '2024-06-08' },
  { id: 'CfLnv-Memv0', title: 'Epic & House on The Rock 2024', date: '2024-05-27' },
  { id: 'lBIMY-GNH9I', title: 'Field Museum 2024', date: '2024-05-18' },
  { id: 'hoU-iiQuiJg', title: 'Tesla pick up', date: '2024-05-13' },
  { id: 'hk8c4ht9hQQ', title: 'Botonic Garden and Beach', date: '2024-05-12' },
  { id: 'dhdBkfDZ7j0', title: 'A 6th Birthday', date: '2024-04-20' },
  { id: 'OF1sEsZDH-Q', title: 'Milwaukee Zoo 2024', date: '2024-04-13' },
  { id: 'pbjkgBjwGBs', title: 'A Birthday 2024', date: '2024-04-12' },
  { id: 'x-AsI2TfBiM', title: 'Morton arboretum & Rockford 2024', date: '2024-04-06' },
  { id: 'PUNZOmTYb4M', title: 'Grandpa and grandma is here', date: '2024-04-03' },
  { id: 'WB-MMiAOuOQ', title: 'MSI & Zoo 2024', date: '2024-03-30' },
  { id: 'qR0fqqyXxBU', title: 'Egg hunt at Twin Lake 2024', date: '2024-03-26' },
  { id: 'gFhedFWAgfU', title: 'Egg Hunt Brookfield Zoo 2024', date: '2024-03-22' },
  { id: 'RWtxtSgcQy4', title: 'Mitchel Park Dome&MCM 2024', date: '2024-03-16' },
  { id: 'h_AUSt1_TH4', title: 'Botanic Garden And Steak House 2024', date: '2024-03-15' },
  { id: '3N-dCpksO3w', title: 'A 4th Birthday', date: '2024-03-09' },
  { id: 'Ap74Ltp46Q4', title: '2024 Disney Day 5 Departure', date: '2024-02-28' },
  { id: 'fRTGx35jNgk', title: '2024 Disney Day 4 Hollywood Studio', date: '2024-02-27' },
  { id: '6D-rXLpIXFY', title: '2024 Disney Day 3 Magic Kingdom', date: '2024-02-26' },
  { id: '9IHbM_-ljm4', title: '2024 Disney Day 2 Epcot', date: '2024-02-25' },
  { id: '-QvcaBx7orI', title: '2024 Disney Day 1 Arrival', date: '2024-02-24' },
  { id: 'npQhWeg3VfU', title: 'A day in office 2024', date: '2024-01-23' },
  { id: 'lJDkw_flhXw', title: 'Disney on Ice 2023', date: '2024-01-20' },
  { id: 'aBMWqGZsoyU', title: 'Christmas gift opening 2023', date: '2023-12-25' },
  { id: 'zGNfukTE9eM', title: 'Museum of Science and Industry visit October 2023', date: '2023-11-14' },
  { id: 'PGZo5xfEEkI', title: 'Chicago Botanic Garden fall 2023', date: '2023-11-13' },
  { id: '348grJjhMdg', title: 'My Birthday 2023', date: '2023-11-06' },
  { id: 'vMCx1OPpYBI', title: 'Apple Picking & Lake Geneva 2023', date: '2023-11-04' },
  { id: 'CdizKE2QQvo', title: 'Trick or treat at school 2023', date: '2023-10-31' },
  { id: 'pVcyS3qE2Qw', title: 'Grandma & Grandpa visiting', date: '2023-10-07' },
  { id: 'riMclChd9Pg', title: '🎃🏎️⛸️Bengtson\'s Farm & Monster Truck', date: '2023-09-16' },
  { id: 'aUISfd7q19c', title: '🧙🏻‍♂️🎠⛩️Epic system tour & House on the rock', date: '2023-09-02' },
  { id: 'zk_On_r__NI', title: '🐺💦🐒⛱️Great wolf lodge, Milwaukee zoo, Umbrella sky', date: '2023-08-22' },
  { id: 'kI9aVHS7jRw', title: '🧑🏻‍💻🏙️A day in life as a software engineer in Chicago', date: '2023-08-18' },
  { id: '09HXyQtwtsA', title: '🎡🏇🏽🎶Wisconsin State Fair 2023', date: '2023-08-13' },
  { id: '57LZDsBMrEk', title: '⛹️‍♂️🍲🧑🏽‍🍳做个饭 - 美食作家版', date: '2023-08-10' },
  { id: '4bz5BK8qkZU', title: '🎭🍗🔨🏴‍☠️Renaissance fair Bristol Wisconsin', date: '2023-08-06' },
  { id: 'DFwCLha82Fk', title: '🐶🐜🤿🍦', date: '2023-08-03' },
  { id: 'cxLvrdupI8o', title: '🐊🐍🎈🤡National night out at RM park district', date: '2023-07-31' },
  { id: 'iz1zCAYXeIA', title: '🦖🏛️🌾Children\'s Museum of Indianapolis 2023', date: '2023-07-28' },
  { id: 'kTt2JUHh2wo', title: '🍚。做个饭', date: '2023-07-26' },
  { id: 'Eg8RndiKzv0', title: '⚾️Baseball game at Melas park', date: '2023-07-24' },
  { id: 'N0ZDL6Ri25M', title: '🌺A day at Morton arboretum.', date: '2023-07-23' },
];
