// Videos from the unlisted "Vlog" YouTube playlist, in playlist order.
// Upload dates are not shown: most of these were uploaded in one batch, so the
// upload date says nothing about when the thing filmed actually happened
// ("2024 Disney Day 1" was uploaded in 2025).
export interface Vlog {
  id: string;
  title: string;
}

export const playlistUrl =
  'https://www.youtube.com/playlist?list=PLYThmuvRX57DaI0cAAHAji7hJIPOcPOe3';

export const vlogs: Vlog[] = [
  { id: '-QvcaBx7orI', title: '2024 Disney Day 1 Arrival' },
  { id: '9IHbM_-ljm4', title: '2024 Disney Day 2 Epcot' },
  { id: '6D-rXLpIXFY', title: '2024 Disney Day 3 Magic Kingdom' },
  { id: 'fRTGx35jNgk', title: '2024 Disney Day 4 Hollywood Studio' },
  { id: 'Ap74Ltp46Q4', title: '2024 Disney Day 5 Departure' },
  { id: '3N-dCpksO3w', title: 'Andy 4th Birthday' },
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
