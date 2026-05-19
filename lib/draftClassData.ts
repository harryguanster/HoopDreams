export type DraftClass = {
  year: number;
  hint: string;       // shown at top, not counted as a guess
  players: string[];  // all valid answers (hint excluded)
};

export const DRAFT_CLASSES: DraftClass[] = [
  {
    year: 2010,
    hint: "John Wall",
    players: [
      "Evan Turner","DeMarcus Cousins","Derrick Favors","Paul George",
      "Gordon Hayward","Eric Bledsoe","Greg Monroe","Al-Farouq Aminu",
      "Patrick Patterson","Luke Babbitt","Avery Bradley","Ed Davis",
      "Cole Aldrich","Larry Sanders","Xavier Henry","Kevin Seraphin",
    ],
  },
  {
    year: 2011,
    hint: "Kyrie Irving",
    players: [
      "Derrick Williams","Enes Kanter","Tristan Thompson","Jonas Valanciunas",
      "Bismack Biyombo","Brandon Knight","Kemba Walker","Klay Thompson",
      "Kawhi Leonard","Jimmy Butler","Isaiah Thomas","Kenneth Faried",
      "Tobias Harris","Reggie Jackson","Jimmer Fredette","Alec Burks",
    ],
  },
  {
    year: 2012,
    hint: "Anthony Davis",
    players: [
      "Michael Kidd-Gilchrist","Bradley Beal","Dion Waiters","Thomas Robinson",
      "Damian Lillard","Harrison Barnes","Terrence Ross","Andre Drummond",
      "Jared Sullinger","Evan Fournier","Austin Rivers","Meyers Leonard",
      "John Henson","Khris Middleton","Perry Jones III","Tyler Zeller",
    ],
  },
  {
    year: 2013,
    hint: "Giannis Antetokounmpo",
    players: [
      "Anthony Bennett","Victor Oladipo","Otto Porter Jr.","Cody Zeller",
      "Alex Len","Nerlens Noel","Ben McLemore","Trey Burke",
      "CJ McCollum","Michael Carter-Williams","Steven Adams","Kelly Olynyk",
      "Dennis Schroder","Rudy Gobert","Mason Plumlee","Tim Hardaway Jr.","Shabazz Muhammad",
    ],
  },
  {
    year: 2014,
    hint: "Andrew Wiggins",
    players: [
      "Jabari Parker","Joel Embiid","Aaron Gordon","Dante Exum",
      "Marcus Smart","Julius Randle","Zach LaVine","TJ Warren",
      "Dario Saric","Clint Capela","Nikola Jokic","Bogdan Bogdanovic",
      "Nik Stauskas","Noah Vonleh","Gary Harris","Rodney Hood","Jordan Clarkson","Doug McDermott",
    ],
  },
  {
    year: 2015,
    hint: "Karl-Anthony Towns",
    players: [
      "D'Angelo Russell","Jahlil Okafor","Kristaps Porzingis","Mario Hezonja",
      "Willie Cauley-Stein","Justise Winslow","Myles Turner","Devin Booker",
      "Kelly Oubre Jr.","Frank Kaminsky","Josh Richardson","Norman Powell",
      "Larry Nance Jr.","Montrezl Harrell","Bobby Portis","Cameron Payne","Stanley Johnson","Trey Lyles",
    ],
  },
  {
    year: 2016,
    hint: "Ben Simmons",
    players: [
      "Brandon Ingram","Jaylen Brown","Kris Dunn","Dragan Bender",
      "Buddy Hield","Jamal Murray","Marquese Chriss","Domantas Sabonis",
      "Dejounte Murray","Pascal Siakam","Caris LeVert","Taurean Prince",
      "Malcolm Brogdon","Wade Baldwin IV","Henry Ellenson","Furkan Korkmaz",
    ],
  },
  {
    year: 2017,
    hint: "Jayson Tatum",
    players: [
      "Markelle Fultz","Lonzo Ball","Josh Jackson","De'Aaron Fox",
      "Jonathan Isaac","Lauri Markkanen","Frank Ntilikina","Dennis Smith Jr.",
      "Donovan Mitchell","Bam Adebayo","John Collins","OG Anunoby",
      "Kyle Kuzma","Jarrett Allen","Josh Hart","Zach Collins","Caleb Swanigan",
    ],
  },
  {
    year: 2018,
    hint: "Luka Doncic",
    players: [
      "Deandre Ayton","Marvin Bagley III","Jaren Jackson Jr.","Trae Young",
      "Mohamed Bamba","Wendell Carter Jr.","Mikal Bridges","Shai Gilgeous-Alexander",
      "Miles Bridges","Michael Porter Jr.","Donte DiVincenzo","Kevin Huerter",
      "Landry Shamet","Collin Sexton","Robert Williams","Kevin Knox","Lonnie Walker IV",
    ],
  },
  {
    year: 2019,
    hint: "Zion Williamson",
    players: [
      "Ja Morant","RJ Barrett","De'Andre Hunter","Darius Garland",
      "Jarrett Culver","Coby White","Jaxson Hayes","Rui Hachimura",
      "Cameron Johnson","PJ Washington","Tyler Herro","Brandon Clarke",
      "Matisse Thybulle","Keldon Johnson","Nickeil Alexander-Walker","Grant Williams","Jordan Nwora",
    ],
  },
  {
    year: 2020,
    hint: "Anthony Edwards",
    players: [
      "James Wiseman","LaMelo Ball","Patrick Williams","Isaac Okoro",
      "Onyeka Okongwu","Killian Hayes","Obi Toppin","Deni Avdija",
      "Tyrese Haliburton","Devin Vassell","Tyrese Maxey","Immanuel Quickley",
      "Desmond Bane","Isaiah Stewart","Aaron Nesmith","Cole Anthony","Saddiq Bey","Josh Green",
    ],
  },
  {
    year: 2021,
    hint: "Cade Cunningham",
    players: [
      "Jalen Green","Evan Mobley","Scottie Barnes","Jalen Suggs",
      "Josh Giddey","Jonathan Kuminga","Franz Wagner","Davion Mitchell",
      "Alperen Sengun","Moses Moody","Ziaire Williams","Cam Thomas",
      "Keon Johnson","Isaiah Jackson","Josh Christopher","Corey Kispert","Day'Ron Sharpe",
    ],
  },
  {
    year: 2022,
    hint: "Paolo Banchero",
    players: [
      "Chet Holmgren","Jabari Smith Jr.","Keegan Murray","Jaden Ivey",
      "Bennedict Mathurin","Shaedon Sharpe","Dyson Daniels","Jeremy Sochan",
      "Jalen Williams","Jalen Duren","AJ Griffin","Walker Kessler",
      "Ochai Agbaji","Mark Williams","Tari Eason","Johnny Davis",
    ],
  },
  {
    year: 2023,
    hint: "Victor Wembanyama",
    players: [
      "Brandon Miller","Scoot Henderson","Amen Thompson","Ausar Thompson",
      "Bilal Coulibaly","Anthony Black","Jarace Walker","Taylor Hendricks",
      "Cason Wallace","Dereck Lively II","Jordan Hawkins","Gradey Dick",
      "Keyonte George","Jaime Jaquez Jr.","Noah Clowney","Brandin Podziemski","Jett Howard",
    ],
  },
  {
    year: 2024,
    hint: "Zaccharie Risacher",
    players: [
      "Alexandre Sarr","Reed Sheppard","Stephon Castle","Donovan Clingan",
      "Tidjane Salaun","Rob Dillingham","Matas Buzelis","Nikola Topic",
      "DaRon Holmes II","Dalton Knecht","Zach Edey","Cody Williams",
      "Isaiah Collier","Devin Carter","Ja'Kobe Walter","Jared McCain","Pacome Dadiet",
    ],
  },
  {
    year: 2025,
    hint: "Cooper Flagg",
    players: [
      "Dylan Harper","Ace Bailey","VJ Edgecombe","Khaman Maluach",
      "Tre Johnson","Cameron Boozer","Noa Essengue","Kasparas Jakucionis",
      "Collin Murray-Boyles","Egor Demin","Asa Newell","Kon Knueppel","Johni Broome",
    ],
  },
];
