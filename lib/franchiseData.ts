// ─── League Teams ──────────────────────────────────────────────────────────────
export type Conference = "East" | "West";

export type LeagueTeam = {
  name: string;
  abbr: string;
  conf: Conference;
  rating: number; // 60–95
  color: string;
  logoUrl: string;
};

// ESPN CDN logo URLs — abbr mapping differs from ours for some teams
const ESPN = (id: string) => `https://a.espncdn.com/i/teamlogos/nba/500/${id}.png`;

export const LEAGUE_TEAMS: LeagueTeam[] = [
  // ── East ──────────────────────────────────────────
  { name: "Boston Celtics",         abbr: "BOS", conf: "East", rating: 88, color: "#007A33", logoUrl: ESPN("bos") },
  { name: "New York Knicks",        abbr: "NYK", conf: "East", rating: 83, color: "#F58426", logoUrl: ESPN("ny")  },
  { name: "Cleveland Cavaliers",    abbr: "CLE", conf: "East", rating: 87, color: "#860038", logoUrl: ESPN("cle") },
  { name: "Milwaukee Bucks",        abbr: "MIL", conf: "East", rating: 82, color: "#00471B", logoUrl: ESPN("mil") },
  { name: "Indiana Pacers",         abbr: "IND", conf: "East", rating: 80, color: "#002D62", logoUrl: ESPN("ind") },
  { name: "Miami Heat",             abbr: "MIA", conf: "East", rating: 76, color: "#98002E", logoUrl: ESPN("mia") },
  { name: "Chicago Bulls",          abbr: "CHI", conf: "East", rating: 72, color: "#CE1141", logoUrl: ESPN("chi") },
  { name: "Atlanta Hawks",          abbr: "ATL", conf: "East", rating: 74, color: "#E03A3E", logoUrl: ESPN("atl") },
  { name: "Philadelphia 76ers",     abbr: "PHI", conf: "East", rating: 73, color: "#006BB6", logoUrl: ESPN("phi") },
  { name: "Toronto Raptors",        abbr: "TOR", conf: "East", rating: 71, color: "#CE1141", logoUrl: ESPN("tor") },
  { name: "Brooklyn Nets",          abbr: "BKN", conf: "East", rating: 68, color: "#000000", logoUrl: ESPN("bkn") },
  { name: "Charlotte Hornets",      abbr: "CHA", conf: "East", rating: 67, color: "#1D1160", logoUrl: ESPN("cha") },
  { name: "Washington Wizards",     abbr: "WAS", conf: "East", rating: 62, color: "#002B5C", logoUrl: ESPN("wsh") },
  { name: "Detroit Pistons",        abbr: "DET", conf: "East", rating: 70, color: "#C8102E", logoUrl: ESPN("det") },
  { name: "Orlando Magic",          abbr: "ORL", conf: "East", rating: 77, color: "#0077C0", logoUrl: ESPN("orl") },
  // ── West ──────────────────────────────────────────
  { name: "Oklahoma City Thunder",  abbr: "OKC", conf: "West", rating: 91, color: "#007AC1", logoUrl: ESPN("okc")  },
  { name: "Denver Nuggets",         abbr: "DEN", conf: "West", rating: 85, color: "#0E2240", logoUrl: ESPN("den")  },
  { name: "Golden State Warriors",  abbr: "GSW", conf: "West", rating: 78, color: "#1D428A", logoUrl: ESPN("gs")   },
  { name: "Minnesota Timberwolves", abbr: "MIN", conf: "West", rating: 82, color: "#0C2340", logoUrl: ESPN("min")  },
  { name: "Los Angeles Lakers",     abbr: "LAL", conf: "West", rating: 76, color: "#552583", logoUrl: ESPN("lal")  },
  { name: "Los Angeles Clippers",   abbr: "LAC", conf: "West", rating: 74, color: "#C8102E", logoUrl: ESPN("lac")  },
  { name: "Phoenix Suns",           abbr: "PHX", conf: "West", rating: 73, color: "#1D1160", logoUrl: ESPN("phx")  },
  { name: "Dallas Mavericks",       abbr: "DAL", conf: "West", rating: 80, color: "#00538C", logoUrl: ESPN("dal")  },
  { name: "Houston Rockets",        abbr: "HOU", conf: "West", rating: 79, color: "#CE1141", logoUrl: ESPN("hou")  },
  { name: "Sacramento Kings",       abbr: "SAC", conf: "West", rating: 75, color: "#5A2D81", logoUrl: ESPN("sac")  },
  { name: "Memphis Grizzlies",      abbr: "MEM", conf: "West", rating: 72, color: "#5D76A9", logoUrl: ESPN("mem")  },
  { name: "New Orleans Pelicans",   abbr: "NOP", conf: "West", rating: 70, color: "#0C2340", logoUrl: ESPN("no")   },
  { name: "Utah Jazz",              abbr: "UTA", conf: "West", rating: 65, color: "#002B5C", logoUrl: ESPN("utah") },
  { name: "San Antonio Spurs",      abbr: "SAS", conf: "West", rating: 77, color: "#C4CED4", logoUrl: ESPN("sa")   },
  { name: "Portland Trail Blazers", abbr: "POR", conf: "West", rating: 66, color: "#E03A3E", logoUrl: ESPN("por")  },
];

// ─── Simulation helpers ────────────────────────────────────────────────────────

function gauss(): number {
  // Box-Muller
  const u = Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u + 1e-9)) * Math.cos(2 * Math.PI * v);
}

// Probability team A beats team B given ratings
export function winProb(rA: number, rB: number): number {
  const diff = (rA - rB) / 8;
  return 1 / (1 + Math.exp(-diff));
}

// ─── Standing entry ────────────────────────────────────────────────────────────
export type StandingEntry = {
  name: string;
  abbr: string;
  conf: Conference;
  color: string;
  logoUrl: string;
  rating: number;
  wins: number;
  losses: number;
  isUser: boolean;
};

// ─── Full season sim ───────────────────────────────────────────────────────────
export function simulateSeason(
  userRating: number,
  userTeamName: string,
  userAbbr: string,
  userConf: Conference,
  userColor: string,
  userLogoUrl: string,
): { east: StandingEntry[]; west: StandingEntry[] } {
  const entries: StandingEntry[] = LEAGUE_TEAMS.map(t => ({
    name: t.name, abbr: t.abbr, conf: t.conf, color: t.color, logoUrl: t.logoUrl,
    rating: t.rating + gauss() * 3,
    wins: 0, losses: 0, isUser: false,
  }));

  // Replace the user's chosen team
  const userIdx = entries.findIndex(e => e.abbr === userAbbr);
  const userEntry: StandingEntry = {
    name: userTeamName, abbr: userAbbr, conf: userConf, color: userColor, logoUrl: userLogoUrl,
    rating: userRating, wins: 0, losses: 0, isUser: true,
  };
  if (userIdx >= 0) entries[userIdx] = userEntry;
  else entries.push(userEntry);

  // Each team plays 82 games (simplified: ~4 vs each same-conf, ~2 vs other-conf)
  const east = entries.filter(e => e.conf === "East");
  const west = entries.filter(e => e.conf === "West");

  function playConf(conf: StandingEntry[]) {
    for (let i = 0; i < conf.length; i++) {
      for (let j = i + 1; j < conf.length; j++) {
        // 4 games per intra-conf opponent
        for (let g = 0; g < 4; g++) {
          const p = winProb(conf[i].rating, conf[j].rating);
          if (Math.random() < p) { conf[i].wins++; conf[j].losses++; }
          else { conf[j].wins++; conf[i].losses++; }
        }
      }
    }
  }

  function playCross(confA: StandingEntry[], confB: StandingEntry[]) {
    for (const a of confA) {
      for (const b of confB) {
        // 2 games per inter-conf opponent
        for (let g = 0; g < 2; g++) {
          const p = winProb(a.rating, b.rating);
          if (Math.random() < p) { a.wins++; b.losses++; }
          else { b.wins++; a.losses++; }
        }
      }
    }
  }

  playConf(east);
  playConf(west);
  playCross(east, west);

  const sort = (arr: StandingEntry[]) =>
    [...arr].sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  return { east: sort(east), west: sort(west) };
}

// ─── Playoff series ────────────────────────────────────────────────────────────
export type SeriesResult = {
  winner: StandingEntry;
  loser: StandingEntry;
  winsW: number;
  winsL: number;
  games: number;
};

export function simulateSeries(
  teamA: StandingEntry,
  teamB: StandingEntry,
  best = 7,
): SeriesResult {
  const needed = Math.ceil(best / 2);
  let wA = 0, wB = 0;
  const p = winProb(teamA.rating, teamB.rating);

  while (wA < needed && wB < needed) {
    if (Math.random() < p) wA++;
    else wB++;
  }

  const winner = wA >= needed ? teamA : teamB;
  const loser  = wA >= needed ? teamB : teamA;
  const winsW  = wA >= needed ? wA : wB;
  const winsL  = wA >= needed ? wB : wA;

  return { winner, loser, winsW, winsL, games: wA + wB };
}

// ─── Build full bracket ────────────────────────────────────────────────────────
export type PlayoffRound = {
  name: string;
  matchups: [StandingEntry, StandingEntry][];
};

export function buildPlayoffBracket(
  east: StandingEntry[],
  west: StandingEntry[],
): PlayoffRound[] {
  // Top 8 from each conf; seeds 7–8 play-in (simplified: just take top 8)
  const eSeeds = east.slice(0, 8);
  const wSeeds = west.slice(0, 8);

  return [
    {
      name: "First Round",
      matchups: [
        [eSeeds[0], eSeeds[7]], [eSeeds[1], eSeeds[6]],
        [eSeeds[2], eSeeds[5]], [eSeeds[3], eSeeds[4]],
        [wSeeds[0], wSeeds[7]], [wSeeds[1], wSeeds[6]],
        [wSeeds[2], wSeeds[5]], [wSeeds[3], wSeeds[4]],
      ],
    },
  ];
}

// ─── Full playoff simulation ───────────────────────────────────────────────────
export type PlayoffResult = {
  round: string;
  series: SeriesResult[];
}[];

export function simulatePlayoffs(
  east: StandingEntry[],
  west: StandingEntry[],
): { results: PlayoffResult; champion: StandingEntry } {
  const eSeeds = east.slice(0, 8);
  const wSeeds = west.slice(0, 8);

  const results: PlayoffResult = [];

  function runRound(teams: StandingEntry[], roundName: string): StandingEntry[] {
    const series: SeriesResult[] = [];
    const winners: StandingEntry[] = [];
    for (let i = 0; i < teams.length; i += 2) {
      const s = simulateSeries(teams[i], teams[i + 1]);
      series.push(s);
      winners.push(s.winner);
    }
    results.push({ round: roundName, series });
    return winners;
  }

  // East bracket
  const eR1 = runRound(
    [eSeeds[0], eSeeds[7], eSeeds[1], eSeeds[6], eSeeds[2], eSeeds[5], eSeeds[3], eSeeds[4]],
    "East First Round",
  );
  const eR2 = runRound([eR1[0], eR1[1], eR1[2], eR1[3]], "East Semis");
  const [eChamp] = runRound([eR2[0], eR2[1]], "East Finals");

  // West bracket
  const wR1 = runRound(
    [wSeeds[0], wSeeds[7], wSeeds[1], wSeeds[6], wSeeds[2], wSeeds[5], wSeeds[3], wSeeds[4]],
    "West First Round",
  );
  const wR2 = runRound([wR1[0], wR1[1], wR1[2], wR1[3]], "West Semis");
  const [wChamp] = runRound([wR2[0], wR2[1]], "West Finals");

  // Finals
  const finalSeries = simulateSeries(eChamp, wChamp);
  results.push({ round: "NBA Finals", series: [finalSeries] });

  return { results, champion: finalSeries.winner };
}

// ─── User rating from roster ───────────────────────────────────────────────────
// Converts a list of {ppg, rpg, apg, salary} players into a 60–95 team rating
export type RosterPlayer = {
  name: string;
  ppg: number;
  rpg: number;
  apg: number;
  salary: number;
  minutes: number;
};

export function computeUserRating(roster: RosterPlayer[]): number {
  if (roster.length === 0) return 60;

  const totalMins = roster.reduce((s, p) => s + p.minutes, 0) || 1;

  // Weighted offensive contribution by minutes share
  let offScore = 0;
  for (const p of roster) {
    const share = p.minutes / totalMins;
    const contrib = p.ppg * 0.5 + p.apg * 0.3 + p.rpg * 0.1;
    offScore += contrib * share;
  }

  // Scale to 60–95
  // A starter-heavy team averaging ~25 PPG contrib → rating ~85
  const raw = 60 + (offScore / 15) * 35;
  return Math.max(60, Math.min(95, raw));
}

// ─── Draft prospects ───────────────────────────────────────────────────────────
export type Prospect = {
  name: string;
  pos: string;
  age: number;
  ppg: number;
  rpg: number;
  apg: number;
  potential: "Star" | "Starter" | "Rotation" | "Bust";
  salary: number;
};

const FIRST_NAMES = ["Marcus","Jaylen","Andre","Tyler","Jordan","Devon","Malik","Isaiah","Elijah","Darius","Cameron","Zion","Aaron","Brandon","Cole","Dillon","Evan","Grant","Hunter","Ivan"];
const LAST_NAMES  = ["Johnson","Williams","Davis","Brown","Jones","Thompson","Anderson","Taylor","Moore","Jackson","Harris","Wilson","Martin","Lee","White","Clark","Lewis","Hall","Walker","Young"];

function rng(arr: string[]): string { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number, dp = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp));
}

export function generateDraftClass(year: number): Prospect[] {
  const seed = year * 31337;
  const prospects: Prospect[] = [];

  // Use seeded-ish approach: rotate through names based on year
  const fOff = (year % FIRST_NAMES.length);
  const lOff = ((year * 7) % LAST_NAMES.length);

  const potentials: Prospect["potential"][] = ["Star","Starter","Starter","Rotation","Rotation","Rotation","Bust","Bust"];

  for (let i = 0; i < 8; i++) {
    const potential = potentials[i % potentials.length];
    const fn = FIRST_NAMES[(fOff + i * 3) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(lOff + i * 5) % LAST_NAMES.length];
    const ppg = potential === "Star" ? rand(18, 26) : potential === "Starter" ? rand(12, 18) : potential === "Rotation" ? rand(7, 13) : rand(2, 8);
    const rpg = rand(2, 8);
    const apg = rand(1, 6);
    const pos = ["PG","SG","SF","PF","C"][i % 5];
    const salary = potential === "Star" ? 11 : potential === "Starter" ? 6 : potential === "Rotation" ? 3 : 2;

    prospects.push({ name: `${fn} ${ln}`, pos, age: rand(19, 22, 0) as number, ppg, rpg, apg, potential, salary });
  }

  return prospects;
}

// ─── Free agent pool ───────────────────────────────────────────────────────────
export type FreeAgent = {
  name: string;
  pos: string;
  age: number;
  ppg: number;
  rpg: number;
  apg: number;
  salary: number;
  tier: "Max" | "Mid" | "Vet";
};

export function generateFreeAgents(season: number): FreeAgent[] {
  const fOff = (season * 11) % FIRST_NAMES.length;
  const lOff = (season * 13) % LAST_NAMES.length;
  const tiers: FreeAgent["tier"][] = ["Max","Max","Mid","Mid","Mid","Vet","Vet","Vet","Vet","Vet"];
  const agents: FreeAgent[] = [];

  for (let i = 0; i < 10; i++) {
    const tier = tiers[i];
    const fn = FIRST_NAMES[(fOff + i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(lOff + i * 11) % LAST_NAMES.length];
    const ppg = tier === "Max" ? rand(20, 28) : tier === "Mid" ? rand(12, 20) : rand(5, 12);
    const rpg = rand(2, 9);
    const apg = rand(1, 7);
    const salary = tier === "Max" ? rand(20, 28, 0) as number : tier === "Mid" ? rand(8, 15, 0) as number : rand(2, 7, 0) as number;
    const pos = ["PG","SG","SF","PF","C"][i % 5];
    const age = tier === "Max" ? rand(24, 29, 0) as number : rand(25, 34, 0) as number;

    agents.push({ name: `${fn} ${ln}`, pos, age, ppg, rpg, apg, salary, tier });
  }

  return agents;
}
