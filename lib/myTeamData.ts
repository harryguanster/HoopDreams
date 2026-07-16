// ─── Star tier system ──────────────────────────────────────────────────────────
// starLevel 1-15:
//   1-5  → gold stars (fill slots 1→5)
//   6-10 → blue stars replace gold from left  (slot 1 is blue at level 6, slot 2 at 7, etc.)
//   11-15→ purple stars replace blue from left (slot 1 is purple at level 11, etc.)
//
// Visual: always 5 star slots. Each slot = empty | gold | blue | purple

export type StarColor = "empty" | "gold" | "blue" | "purple";

export function getStarColor(slot: number, level: number): StarColor {
  // slot is 1-indexed (1-5)
  if (level >= 10 + slot) return "purple";
  if (level >= 5 + slot)  return "blue";
  if (level >= slot)      return "gold";
  return "empty";
}

export const STAR_COLORS: Record<StarColor, string> = {
  empty:  "rgba(255,255,255,0.12)",
  gold:   "#f59e0b",
  blue:   "#60a5fa",
  purple: "#c084fc",
};

export function tierFromLevel(level: number): "gold" | "blue" | "purple" {
  if (level >= 11) return "purple";
  if (level >= 6)  return "blue";
  return "gold";
}

export const TIER_GLOW: Record<"gold" | "blue" | "purple", string> = {
  gold:   "#f59e0b",
  blue:   "#60a5fa",
  purple: "#c084fc",
};

// ─── Card type ─────────────────────────────────────────────────────────────────
export interface MTCard {
  id: string;
  firstName: string;
  lastName: string;
  era: string;        // e.g. "2015-16"
  team: string;
  teamAbbr: string;
  position: string;   // "PG", "SG", "SF", "PF", "C"
  starLevel: number;  // 1-15
  photo?: string;     // Wikipedia Commons URL
  photoPos?: string;  // CSS background-position
  teamColor: string;  // primary hex
  accentColor: string;
  badges: string[];
  ppg: number;
  rpg: number;
  apg: number;
  fg: number;         // field goal % (e.g. 49.5)
}

// ─── Confirmed-working Wikipedia Commons URLs ──────────────────────────────────
const PHOTOS = {
  jordan:      "https://upload.wikimedia.org/wikipedia/commons/4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg",
  kobe:        "https://upload.wikimedia.org/wikipedia/commons/f/fc/Kobe_Bryant_81.jpg",
  curry:       "https://upload.wikimedia.org/wikipedia/commons/b/b6/Stephen_Curry_shooting.jpg",
  jokic:       "https://upload.wikimedia.org/wikipedia/commons/6/6b/Nikola_Jokic_%2840980299891%29.jpg",
  luka:        "https://upload.wikimedia.org/wikipedia/commons/7/73/Luka_Doncic_%28cropped%29.jpg",
  wemby:       "https://upload.wikimedia.org/wikipedia/commons/2/21/Victor_Wembanyama_San_Antonio_Spurs_2025_NBA_Cup.jpg",
  lebron:      "https://upload.wikimedia.org/wikipedia/commons/6/60/Lebron_dunking_finals_2016.jpg",
  lebronSteph: "https://upload.wikimedia.org/wikipedia/commons/5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg",
  rayAllen:    "https://upload.wikimedia.org/wikipedia/commons/f/f7/Ray_Allen_Heat.jpg",
};

// ─── Cards ─────────────────────────────────────────────────────────────────────
export const MY_TEAM_CARDS: MTCard[] = [

  // ── Michael Jordan ──────────────────────────────────────────────────────────
  {
    id: "jordan-9596",
    firstName: "Michael", lastName: "Jordan", era: "1995-96",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG",
    starLevel: 15,
    photo: PHOTOS.jordan, photoPos: "center 15%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Clutch Gene", "Volume Scorer"],
    ppg: 30.4, rpg: 6.6, apg: 4.3, fg: 49.5,
  },
  {
    id: "jordan-9192",
    firstName: "Michael", lastName: "Jordan", era: "1991-92",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG",
    starLevel: 14,
    photo: PHOTOS.jordan, photoPos: "center 15%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Clutch Gene"],
    ppg: 30.1, rpg: 6.4, apg: 6.1, fg: 51.9,
  },
  {
    id: "jordan-8687",
    firstName: "Michael", lastName: "Jordan", era: "1986-87",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG",
    starLevel: 12,
    photo: PHOTOS.jordan, photoPos: "center 15%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Volume Scorer", "Ankle Breaker"],
    ppg: 37.1, rpg: 5.2, apg: 4.6, fg: 48.2,
  },

  // ── Stephen Curry ───────────────────────────────────────────────────────────
  {
    id: "curry-1516",
    firstName: "Stephen", lastName: "Curry", era: "2015-16",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG",
    starLevel: 15,
    photo: PHOTOS.curry, photoPos: "center 25%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range", "Ankle Breaker", "Clutch Gene"],
    ppg: 30.1, rpg: 5.4, apg: 6.7, fg: 50.4,
  },
  {
    id: "curry-1819",
    firstName: "Stephen", lastName: "Curry", era: "2018-19",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG",
    starLevel: 9,
    photo: PHOTOS.curry, photoPos: "center 25%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range", "Ankle Breaker"],
    ppg: 27.3, rpg: 5.3, apg: 6.2, fg: 47.2,
  },
  {
    id: "curry-2223",
    firstName: "Stephen", lastName: "Curry", era: "2022-23",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG",
    starLevel: 7,
    photo: PHOTOS.curry, photoPos: "center 25%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range"],
    ppg: 29.4, rpg: 6.1, apg: 6.3, fg: 49.3,
  },
  {
    id: "curry-1213",
    firstName: "Stephen", lastName: "Curry", era: "2012-13",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG",
    starLevel: 4,
    photo: PHOTOS.curry, photoPos: "center 25%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Floor General"],
    ppg: 22.9, rpg: 4.0, apg: 6.9, fg: 45.1,
  },

  // ── LeBron James ────────────────────────────────────────────────────────────
  {
    id: "lebron-1213",
    firstName: "LeBron", lastName: "James", era: "2012-13",
    team: "Miami Heat", teamAbbr: "MIA", position: "SF",
    starLevel: 14,
    photo: PHOTOS.lebronSteph, photoPos: "left 20%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Floor General", "Transition Threat", "Clutch Gene"],
    ppg: 26.8, rpg: 8.0, apg: 7.3, fg: 56.5,
  },
  {
    id: "lebron-1516",
    firstName: "LeBron", lastName: "James", era: "2015-16",
    team: "Cleveland Cavaliers", teamAbbr: "CLE", position: "SF",
    starLevel: 12,
    photo: PHOTOS.lebron, photoPos: "center 20%",
    teamColor: "#860038", accentColor: "#FDBB30",
    badges: ["Floor General", "Clutch Gene"],
    ppg: 25.3, rpg: 7.4, apg: 6.8, fg: 52.0,
  },
  {
    id: "lebron-1718",
    firstName: "LeBron", lastName: "James", era: "2017-18",
    team: "Cleveland Cavaliers", teamAbbr: "CLE", position: "SF",
    starLevel: 9,
    photo: PHOTOS.lebron, photoPos: "center 20%",
    teamColor: "#860038", accentColor: "#FDBB30",
    badges: ["Floor General", "Transition Threat"],
    ppg: 27.5, rpg: 8.6, apg: 9.1, fg: 54.2,
  },
  {
    id: "lebron-2324",
    firstName: "LeBron", lastName: "James", era: "2023-24",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SF",
    starLevel: 5,
    photo: PHOTOS.lebron, photoPos: "center 20%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Transition Threat"],
    ppg: 25.7, rpg: 7.3, apg: 8.3, fg: 54.0,
  },

  // ── Kobe Bryant ─────────────────────────────────────────────────────────────
  {
    id: "kobe-0506",
    firstName: "Kobe", lastName: "Bryant", era: "2005-06",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG",
    starLevel: 13,
    photo: PHOTOS.kobe, photoPos: "center 20%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Volume Scorer", "Mid-Range Maestro", "Clutch Gene"],
    ppg: 35.4, rpg: 5.3, apg: 4.5, fg: 45.0,
  },
  {
    id: "kobe-0708",
    firstName: "Kobe", lastName: "Bryant", era: "2007-08",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG",
    starLevel: 10,
    photo: PHOTOS.kobe, photoPos: "center 20%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Mid-Range Maestro", "Volume Scorer"],
    ppg: 28.3, rpg: 6.3, apg: 5.4, fg: 45.9,
  },
  {
    id: "kobe-0001",
    firstName: "Kobe", lastName: "Bryant", era: "2000-01",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG",
    starLevel: 5,
    photo: PHOTOS.kobe, photoPos: "center 20%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Ankle Breaker"],
    ppg: 28.5, rpg: 5.9, apg: 5.0, fg: 46.4,
  },

  // ── Nikola Jokic ────────────────────────────────────────────────────────────
  {
    id: "jokic-2122",
    firstName: "Nikola", lastName: "Jokić", era: "2021-22",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C",
    starLevel: 13,
    photo: PHOTOS.jokic, photoPos: "center 15%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Flashy Passer", "Pick & Roll"],
    ppg: 27.1, rpg: 13.8, apg: 7.9, fg: 58.3,
  },
  {
    id: "jokic-2324",
    firstName: "Nikola", lastName: "Jokić", era: "2023-24",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C",
    starLevel: 14,
    photo: PHOTOS.jokic, photoPos: "center 15%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Flashy Passer", "Pick & Roll", "Box Out Beast"],
    ppg: 26.4, rpg: 12.4, apg: 9.0, fg: 58.3,
  },
  {
    id: "jokic-1920",
    firstName: "Nikola", lastName: "Jokić", era: "2019-20",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C",
    starLevel: 8,
    photo: PHOTOS.jokic, photoPos: "center 15%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Pick & Roll"],
    ppg: 20.2, rpg: 10.2, apg: 6.9, fg: 52.8,
  },
  {
    id: "jokic-1718",
    firstName: "Nikola", lastName: "Jokić", era: "2017-18",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C",
    starLevel: 4,
    photo: PHOTOS.jokic, photoPos: "center 15%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Pick & Roll"],
    ppg: 18.5, rpg: 10.7, apg: 6.1, fg: 49.9,
  },

  // ── Luka Doncic ─────────────────────────────────────────────────────────────
  {
    id: "luka-2324",
    firstName: "Luka", lastName: "Dončić", era: "2023-24",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG",
    starLevel: 10,
    photo: PHOTOS.luka, photoPos: "center 15%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker", "Floor General", "Clutch Gene"],
    ppg: 33.9, rpg: 9.2, apg: 9.8, fg: 48.7,
  },
  {
    id: "luka-2223",
    firstName: "Luka", lastName: "Dončić", era: "2022-23",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG",
    starLevel: 8,
    photo: PHOTOS.luka, photoPos: "center 15%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker", "Volume Scorer"],
    ppg: 32.4, rpg: 8.6, apg: 8.0, fg: 49.6,
  },
  {
    id: "luka-2122",
    firstName: "Luka", lastName: "Dončić", era: "2021-22",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG",
    starLevel: 5,
    photo: PHOTOS.luka, photoPos: "center 15%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker"],
    ppg: 28.4, rpg: 9.1, apg: 8.7, fg: 45.7,
  },

  // ── Victor Wembanyama ────────────────────────────────────────────────────────
  {
    id: "wemby-2425",
    firstName: "Victor", lastName: "Wembanyama", era: "2024-25",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "C",
    starLevel: 11,
    photo: PHOTOS.wemby, photoPos: "center 10%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Rim Runner", "Limitless Range", "Box Out Beast"],
    ppg: 24.3, rpg: 10.7, apg: 3.9, fg: 47.4,
  },
  {
    id: "wemby-2324",
    firstName: "Victor", lastName: "Wembanyama", era: "2023-24",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "C",
    starLevel: 7,
    photo: PHOTOS.wemby, photoPos: "center 10%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Rim Runner", "Limitless Range"],
    ppg: 21.4, rpg: 10.6, apg: 3.9, fg: 46.5,
  },

  // ── Ray Allen ────────────────────────────────────────────────────────────────
  {
    id: "rayallen-1011",
    firstName: "Ray", lastName: "Allen", era: "2010-11",
    team: "Boston Celtics", teamAbbr: "BOS", position: "SG",
    starLevel: 7,
    photo: PHOTOS.rayAllen, photoPos: "center 15%",
    teamColor: "#007A33", accentColor: "#BA9653",
    badges: ["Limitless Range", "Clutch Gene"],
    ppg: 16.5, rpg: 3.4, apg: 2.6, fg: 47.3,
  },
  {
    id: "rayallen-1213",
    firstName: "Ray", lastName: "Allen", era: "2012-13",
    team: "Miami Heat", teamAbbr: "MIA", position: "SG",
    starLevel: 6,
    photo: PHOTOS.rayAllen, photoPos: "center 15%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Limitless Range"],
    ppg: 10.9, rpg: 2.7, apg: 1.2, fg: 42.9,
  },
];

// ─── Team shape saved to Clerk ──────────────────────────────────────────────────
export interface SavedTeam {
  starters: string[]; // up to 5 card IDs
  bench: string[];    // up to 5 card IDs
}

export const EMPTY_TEAM: SavedTeam = { starters: [], bench: [] };

export function cardById(id: string): MTCard | undefined {
  return MY_TEAM_CARDS.find(c => c.id === id);
}
