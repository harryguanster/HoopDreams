export interface StatLinePlayer {
  id: string;
  name: string;
  aliases: string[];
  teamColor: string;
  team: string;
  position: string;
  jersey: string;
  era: string;
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    bpg: number;
    fgPct: number;
    threePct: number | null; // null = pre-3pt era
  };
}

// Progressive reveal order: each step adds more info
// Step 1: PPG only
// Step 2: + RPG + BPG
// Step 3: + APG + SPG
// Step 4: + FG% + 3P% + Position
// Step 5: + Era + Team hint

export const STAT_LINE_PLAYERS: StatLinePlayer[] = [
  {
    id: "jordan",
    name: "Michael Jordan",
    aliases: ["michael jordan", "jordan", "mj", "mike"],
    teamColor: "#CE1141", team: "Chicago Bulls", position: "SG", jersey: "23", era: "1984–2003",
    stats: { ppg: 30.1, rpg: 6.2, apg: 5.3, spg: 2.3, bpg: 0.8, fgPct: 49.7, threePct: 32.7 },
  },
  {
    id: "lebron",
    name: "LeBron James",
    aliases: ["lebron james", "lebron", "king james", "the king"],
    teamColor: "#552583", team: "Los Angeles Lakers", position: "SF", jersey: "23", era: "2003–present",
    stats: { ppg: 27.1, rpg: 7.5, apg: 7.4, spg: 1.6, bpg: 0.8, fgPct: 50.4, threePct: 34.5 },
  },
  {
    id: "kobe",
    name: "Kobe Bryant",
    aliases: ["kobe bryant", "kobe", "black mamba", "mamba"],
    teamColor: "#552583", team: "Los Angeles Lakers", position: "SG", jersey: "24", era: "1996–2016",
    stats: { ppg: 25.0, rpg: 5.2, apg: 4.7, spg: 1.4, bpg: 0.5, fgPct: 44.7, threePct: 32.9 },
  },
  {
    id: "curry",
    name: "Stephen Curry",
    aliases: ["stephen curry", "steph curry", "curry", "steph", "chef curry"],
    teamColor: "#1D428A", team: "Golden State Warriors", position: "PG", jersey: "30", era: "2009–present",
    stats: { ppg: 24.8, rpg: 4.6, apg: 6.4, spg: 1.7, bpg: 0.2, fgPct: 47.3, threePct: 42.8 },
  },
  {
    id: "shaq",
    name: "Shaquille O'Neal",
    aliases: ["shaquille o'neal", "shaq", "the diesel"],
    teamColor: "#552583", team: "Los Angeles Lakers", position: "C", jersey: "34", era: "1992–2011",
    stats: { ppg: 23.7, rpg: 10.9, apg: 2.5, spg: 0.6, bpg: 2.3, fgPct: 58.2, threePct: null },
  },
  {
    id: "timD",
    name: "Tim Duncan",
    aliases: ["tim duncan", "duncan", "the big fundamental"],
    teamColor: "#C4CED4", team: "San Antonio Spurs", position: "PF/C", jersey: "21", era: "1997–2016",
    stats: { ppg: 19.0, rpg: 10.8, apg: 3.0, spg: 0.7, bpg: 2.2, fgPct: 50.6, threePct: null },
  },
  {
    id: "magic",
    name: "Magic Johnson",
    aliases: ["magic johnson", "magic", "earvin johnson"],
    teamColor: "#552583", team: "Los Angeles Lakers", position: "PG", jersey: "32", era: "1979–1996",
    stats: { ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4, fgPct: 52.0, threePct: 30.3 },
  },
  {
    id: "kareem",
    name: "Kareem Abdul-Jabbar",
    aliases: ["kareem abdul-jabbar", "kareem", "kareem abdul jabbar"],
    teamColor: "#552583", team: "Los Angeles Lakers", position: "C", jersey: "33", era: "1969–1989",
    stats: { ppg: 24.6, rpg: 11.2, apg: 3.6, spg: 0.9, bpg: 2.6, fgPct: 55.9, threePct: null },
  },
  {
    id: "wilt",
    name: "Wilt Chamberlain",
    aliases: ["wilt chamberlain", "wilt", "the stilt"],
    teamColor: "#006BB6", team: "Philadelphia 76ers", position: "C", jersey: "13", era: "1959–1973",
    stats: { ppg: 30.1, rpg: 22.9, apg: 4.4, spg: 0.0, bpg: 0.0, fgPct: 54.0, threePct: null },
  },
  {
    id: "bird",
    name: "Larry Bird",
    aliases: ["larry bird", "bird", "larry legend"],
    teamColor: "#007A33", team: "Boston Celtics", position: "SF", jersey: "33", era: "1979–1992",
    stats: { ppg: 24.3, rpg: 10.0, apg: 6.3, spg: 1.7, bpg: 0.8, fgPct: 49.6, threePct: 37.6 },
  },
  {
    id: "hakeem",
    name: "Hakeem Olajuwon",
    aliases: ["hakeem olajuwon", "hakeem", "the dream", "akeem"],
    teamColor: "#CE1141", team: "Houston Rockets", position: "C", jersey: "34", era: "1984–2002",
    stats: { ppg: 21.8, rpg: 11.1, apg: 2.5, spg: 1.7, bpg: 3.1, fgPct: 51.2, threePct: null },
  },
  {
    id: "dirk",
    name: "Dirk Nowitzki",
    aliases: ["dirk nowitzki", "dirk", "nowitzki"],
    teamColor: "#00538C", team: "Dallas Mavericks", position: "PF", jersey: "41", era: "1998–2019",
    stats: { ppg: 20.7, rpg: 7.5, apg: 2.4, spg: 0.8, bpg: 0.8, fgPct: 47.1, threePct: 38.0 },
  },
  {
    id: "durant",
    name: "Kevin Durant",
    aliases: ["kevin durant", "durant", "kd", "slim reaper"],
    teamColor: "#1D1160", team: "Phoenix Suns", position: "SF", jersey: "35", era: "2007–present",
    stats: { ppg: 27.3, rpg: 7.0, apg: 4.4, spg: 1.1, bpg: 1.1, fgPct: 49.6, threePct: 38.4 },
  },
  {
    id: "jokic",
    name: "Nikola Jokic",
    aliases: ["nikola jokic", "jokic", "the joker"],
    teamColor: "#FEC524", team: "Denver Nuggets", position: "C", jersey: "15", era: "2015–present",
    stats: { ppg: 26.4, rpg: 12.4, apg: 9.0, spg: 1.3, bpg: 0.7, fgPct: 57.3, threePct: 33.7 },
  },
  {
    id: "giannis",
    name: "Giannis Antetokounmpo",
    aliases: ["giannis antetokounmpo", "giannis", "greek freak"],
    teamColor: "#00471B", team: "Milwaukee Bucks", position: "PF", jersey: "34", era: "2013–present",
    stats: { ppg: 28.9, rpg: 11.6, apg: 5.8, spg: 1.2, bpg: 1.4, fgPct: 55.4, threePct: 28.3 },
  },
  {
    id: "cp3",
    name: "Chris Paul",
    aliases: ["chris paul", "cp3", "the point god", "point god"],
    teamColor: "#C4CED4", team: "San Antonio Spurs", position: "PG", jersey: "3", era: "2005–present",
    stats: { ppg: 17.0, rpg: 4.5, apg: 9.4, spg: 2.1, bpg: 0.2, fgPct: 47.0, threePct: 37.0 },
  },
  {
    id: "russell",
    name: "Bill Russell",
    aliases: ["bill russell", "russell"],
    teamColor: "#007A33", team: "Boston Celtics", position: "C", jersey: "6", era: "1956–1969",
    stats: { ppg: 15.1, rpg: 22.5, apg: 4.3, spg: 0.0, bpg: 0.0, fgPct: 44.0, threePct: null },
  },
  {
    id: "dwyane",
    name: "Dwyane Wade",
    aliases: ["dwyane wade", "wade", "d-wade", "flash"],
    teamColor: "#98002E", team: "Miami Heat", position: "SG", jersey: "3", era: "2003–2019",
    stats: { ppg: 22.0, rpg: 4.7, apg: 5.4, spg: 1.5, bpg: 0.8, fgPct: 47.9, threePct: 29.2 },
  },
];
