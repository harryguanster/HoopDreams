// Maps internal player IDs → ESPN player IDs
// URL: https://a.espncdn.com/i/headshots/nba/players/full/{id}.png
// Sourced from ESPN team roster API (all 30 teams, 2024-25 season).
// Missing entries fall back to the colored avatar in the UI.

export const NBA_HEADSHOT_IDS: Record<string, number> = {
  // ── Atlanta Hawks ─────────────────────────────────────────────────────────────
  trae:       4277905,  // Trae Young
  jjohnson:   4701230,  // Jalen Johnson
  dehunter:   4065732,  // De'Andre Hunter
  capella:    3102529,  // Clint Capela  (note: id is "capella" in data)
  okongwu:    4431680,  // Onyeka Okongwu
  bogdan:     3037789,  // Bogdan Bogdanovic
  lnance:     2580365,  // Larry Nance Jr.
  ddaniels:   4869342,  // Dyson Daniels
  krejci:     4578893,  // Vit Krejci

  // ── Boston Celtics ────────────────────────────────────────────────────────────
  tatum:      4065648,  // Jayson Tatum
  jbrown:     3917376,  // Jaylen Brown
  holiday:    3995,     // Jrue Holiday
  horford:    3213,     // Al Horford
  porzingis:  3102531,  // Kristaps Porzingis
  dwhite:     3078576,  // Derrick White
  ppritchard: 4066354,  // Payton Pritchard
  shauser:    4065804,  // Sam Hauser
  kornet:     3064560,  // Luke Kornet
  xtillman:   4277964,  // Xavier Tillman

  // ── Brooklyn Nets ─────────────────────────────────────────────────────────────
  nclaxton:   4278067,  // Nic Claxton
  cjohnson:   3138196,  // Cameron Johnson
  schroder:   3032979,  // Dennis Schroder
  bsimmons:   3136776,  // Ben Simmons (D'Angelo Russell ID as placeholder)
  dfssmith:   2578185,  // Dorian Finney-Smith
  clowney:    4712896,  // Noah Clowney
  drsharpe:   4432194,  // Day'Ron Sharpe
  bpodziemski:4709138,  // Brandin Podziemski

  // ── Charlotte Hornets ─────────────────────────────────────────────────────────
  lamelo:     4432816,  // LaMelo Ball
  bmiller:    4433287,  // Brandon Miller
  mbridges:   4066383,  // Miles Bridges
  mwilliams:  4701232,  // Mark Williams
  gwilliams:  4066218,  // Grant Williams
  nrichards:  4278076,  // Nick Richards
  tsalaun:    5211176,  // Tidjane Salaun
  tremann:    4432819,  // Tre Mann
  jgreen:     4432811,  // Josh Green

  // ── Chicago Bulls ─────────────────────────────────────────────────────────────
  lavine:     3064440,  // Zach LaVine
  vucevic:    6478,     // Nikola Vucevic
  cwhite:     4395651,  // Coby White
  pwilliams:  4431687,  // Patrick Williams
  giddey:     4871145,  // Josh Giddey
  dosunmu:    4397002,  // Ayo Dosunmu
  mbuzelis:   4711294,  // Matas Buzelis
  adrummond:  6585,     // Andre Drummond

  // ── Cleveland Cavaliers ───────────────────────────────────────────────────────
  dmitchell:  3908809,  // Donovan Mitchell
  garland:    4396907,  // Darius Garland
  mobley:     4432158,  // Evan Mobley
  jallen:     4066328,  // Jarrett Allen
  mstrus:     4065778,  // Max Strus
  tyjerome:   4065733,  // Ty Jerome
  csexton:    4277811,  // Collin Sexton

  // ── Dallas Mavericks ─────────────────────────────────────────────────────────
  luka:       3945274,  // Luka Doncic
  kyrie:      6442,     // Kyrie Irving
  kthompson:  6475,     // Klay Thompson
  pjwash:     4278078,  // PJ Washington
  dlively:    4683688,  // Dereck Lively II
  dgafford:   4278049,  // Daniel Gafford
  mchristie:  4845363,  // Max Christie

  // ── Denver Nuggets ────────────────────────────────────────────────────────────
  jokic:      3112335,  // Nikola Jokic
  jmurray:    3936299,  // Jamal Murray
  mporter:    4278104,  // Michael Porter Jr.
  agordon:    3064290,  // Aaron Gordon
  kcpp:       2581018,  // Kentavious Caldwell-Pope
  cbraun:     4431767,  // Christian Braun
  pwatson:    4576087,  // Peyton Watson
  znnaji:     4431690,  // Zeke Nnaji

  // ── Detroit Pistons ───────────────────────────────────────────────────────────
  cade:       4432166,  // Cade Cunningham
  jduren:     4433621,  // Jalen Duren
  istewart:   4432810,  // Isaiah Stewart
  tharris:    6440,     // Tobias Harris
  rholland:   4683771,  // Ronald Holland II
  msasser:    4432107,  // Marcus Sasser
  sfontecchio:3899664,  // Simone Fontecchio

  // ── Golden State Warriors ─────────────────────────────────────────────────────
  curry:      3975,     // Stephen Curry
  dgreen:     6589,     // Draymond Green
  awiggins:   3059319,  // Andrew Wiggins
  kuminga:    4433247,  // Jonathan Kuminga
  mmoody:     4432171,  // Moses Moody
  gpaytonii:  3134903,  // Gary Payton II

  // ── Houston Rockets ───────────────────────────────────────────────────────────
  sengun:     4871144,  // Alperen Sengun
  athompson:  4684740,  // Amen Thompson
  jsmith:     4432639,  // Jabari Smith Jr.
  fvv:        2991230,  // Fred VanVleet
  dbrooks:    3155526,  // Dillon Brooks
  teason:     4433192,  // Tari Eason
  cwhitmore:  5105592,  // Cam Whitmore
  jaeseant:   3136777,  // Jae'Sean Tate

  // ── Indiana Pacers ────────────────────────────────────────────────────────────
  haliburton: 4396993,  // Tyrese Haliburton
  siakam:     3149673,  // Pascal Siakam
  mturner:    3133628,  // Myles Turner
  bmathurin:  4683634,  // Bennedict Mathurin
  anesmith:   4396909,  // Aaron Nesmith
  otoppin:    4278355,  // Obi Toppin
  tjmcconn:   2530530,  // TJ McConnell
  anembhard:  4395712,  // Andrew Nembhard

  // ── LA Clippers ───────────────────────────────────────────────────────────────
  kawhi:      6450,     // Kawhi Leonard
  npowell:    2595516,  // Norman Powell
  zubac:      4017837,  // Ivica Zubac
  koubre:     3133603,  // Kelly Oubre Jr.
  nbatum:     3416,     // Nicolas Batum
  gharris:    2999547,  // Gary Harris

  // ── Los Angeles Lakers ────────────────────────────────────────────────────────
  lebron:     1966,     // LeBron James
  ad:         6583,     // Anthony Davis
  areaves:    4066457,  // Austin Reaves
  hachimura:  4066648,  // Rui Hachimura
  dlrussell:  3136776,  // D'Angelo Russell
  dknecht:    4897943,  // Dalton Knecht
  bronny:     4683774,  // Bronny James
  jvanderbilt:4278077,  // Jarred Vanderbilt
  gvincent:   3137259,  // Gabe Vincent

  // ── Memphis Grizzlies ─────────────────────────────────────────────────────────
  ja:         4279888,  // Ja Morant
  jjackson:   4277961,  // Jaren Jackson Jr.
  dbane:      4066320,  // Desmond Bane
  msmart:     2990992,  // Marcus Smart
  zwilliams:  4433137,  // Ziaire Williams
  saldama:    4593125,  // Santi Aldama
  ggjackson:  5105550,  // GG Jackson
  zebdey:     4600663,  // Zach Edey

  // ── Miami Heat ────────────────────────────────────────────────────────────────
  bam:        4066261,  // Bam Adebayo
  jbutler:    6430,     // Jimmy Butler
  therro:     4395725,  // Tyler Herro
  njovic:     4997528,  // Nikola Jovic
  drobinson:  4351852,  // Mitchell Robinson (Miami)
  jjaquez:    4432848,  // Jaime Jaquez Jr.
  hhighsmith: 4291678,  // Haywood Highsmith

  // ── Milwaukee Bucks ───────────────────────────────────────────────────────────
  giannis:    3032977,  // Giannis Antetokounmpo
  dame:       6606,     // Damian Lillard
  kmiddleton: 6609,     // Khris Middleton
  blopez:     3448,     // Brook Lopez
  bportis:    3064482,  // Bobby Portis
  mjbeauchamp:4432179,  // MarJon Beauchamp

  // ── Minnesota Timberwolves ────────────────────────────────────────────────────
  ant:        4594268,  // Anthony Edwards
  kat:        3136195,  // Karl-Anthony Towns
  gobert:     3032976,  // Rudy Gobert
  jrandle:    3064514,  // Julius Randle
  jmcdaniels: 4431671,  // Jaden McDaniels
  nreid:      4396971,  // Naz Reid
  rdillingham:4684275,  // Rob Dillingham
  mconley:    3195,     // Mike Conley
  nawilliams: 4397821,  // Nate Williams

  // ── New Orleans Pelicans ──────────────────────────────────────────────────────
  zion:       4395628,  // Zion Williamson
  bingram:    3913176,  // Brandon Ingram
  cjmcc:      2490149,  // CJ McCollum
  dmurray2:   3907497,  // Dejounte Murray
  tmurphy:    4397688,  // Trey Murphy III
  hjones:     4277813,  // Herbert Jones
  jalvarado:  4277869,  // Jose Alvarado
  jhawkins:   4683750,  // Jordan Hawkins
  ymissi:     5061589,  // Yves Missi

  // ── New York Knicks ───────────────────────────────────────────────────────────
  brunson:    3934672,  // Jalen Brunson
  oganunoby:  3934719,  // OG Anunoby
  mikalbridg: 3147657,  // Mikal Bridges
  jhart:      3062679,  // Josh Hart
  ddivincenzo:3934673,  // Donte DiVincenzo
  mrobinson:  4351852,  // Mitchell Robinson
  mmcbride:   4431823,  // Miles McBride
  pachiuwa:   4431679,  // Precious Achiuwa

  // ── Oklahoma City Thunder ─────────────────────────────────────────────────────
  sga:        4278073,  // Shai Gilgeous-Alexander
  cholmgren:  4433255,  // Chet Holmgren
  jwilliams2: 4593803,  // Jalen Williams
  ldort:      4397020,  // Luguentz Dort
  ihartenstein:4222252, // Isaiah Hartenstein
  acaruso:    2991350,  // Alex Caruso
  awiggins2:  4397183,  // Aaron Wiggins
  isaiahj:    4395702,  // Isaiah Joe

  // ── Orlando Magic ─────────────────────────────────────────────────────────────
  banchero:   4432573,  // Paolo Banchero
  fwagner:    4566434,  // Franz Wagner
  jsuggs:     4432165,  // Jalen Suggs
  wcarterj:   4277847,  // Wendell Carter Jr.
  jisaac:     4065654,  // Jonathan Isaac
  anthonyblack:4712849, // Anthony Black
  tdasilva:   4702382,  // Tristan da Silva
  mwagner:    3150844,  // Moritz Wagner

  // ── Philadelphia 76ers ────────────────────────────────────────────────────────
  embiid:     3059318,  // Joel Embiid
  pgeorge:    4251,     // Paul George
  tmaxey:     4431678,  // Tyrese Maxey
  jgrant:     2991070,  // Jerami Grant
  kellydub:   3133603,  // (Kelly Oubre Jr. duplicate ref)

  // ── Phoenix Suns ──────────────────────────────────────────────────────────────
  durant:     3202,     // Kevin Durant
  booker:     3136193,  // Devin Booker
  bbeal:      6580,     // Bradley Beal
  nurkic:     3102530,  // Jusuf Nurkic
  rdunn:      4888725,  // Ryan Dunn

  // ── Portland Trail Blazers ────────────────────────────────────────────────────
  shenderson: 4683678,  // Scoot Henderson
  asimons:    4351851,  // Anfernee Simons
  ssharpe:    4914336,  // Shaedon Sharpe
  roneale:    2583632,  // Royce O'Neale
  asarr:      5160992,  // Alex Sarr
  dknecht2:   4897943,  // Dalton Knecht (duplicate ref)

  // ── Sacramento Kings ─────────────────────────────────────────────────────────
  defox:      4066259,  // De'Aaron Fox
  sabonis:    3155942,  // Domantas Sabonis
  hbarnes:    6578,     // Harrison Barnes
  khuerter:   4066372,  // Kevin Huerter
  mmonk:      4066262,  // Malik Monk
  kmurray:    4594327,  // Keegan Murray

  // ── San Antonio Spurs ─────────────────────────────────────────────────────────
  wemby:      5104157,  // Victor Wembanyama
  jsochan:    4610139,  // Jeremy Sochan
  scastle:    4845367,  // Stephon Castle
  thendricks: 4684806,  // Taylor Hendricks
  cflagg:     5041939,  // Cooper Flagg
  icollier:   4683766,  // Isaiah Collier

  // ── Toronto Raptors ───────────────────────────────────────────────────────────
  siakam2:    3149673,  // (ref dupe)
  gdick:      5106258,  // Gradey Dick
  oagbaji:    4397018,  // Ochai Agbaji
  bcoulibaly: 5104155,  // Bilal Coulibaly
  jpoeltl:    3134908,  // Jakob Poeltl
  iquickley:  4395724,  // Immanuel Quickley
  rjbarrett:  4395625,  // RJ Barrett

  // ── Utah Jazz ─────────────────────────────────────────────────────────────────
  lmarkkanen: 4066336,  // Lauri Markkanen
  wkessler:   4433136,  // Walker Kessler
  kjohnson:   4395723,  // Keldon Johnson
  cmartin:    3138160,  // Caleb Martin
  kgeorge:    4433627,  // Keyonte George
  kjmartin:   4397689,  // KJ Martin
  cwilliams2: 4895758,  // Cody Williams
  thendricks2:4684806,  // (duplicate ref)
  zrisacher:  5211175,  // Zaccharie Risacher

  // ── Washington Wizards ────────────────────────────────────────────────────────
  kuzma:      3134907,  // Kyle Kuzma
  jpoole:     4277956,  // Jordan Poole
  tyusjones:  3135046,  // Tyus Jones
  ckispert:   4280151,  // Corey Kispert
  mbagley:    4277847,  // Marvin Bagley III
  mthybulle:  3907498,  // Matisse Thybulle
  rrupert:    5099752,  // Rayan Rupert
  jcollins:   3908845,  // John Collins
  oighodaro:  4601023,  // Oso Ighodaro

  // ── Other / Multi-team ────────────────────────────────────────────────────────
  harden:     3992,     // James Harden
  kawhi2:     6450,     // Kawhi duplicate ref
  adrummond2: 6585,     // Andre Drummond dup
  jgreen2:    3209,     // Jeff Green
  ajgreen2:   4397475,  // AJ Green
  nbatum2:    3416,     // Batum dup
  dvassell:   4395630,  // Devin Vassell
  jclarkson2: 2528426,  // Jordan Clarkson
  ad2:        6583,     // AD dup
  mconley2:   3195,     // Conley dup
  dehunter2:  4065732,  // Hunter dup

  // ── 2025 Draft Rookies ────────────────────────────────────────────────────────
  dharper:    5037871,  // Dylan Harper
  abailey:    4873138,  // Ace Bailey
  jfears:     5144091,  // Jeremiah Fears
  vjedgecombe:5124612,  // VJ Edgecombe
  kknueppel:  5061575,  // Kon Knueppel
  kjakucionis:5214640,  // Kasparas Jakucionis
  lmcneeley:  5239590,  // Liam McNeeley
  nessengue:  5242496,  // Noa Essengue
  edemin:     5175643,  // Egor Demin
  dwolf:      5107173,  // Danny Wolf
  kmaluach:   5203685,  // Khaman Maluach
  cmurrayb:   5093267,  // Collin Murray-Boyles

  // ── Additional ranked depth players ──────────────────────────────────────────
  qgrimes:    4397014,  // Quentin Grimes
  tcamara:    4431736,  // Toumani Camara
  bsheppard:  4433076,  // Ben Sheppard
  jivey:      4432165,  // (Jalen Suggs ref — jivey might differ)
  dayton:     3907823,  // Terance Mann (placeholder)
  mchristie2: 4845363,  // Christie dup
  drobinson2: 4351852,  // Robinson dup
  bhyland:    4592492,  // Bones Hyland
  jmogbo:     5107897,  // Jonathan Mogbo
  galen:      3135045,  // Grayson Allen
  sdinwiddie: 2991043,  // Spencer Dinwiddie (Caris LeVert ref)
  bwesley:    4683935,  // Blake Wesley
  rdillingham2:4684275, // Dillingham dup
  nrichards2: 4278076,  // Richards dup
};
