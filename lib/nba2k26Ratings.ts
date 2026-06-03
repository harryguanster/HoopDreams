// NBA 2K26 Overall Ratings
// Top 21 confirmed from HoopsHype. Remaining estimated from 2024-25 stats,
// historical 2K patterns, and player tier.
// Falls back to computeOVR for any player not listed.

export const NBA_2K26_RATINGS: Record<string, number> = {
  // ── 98 ──────────────────────────────────────────────────────────────────────
  jokic:      98,
  sga:        98,

  // ── 97 ──────────────────────────────────────────────────────────────────────
  giannis:    97,

  // ── 95 ──────────────────────────────────────────────────────────────────────
  ant:        95,
  luka:       95,

  // ── 94 ──────────────────────────────────────────────────────────────────────
  tatum:      94,
  lebron:     94,
  curry:      94,
  wemby:      94,

  // ── 93 ──────────────────────────────────────────────────────────────────────
  ad:         93,
  dmitchell:  93,
  brunson:    93,
  durant:     93,
  haliburton: 93,

  // ── 92 ──────────────────────────────────────────────────────────────────────
  cade:       92,
  embiid:     92,
  kat:        92,
  kawhi:      92,

  // ── 91 ──────────────────────────────────────────────────────────────────────
  booker:     91,
  ja:         91,
  jbrown:     91,  // 28.7 PPG / 6.9 RPG / 5.1 APG — breakout All-Star level

  // ── 90 ──────────────────────────────────────────────────────────────────────
  jwilliams2: 90,  // Jalen Williams — confirmed by HoopsHype
  trae:       90,  // 22 PPG / 10 APG

  // ── 89 ──────────────────────────────────────────────────────────────────────
  bam:        89,  // Elite two-way center
  tmaxey:     89,  // 28.3 PPG — breakout season
  banchero:   89,  // 22 PPG / 7 RPG — establishing star
  jbutler:    89,  // Elite two-way wing
  mobley:     89,  // 18 PPG / 9 RPG / elite defender

  // ── 88 ──────────────────────────────────────────────────────────────────────
  defox:      88,  // 18.6 PPG / 6.2 APG / elite pace
  dame:       88,  // Still elite shooter, slight decline
  lamelo:     88,  // 20 PPG / 7 APG when healthy
  siakam:     88,  // 20 PPG / 7 RPG — All-Star
  trae2:      88,  // (alias ref)

  // ── 87 ──────────────────────────────────────────────────────────────────────
  sengun:     87,  // 23 PPG / 8.9 RPG — legit All-Star
  jmurray:    87,  // 22 PPG — clutch performer
  harden:     87,  // 25 PPG / 8.5 APG — elite playmaker, 87 despite age
  sabonis:    87,  // 19 PPG / 14 RPG / 8 APG — elite rebounder
  jjohnson:   87,  // 22.5 PPG / 10.3 RPG / 7.9 APG — breakout superstar
  therro:     87,  // 20 PPG — elite scorer off the bench/starter

  // ── 86 ──────────────────────────────────────────────────────────────────────
  jjackson:   86,  // 19 PPG / elite shot-blocker / DPOY candidate
  lmarkkanen: 86,  // 22 PPG / 8.5 RPG — elite stretch big
  cholmgren:  86,  // 18 PPG / 8 RPG / elite shot-blocker
  kyrie:      86,  // 25 PPG — elite scorer, 35+ age factor

  // ── 85 ──────────────────────────────────────────────────────────────────────
  fwagner:    85,  // 19 PPG / 4 RPG — emerging star
  garland:    85,  // 18 PPG / 7 APG
  zion:       85,  // 26 PPG when healthy — elite talent
  sbarnes:    85,  // 20 PPG / elite two-way wing
  ppritchard: 85,  // 22 PPG / elite 3-point shooter

  // ── 84 ──────────────────────────────────────────────────────────────────────
  jrandle:    84,  // 21 PPG / 6.7 RPG
  cflagg:     84,  // Cooper Flagg — #1 pick 2025, high floor/ceiling
  pgeorge:    84,  // 22 PPG — still effective
  oganunoby:  84,  // Elite two-way wing, 16 PPG
  lavine:     84,  // 23 PPG — elite scorer when healthy
  mikalbridg: 84,  // 20 PPG — elite wing
  bbeal:      84,  // 22 PPG — elite scorer

  // ── 83 ──────────────────────────────────────────────────────────────────────
  holiday:    83,  // Elite defender, 16 PPG / 5 APG
  kthompson:  83,  // Elite 3-point specialist, still relevant
  porzingis:  83,  // Elite stretch center — injury discount
  athompson:  83,  // Amen Thompson — 21 PPG / 10 RPG — elite athlete
  bingram:    83,  // 20 PPG — solid scorer
  dbane:      83,  // 20 PPG / elite 3-and-D

  // ── 82 ──────────────────────────────────────────────────────────────────────
  mporter:    82,  // 21 PPG / elite scorer
  dwhite:     82,  // 13 PPG / elite two-way guard
  cwhite:     82,  // 16 PPG / solid playmaker
  fvv:        82,  // 16 PPG / 8 APG — elite point guard
  kmiddleton: 82,  // Elite scorer when healthy
  jallen:     82,  // 13 PPG / elite defender / rim protector
  dharper:    82,  // Dylan Harper — #2 pick 2025, elite prospect
  abailey:    81,  // Ace Bailey — #3 pick 2025, elite scoring wing

  // ── 81 ──────────────────────────────────────────────────────────────────────
  dmurray2:   81,  // Dejounte Murray — 20 PPG / 5 RPG / 5 APG
  kuminga:    81,  // 18 PPG — athletic big wing
  areaves:    81,  // 16 PPG — efficient scorer / two-way
  mbridges:   81,  // 19 PPG / solid wing
  mturner:    81,  // 14 PPG / elite shot-blocker
  iquickley:  81,  // 17 PPG / solid guard

  // ── 80 ──────────────────────────────────────────────────────────────────────
  dgreen:     80,  // Elite defender, DPOY-level IQ
  gobert:     80,  // Elite rim protector, 2× DPOY
  nclaxton:   80,  // 12 PPG / elite defender
  bmiller:    80,  // 17 PPG — solid young wing
  rjbarrett:  80,  // 17 PPG — solid scorer
  cjohnson:   80,  // 14 PPG — versatile wing
  cjmcc:      80,  // 19 PPG — solid scorer
  horford:    80,  // Veteran, still solid two-way
  vucevic:    80,  // 17 PPG / 10.5 RPG
  blopez:     79,  // Elite shot-blocker, solid scorer

  // ── 79 ──────────────────────────────────────────────────────────────────────
  jhart:      79,  // Hustle machine, 9 PPG / 8 RPG
  npowell:    79,  // 18 PPG — elite scorer / two-way
  ddaniels:   79,  // 2.9 SPG — elite defender
  giddey:     79,  // 14 PPG / 7 RPG / 6 APG — versatile
  jsuggs:     79,  // 14 PPG / solid two-way
  dlrussell:  79,  // 16 PPG — solid playmaker
  dvassell:   79,  // 16 PPG — solid scorer
  mrobinson:  79,  // Elite shot-blocker
  asimons:    79,  // 20 PPG — elite scorer
  jpoeltl:    79,  // Solid starting center
  bmathurin:  79,  // 17 PPG — athletic scorer
  istewart:   79,  // Solid two-way center
  msmart:     79,  // Elite defender / 14 PPG
  dehunter:   79,  // 13 PPG / solid two-way
  awiggins:   79,  // 15 PPG — solid 3-and-D wing
  zubac:      79,  // 14 PPG / solid starting center
  csexton:    79,  // 16 PPG — solid scorer
  jclarkson2: 79,  // 16 PPG / elite bench scorer
  hachimura:  79,  // 14 PPG — solid wing
  tmurphy:    79,  // 14 PPG — solid 3-and-D
  jcollins:   79,  // 16 PPG / solid big
  shenderson: 79,  // Scoot Henderson — 18 PPG, upside
  djmurray:   79,  // (reference)
  schroder:   78,  // 15 PPG — solid backup PG

  // ── 78 ──────────────────────────────────────────────────────────────────────
  agordon:    78,  // 13 PPG — elite defender, athletic
  dlively:    78,  // Strong young center
  wkessler:   78,  // Elite shot-blocker, improving offense
  scastle:    78,  // Stephon Castle — top pick 2024, improving
  jduren:     78,  // 14 PPG / athletic center
  jmcdaniels: 78,  // 11 PPG / elite defender
  pjwash:     78,  // 13 PPG — solid two-way PF
  ssharpe:    78,  // 20 PPG — raw but elite athleticism
  dgafford:   78,  // 11 PPG / elite athleticism
  wcarterj:   78,  // 12 PPG / solid big
  bpodziemski:78,  // 14 PPG / solid guard
  jsochan:    78,  // 12 PPG / versatile defender
  dvassell2:  78,  // (ref)
  mconley:    78,  // Veteran PG, great leader

  // ── 77 ──────────────────────────────────────────────────────────────────────
  acaruso:    77,  // Elite defender / 9 PPG
  mporter2:   77,  // (ref)
  kcpp:       77,  // 12 PPG / solid 3-and-D
  cbraun:     77,  // 12 PPG / solid wing
  dknecht:    77,  // 14 PPG / solid scorer
  asarr:      77,  // Alex Sarr — top pick 2024, raw but big upside
  jsmith:     77,  // Jabari Smith Jr. — 15 PPG / improving
  bsheppard:  77,  // 15 PPG — solid scorer
  mwilliams:  77,  // Solid young center
  jgrant:     77,  // 14 PPG / solid big
  nurkic:     77,  // 12 PPG / solid starting center
  anembhard:  77,  // Solid backup PG
  blopez2:    77,  // ref
  mwagner:    77,  // 16 PPG / solid big
  isaiahj:    76,  // Isaiah Jackson
  jisaac:     77,  // Solid two-way big
  nreid:      77,  // 14 PPG / versatile big
  npowell2:   77,  // ref

  // ── 76 ──────────────────────────────────────────────────────────────────────
  koubre:     76,  // Kelly Oubre Jr. — 15 PPG / solid wing
  jfears:     76,  // Jeremiah Fears — #5 pick 2025, upside PG
  anesmith:   76,  // 11 PPG / solid 3-and-D
  rdillingham:76,  // Rob Dillingham — 14 PPG / elite scorer
  icollier:   76,  // Isaiah Collier — solid young PG
  bcoulibaly: 76,  // 9 PPG / great defender / improving
  anthonyblack:76, // 13 PPG / solid two-way
  zrisacher:  76,  // Zaccharie Risacher — top pick 2024, improving
  jjackson2:  76,  // ref
  hbarnes:    76,  // 13 PPG — solid vet
  khuerter:   76,  // 14 PPG / solid shooter
  mmonk:      76,  // 14 PPG / solid scorer
  ldort:      76,  // 12 PPG / elite defender
  pwilliams:  76,  // Patrick Williams — 12 PPG / solid big
  dosunmu:    76,  // 11 PPG / solid guard
  tjones:     76,  // Tyus Jones — solid backup PG
  otoppin:    76,  // 11 PPG / athletic PF
  rjackson:   76,  // ref
  jwalker:    75,  // solid guard

  // ── 75 ──────────────────────────────────────────────────────────────────────
  vjedgecombe:75,  // VJ Edgecombe — #5 pick 2025, athletic guard
  saldama:    75,  // 13 PPG / versatile big
  ggjackson:  75,  // GG Jackson — 14 PPG / athletic wing
  pachiuwa:   75,  // Precious Achiuwa — solid
  cmartin:    75,  // Caleb Martin — solid 3-and-D
  jvanderbilt:75,  // Jarred Vanderbilt — elite defender
  tcamara:    75,  // Toumani Camara — solid defender
  bpodziemski2:75, // ref
  tjmcconn:   75,  // TJ McConnell — elite backup PG
  icollier2:  75,  // ref
  nbatum:     75,  // Nicolas Batum — veteran glue guy
  nrichards:  74,  // Nick Richards — backup center

  // ── 74 ──────────────────────────────────────────────────────────────────────
  kknueppel:  74,  // Kon Knueppel — #5-7 pick 2025
  mchristie:  74,  // Max Christie — solid young wing
  dfssmith:   74,  // Dorian Finney-Smith — solid 3-and-D
  gwilliams:  74,  // Grant Williams — solid big
  adrummond:  74,  // Andre Drummond — backup center
  jhart2:     74,  // ref
  jalvarado:  74,  // Jose Alvarado — elite defender
  jhawkins:   74,  // Jordan Hawkins — solid scorer
  kjohnson:   74,  // Keldon Johnson — solid wing
  gvincent:   74,  // Gabe Vincent — solid backup PG
  mmoody:     74,  // Moses Moody — solid young wing
  drsharpe:   74,  // Day'Ron Sharpe — solid backup center
  capella:    74,  // Clint Capela — veteran big, declining
  bogdan:     74,  // Bogdan Bogdanovic — solid scorer off bench
  gpaytonii:  74,  // Gary Payton II — elite defender
  ihartenste2:74,  // ref
  jjohnson2:  74,  // ref
  jmogbo:     74,  // solid young center

  // ── 73 ──────────────────────────────────────────────────────────────────────
  kjakucionis: 73, // Kasparas Jakucionis — promising guard
  mbuzelis:   73,  // Matas Buzelis — athletic wing
  zwilliams:  73,  // Ziaire Williams — solid wing
  mmcbride:   73,  // Miles McBride — solid backup guard
  gharris:    73,  // Gary Harris — solid vet
  hhighsmith: 73,  // Haywood Highsmith — solid role player
  mjbeauchamp:73,  // MarJon Beauchamp
  rdunn:      73,  // Ryan Dunn — solid defender
  roneale:    73,  // Royce O'Neale — solid 3-and-D
  teason:     73,  // Tari Eason — athletic PF
  cwhitmore:  73,  // Cam Whitmore — developing wing
  mthybulle:  73,  // Matisse Thybulle — elite defender
  dayton:     73,  // placeholder
  jaeseant:   73,  // Jae'Sean Tate — solid role player
  oighodaro:  73,  // Oso Ighodaro — solid center
  cmurrayb:   73,  // Collin Murray-Boyles — 2025 rookie
  otoppin2:   73,  // ref
  mstrus:     73,  // Max Strus
  clowney:    73,  // Noah Clowney — developing big
  orobinson:  73,  // ref
  bwesley:    72,  // Blake Wesley
  sfontecchio:74,  // Simone Fontecchio — solid 3-and-D
  mbeasley:   73,  // Malik Beasley — solid scorer
  ckispert:   73,  // Corey Kispert — solid 3-point shooter

  // ── 72 ──────────────────────────────────────────────────────────────────────
  lmcneeley:  74,  // Liam McNeeley — #7 pick 2025, elite shooter
  msasser:    72,  // Marcus Sasser — developing guard
  rholland:   73,  // Ronald Holland — athletic wing
  jgreen:     73,  // Josh Green — solid wing
  lnance:     72,  // Larry Nance Jr. — veteran
  tremann:    75,  // Tre Mann — 11 PPG / solid guard
  tsalaun:    72,  // Tidjane Salaun — 2024 rookie
  nessengue:  72,  // Noa Essengue — 2025 rookie
  mwilliams2: 73,  // ref
  kmaluach:   72,  // Khaman Maluach — 2025 rookie center
  edemin:     72,  // Egor Demin — 2025 rookie
  ymissi:     72,  // Yves Missi — solid backup center
  tporter:    72,  // Terquavion Smith
  dbrooks:    73,  // Dillon Brooks — solid wing
  zebdey:     72,  // Zach Edey — solid center
  njovic:     73,  // Nikola Jovic — solid young big
  pwatson:    72,  // Peyton Watson — developing
  bsimmons:   72,  // Ben Simmons — injury discount
  thendricks: 73,  // Taylor Hendricks — solid young big
  znnaji:     72,  // Zeke Nnaji — backup big
  rrupert:    72,  // Rayan Rupert — developing
  mbranham:   72,  // Malaki Branham — developing
  cbassey:    72,  // Charles Bassey
  jdavis2:    72,  // JD Davison
  tdasilva:   72,  // Tristan da Silva
  ajgreen2:   72,  // AJ Green — solid backup
  kwilliams:  72,  // Kenrich Williams — solid role player
  awiggins2:  72,  // Aaron Wiggins — solid backup wing

  // ── 71 ──────────────────────────────────────────────────────────────────────
  dwolf:      71,  // Danny Wolf — 2025 rookie big
  bronny:     71,  // Bronny James — developing
  kornet:     72,  // Luke Kornet — solid backup center
  xtillman:   71,  // Xavier Tillman — solid backup big
  krejci:     71,  // Vit Krejci
  gmathews:   71,  // Garrison Mathews — shooter
  jivey:      71,  // solid backup
  tyjerome:   75,  // Ty Jerome — solid scorer
  nawilliams: 70,  // Nate Williams
  gdick:      73,  // Gradey Dick — 15 PPG / solid scorer
  oagbaji:    73,  // Ochai Agbaji — solid wing
  jpoole:     79,  // Jordan Poole — 16 PPG / scorer
  kuzma:      78,  // Kyle Kuzma — 18 PPG / solid SF
  dmitchell2: 74,  // Davion Mitchell — solid guard
  bcoulibaly2: 76, // ref
  tyusjones:  74,  // Tyus Jones — solid backup PG
  mbagley:    72,  // Marvin Bagley III — backup big
  qgrimes:    73,  // Quentin Grimes — solid wing
  bhyland:    72,  // Bones Hyland — backup PG
  dknecht2:   74,  // ref
  sdinwiddie: 74,  // Spencer Dinwiddie — veteran
  jgreen2:    74,  // Jeff Green — veteran
  thardjr:    73,  // Tim Hardaway Jr. — solid shooter
  clevert:    75,  // Caris LeVert — solid scorer
  gniang:     73,  // Georges Niang — solid shooter
  mchristie2: 74,  // ref
  egordon:    73,  // Eric Gordon — veteran
  kjmartin:   74,  // KJ Martin — solid athletic wing
  adrummond2: 74,  // ref
  rjackson2:  73,  // Reggie Jackson — veteran backup
  gallen:     75,  // Grayson Allen — solid 3-point shooter
  sdinwiddie2:74,  // ref
  jaeseant2:  73,  // ref
};

// OVR → salary tier for franchise mode
export function ovrToSalary(ovr: number): number {
  if (ovr >= 95) return 28;
  if (ovr >= 90) return 20;
  if (ovr >= 87) return 15;
  if (ovr >= 83) return 11;
  if (ovr >= 79) return  8;
  if (ovr >= 75) return  6;
  if (ovr >= 71) return  4;
  if (ovr >= 67) return  3;
  if (ovr >= 60) return  2;
  return 1;
}

export function get2KOvr(playerId: string, fallback: number): number {
  return NBA_2K26_RATINGS[playerId] ?? fallback;
}
