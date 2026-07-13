export type SDPlayer = {
  id: string;
  name: string;
  position: "PG" | "SG" | "SF" | "PF" | "C";
  era: string;
  tier: 1 | 2 | 3;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  hint: string;
};

export type BracketPlayer = {
  name: string;
  position: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
};

export type BracketOpponent = {
  id: string;
  name: string;
  subtitle: string;
  difficulty: "moderate" | "hard" | "legendary";
  players: BracketPlayer[];
};

// Snake order for 10 picks (user=5, ai=5)
export const SNAKE_ORDER: ("user" | "ai")[] = [
  "user", "ai", "ai", "user", "user", "ai", "ai", "user", "user", "ai",
];

// 20-player draft pool — 4 per position, mix of tiers
export const DRAFT_POOL: SDPlayer[] = [
  // PGs
  { id: "magic",    name: "Magic Johnson",      position: "PG", era: "1979–1996",    tier: 1, ppg: 19.5, rpg: 7.2, apg: 11.2, spg: 1.9, bpg: 0.4, hint: "5× Champion · 3× MVP · Showtime" },
  { id: "curry",    name: "Stephen Curry",       position: "PG", era: "2009–present", tier: 1, ppg: 24.8, rpg: 4.5, apg:  6.3, spg: 1.4, bpg: 0.2, hint: "4× Champion · All-Time 3PM Record" },
  { id: "oscar",    name: "Oscar Robertson",     position: "PG", era: "1960–1974",    tier: 2, ppg: 25.7, rpg: 7.5, apg:  9.5, spg: 0.0, bpg: 0.0, hint: "1962 MVP · Averaged a triple-double for a full season" },
  { id: "stockton", name: "John Stockton",       position: "PG", era: "1984–2003",    tier: 2, ppg: 13.1, rpg: 2.7, apg: 10.5, spg: 2.2, bpg: 0.2, hint: "All-Time Assists & Steals Leader" },
  // SGs
  { id: "jordan",   name: "Michael Jordan",      position: "SG", era: "1984–2003",    tier: 1, ppg: 30.1, rpg: 6.2, apg:  5.3, spg: 2.3, bpg: 0.8, hint: "6× Champion · 6× Finals MVP · GOAT" },
  { id: "kobe",     name: "Kobe Bryant",         position: "SG", era: "1996–2016",    tier: 1, ppg: 25.0, rpg: 5.4, apg:  4.7, spg: 1.4, bpg: 0.5, hint: "5× Champion · 81-point game in 2006" },
  { id: "iverson",  name: "Allen Iverson",       position: "SG", era: "1996–2010",    tier: 2, ppg: 26.7, rpg: 3.7, apg:  6.2, spg: 2.2, bpg: 0.3, hint: "2001 MVP · 11× All-Star · The Answer" },
  { id: "reggie",   name: "Reggie Miller",       position: "SG", era: "1987–2005",    tier: 3, ppg: 18.2, rpg: 3.0, apg:  3.0, spg: 1.1, bpg: 0.2, hint: "Miller Time legend · All-Time 3PM pre-Curry" },
  // SFs
  { id: "lebron",   name: "LeBron James",        position: "SF", era: "2003–present", tier: 1, ppg: 27.1, rpg: 7.5, apg:  7.4, spg: 1.6, bpg: 0.8, hint: "4× Champion · All-Time Scoring Leader" },
  { id: "durant",   name: "Kevin Durant",        position: "SF", era: "2007–present", tier: 1, ppg: 27.3, rpg: 7.0, apg:  4.0, spg: 1.1, bpg: 1.1, hint: "2× Champion · 2× Finals MVP · Slim Reaper" },
  { id: "bird",     name: "Larry Bird",          position: "SF", era: "1979–1992",    tier: 2, ppg: 24.3, rpg:10.0, apg:  6.3, spg: 1.7, bpg: 0.8, hint: "3× Champion · 3× MVP · Celtic legend" },
  { id: "pippen",   name: "Scottie Pippen",      position: "SF", era: "1987–2004",    tier: 3, ppg: 16.1, rpg: 6.4, apg:  5.2, spg: 2.0, bpg: 0.8, hint: "6× Champion · 7× All-Defensive First Team" },
  // PFs
  { id: "barkley",  name: "Charles Barkley",     position: "PF", era: "1984–2000",    tier: 1, ppg: 22.1, rpg:11.7, apg:  3.9, spg: 1.5, bpg: 0.8, hint: "1993 MVP · 11× All-Star · Never won a ring" },
  { id: "duncan",   name: "Tim Duncan",          position: "PF", era: "1997–2016",    tier: 2, ppg: 19.0, rpg:10.8, apg:  3.0, spg: 0.7, bpg: 2.2, hint: "5× Champion · 3× Finals MVP · Big Fundamental" },
  { id: "dirk",     name: "Dirk Nowitzki",       position: "PF", era: "1998–2019",    tier: 2, ppg: 20.7, rpg: 7.5, apg:  2.4, spg: 0.8, bpg: 0.8, hint: "2011 Champion · 2011 Finals MVP · Mavs icon" },
  { id: "rodman",   name: "Dennis Rodman",       position: "PF", era: "1986–2000",    tier: 3, ppg:  7.3, rpg:13.1, apg:  1.8, spg: 0.7, bpg: 0.6, hint: "5× Champion · 7× rebounding titles · The Worm" },
  // Cs
  { id: "wilt",     name: "Wilt Chamberlain",    position: "C",  era: "1959–1973",    tier: 1, ppg: 30.1, rpg:22.9, apg:  4.4, spg: 0.0, bpg: 0.0, hint: "2× Champion · 100-point game · Physical freak" },
  { id: "kareem",   name: "Kareem Abdul-Jabbar", position: "C",  era: "1969–1989",    tier: 1, ppg: 24.6, rpg:11.2, apg:  3.6, spg: 0.9, bpg: 2.6, hint: "6× Champion · 6× MVP · Skyhook unstoppable" },
  { id: "shaq",     name: "Shaquille O'Neal",    position: "C",  era: "1992–2011",    tier: 2, ppg: 23.7, rpg:10.9, apg:  2.5, spg: 0.6, bpg: 2.3, hint: "4× Champion · 3× Finals MVP · Most dominant ever" },
  { id: "ewing",    name: "Patrick Ewing",       position: "C",  era: "1985–2002",    tier: 2, ppg: 21.0, rpg: 9.8, apg:  1.9, spg: 1.0, bpg: 2.4, hint: "11× All-Star · Career Knick · Heart of the Garden" },
];

// AI picks: fill needed positions first, then best available by tier→ppg
export function aiPick(pool: SDPlayer[], aiRoster: SDPlayer[]): SDPlayer {
  const filled = new Set(aiRoster.map(p => p.position));
  const needed = (["PG", "SG", "SF", "PF", "C"] as const).filter(pos => !filled.has(pos));
  const sorted = [...pool].sort((a, b) => a.tier - b.tier || b.ppg - a.ppg);
  if (needed.length > 0) {
    for (const pos of needed) {
      const pick = sorted.find(p => p.position === pos);
      if (pick) return pick;
    }
  }
  return sorted[0];
}

// Pre-built bracket opponents (no overlap with DRAFT_POOL)
export const BRACKET_OPPONENTS: BracketOpponent[] = [
  {
    id: "contenders",
    name: "The Contenders",
    subtitle: "Quarterfinal",
    difficulty: "moderate",
    players: [
      { name: "Gary Payton",    position: "PG", ppg: 16.3, rpg:  4.4, apg: 6.7, spg: 2.0, bpg: 0.2 },
      { name: "Clyde Drexler",  position: "SG", ppg: 20.4, rpg:  6.1, apg: 5.6, spg: 2.0, bpg: 0.7 },
      { name: "Paul Pierce",    position: "SF", ppg: 19.7, rpg:  5.6, apg: 3.5, spg: 1.0, bpg: 0.5 },
      { name: "Karl Malone",    position: "PF", ppg: 25.0, rpg: 10.1, apg: 3.6, spg: 1.4, bpg: 0.8 },
      { name: "Dwight Howard",  position: "C",  ppg: 17.1, rpg: 12.5, apg: 1.5, spg: 0.9, bpg: 1.9 },
    ],
  },
  {
    id: "all_timers",
    name: "The All-Timers",
    subtitle: "Semifinal",
    difficulty: "hard",
    players: [
      { name: "Chris Paul",             position: "PG", ppg: 17.0, rpg:  4.5, apg:  9.4, spg: 2.1, bpg: 0.3 },
      { name: "Dwyane Wade",            position: "SG", ppg: 22.0, rpg:  4.7, apg:  5.4, spg: 1.5, bpg: 0.8 },
      { name: "Julius Erving",          position: "SF", ppg: 24.2, rpg:  8.5, apg:  4.2, spg: 2.1, bpg: 1.7 },
      { name: "Giannis Antetokounmpo",  position: "PF", ppg: 27.6, rpg: 11.8, apg:  5.8, spg: 1.2, bpg: 1.3 },
      { name: "Bill Russell",           position: "C",  ppg: 15.1, rpg: 22.5, apg:  4.3, spg: 0.0, bpg: 0.0 },
    ],
  },
  {
    id: "immortals",
    name: "The Immortals",
    subtitle: "Championship",
    difficulty: "legendary",
    players: [
      { name: "Jerry West",      position: "PG", ppg: 27.0, rpg:  5.8, apg: 6.7, spg: 2.0, bpg: 0.2 },
      { name: "George Gervin",   position: "SG", ppg: 26.2, rpg:  5.3, apg: 2.8, spg: 1.5, bpg: 0.7 },
      { name: "Elgin Baylor",    position: "SF", ppg: 27.4, rpg: 13.5, apg: 4.3, spg: 0.0, bpg: 0.0 },
      { name: "Moses Malone",    position: "PF", ppg: 20.3, rpg: 12.2, apg: 1.4, spg: 0.8, bpg: 1.3 },
      { name: "Hakeem Olajuwon", position: "C",  ppg: 21.8, rpg: 11.1, apg: 2.5, spg: 1.7, bpg: 3.1 },
    ],
  },
];
