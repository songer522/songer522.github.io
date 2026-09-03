// Videos from the unlisted "Vlog" YouTube playlist, in playlist order.
// Upload dates are not shown: most of these were uploaded in one batch, so the
// upload date says nothing about when the thing filmed actually happened
// ("2024 Disney Day 1" was uploaded in 2025).
//
// Regenerate with `npm run sync:vlogs`. Titles here are intentionally sticky: the
// sync never overwrites one you have edited, it only reports that it has drifted.
export interface Vlog {
  id: string;
  title: string;
}

export const playlistUrl =
  'https://www.youtube.com/playlist?list=PLYThmuvRX57DaI0cAAHAji7hJIPOcPOe3';

export const vlogs: Vlog[] = [
  { id: 'TRuTFzP1w7w', title: 'Banff Canada' },
  { id: 'Pon7vc6ULIc', title: 'School Christmas Show 2024' },
  { id: 'yx7WyZf8Ohc', title: 'Wisconsin State Fair 2024' },
  { id: 'WZtZ4zVjIOU', title: 'Christmas 2024' },
  { id: 't8sT7_adOsU', title: 'Birthday Trip to Indianapolis' },
  { id: 'FjsncZwtNXQ', title: '2025 Royal Caribbean Utopia of the Sea' },
  { id: 'l34dAleBF3c', title: 'Kennedy Center and Animal Kingdom' },
  { id: 'thphfjc6M1U', title: 'Door County Wisconsin 2025' },
  { id: 'tA6S6gHKO9A', title: 'Galena&Debuque 2025' },
  { id: 'Q6S2gzVhS6s', title: '2024 2nd trip，Disney day 5 castaway keys' },
  { id: 'jRwakGUQfjQ', title: '2024 2nd trip，Disney day 4 Nassu' },
  { id: '0R0Udsis9-g', title: '2024 2nd trip，Disney day 3 Sailing day' },
  { id: '2JDK1f1ysH0', title: '2024 2nd trip，Disney day 2 epcot' },
  { id: 'DDKFsXB2olg', title: '2024 2nd trip，Disney day 1 arrival' },
  { id: 'ULMQPXa6AIA', title: 'Raneissance Fair 2024' },
  { id: 'cIPL9kQlcQE', title: 'Indianapolis 2024' },
  { id: 'WS3borGwqPg', title: 'Strawberry Picking' },
  { id: 'CfLnv-Memv0', title: 'Epic & House on The Rock 2024' },
  { id: 'lBIMY-GNH9I', title: 'Field Museum 2024' },
  { id: '0T8TbgsQ39o', title: 'Naper Settlement Field Trip' },
  { id: 'eSmMOPMFZU4', title: 'Starved Rock 2024' },
  { id: 'vTpww3IXqZE', title: 'Taste of Wisconsin & Nature Museum 2024' },
  { id: '4RmcyRNiCk0', title: 'Bluey museum and Millenium Park 2024' },
  { id: 'ddmBvsVfXK4', title: 'Grandpa&Grandma visit Chicago' },
  { id: 'hk8c4ht9hQQ', title: 'Botonic Garden and Beach' },
  { id: 'hoU-iiQuiJg', title: 'Tesla pick up' },
  { id: 'dhdBkfDZ7j0', title: 'A 6th Birthday' },
  { id: 'OF1sEsZDH-Q', title: 'Milwaukee Zoo 2024' },
  { id: 'pbjkgBjwGBs', title: 'A Birthday 2024' },
  { id: 'x-AsI2TfBiM', title: 'Morton arboretum & Rockford 2024' },
  { id: 'PUNZOmTYb4M', title: 'Grandpa grandma is here' },
  { id: 'WB-MMiAOuOQ', title: 'MSI & Zoo 2024' },
  { id: 'qR0fqqyXxBU', title: 'Egg hunt at Twin Lake 2024' },
  { id: '-QvcaBx7orI', title: '2024 Disney Day 1 Arrival' },
  { id: '9IHbM_-ljm4', title: '2024 Disney Day 2 Epcot' },
  { id: '6D-rXLpIXFY', title: '2024 Disney Day 3 Magic Kingdom' },
  { id: 'fRTGx35jNgk', title: '2024 Disney Day 4 Hollywood Studio' },
  { id: 'Ap74Ltp46Q4', title: '2024 Disney Day 5 Departure' },
  { id: '3N-dCpksO3w', title: 'A 4th Birthday' },
  { id: 'h_AUSt1_TH4', title: 'Botanic Garden And Steak House 2024' },
  { id: 'RWtxtSgcQy4', title: 'Mitchel Park Dome&MCM 2024' },
  { id: 'gFhedFWAgfU', title: 'Egg Hunt Brookfield Zoo 2024' },
  { id: 'npQhWeg3VfU', title: 'A day in office 2024' },
  { id: 'CdizKE2QQvo', title: 'Trick or treat at school 2023' },
  { id: '348grJjhMdg', title: 'My Birthday 2023' },
  { id: 'vMCx1OPpYBI', title: 'Apple Picking&Lake Geneva October 2023' },
  { id: 'PGZo5xfEEkI', title: 'Chicago Botanic Garden fall 2023' },
  { id: 'zGNfukTE9eM', title: 'Museum of Science and Industry visit October 2023' },
  { id: 'aBMWqGZsoyU', title: 'Christmas gift opening 2023' },
  { id: 'lJDkw_flhXw', title: 'Disney on Ice 2023' },
  { id: 'pVcyS3qE2Qw', title: 'Grandma&Grandpa visiting' },
  { id: 'kI9aVHS7jRw', title: '🧑🏻‍💻🏙️A day in life as a software engineer in Chicago' },
  { id: 'aUISfd7q19c', title: '🧙🏻‍♂️🎠⛩️Epic system tour & House on the rock' },
  { id: 'riMclChd9Pg', title: '🎃🏎️⛸️Bengtson\'s Farm & Monster Truck' },
  { id: 'zk_On_r__NI', title: '🐺💦🐒⛱️Great wolf lodge, Milwaukee zoo, Umbrella sky' },
  { id: '09HXyQtwtsA', title: '🎡🏇🏽🎶Wisconsin State Fair 2023' },
  { id: '57LZDsBMrEk', title: '⛹️‍♂️🍲🧑🏽‍🍳做个饭' },
  { id: '4bz5BK8qkZU', title: '🎭🍗🔨🏴‍☠️Renaissance fair Bristol Wisconsin' },
  { id: 'DFwCLha82Fk', title: '🐶🐜🤿🍦' },
  { id: 'cxLvrdupI8o', title: '🐊🐍🎈🤡National night out at RM park district' },
  { id: 'iz1zCAYXeIA', title: '🦖🏛️🌾Children\'s Museum of Indianapolis 2023' },
];
