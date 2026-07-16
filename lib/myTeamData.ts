// ─── Star tier system ──────────────────────────────────────────────────────────
// starLevel 1-15:
//   1-5  → gold stars (fill slots 1→5 from left)
//   6-10 → blue stars replace gold from left (slot 1 blue at 6, slot 2 at 7 …)
//   11-15→ purple stars replace blue from left (slot 1 purple at 11 …)
export type StarColor = "empty" | "gold" | "blue" | "purple";

export function getStarColor(slot: number, level: number): StarColor {
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
  era: string;
  team: string;
  teamAbbr: string;
  position: string;
  starLevel: number;  // 1-15
  photo?: string;
  photoPos?: string;
  teamColor: string;
  accentColor: string;
  badges: string[];
  ppg: number;
  rpg: number;
  apg: number;
  fg: number;
}

// ─── Photo helper ───────────────────────────────────────────────────────────────
const WC = (p: string) => `https://upload.wikimedia.org/wikipedia/commons/${p}`;
const HS = (id: number) => `/api/nba-headshot/${id}`;

// Confirmed 200 or 429 (rate-limit only; loads fine in browser)
const P = {
  // Confirmed 200
  jordan97:      WC("4/43/Steve_Lipfosky_--_Michael_Jordan_%281997%29.jpg"),
  jordan88:      WC("3/38/Michael_Jordan_in_1988.jpg"),
  kobe81:        WC("f/fc/Kobe_Bryant_81.jpg"),
  curry_shoot:   WC("b/b6/Stephen_Curry_shooting.jpg"),
  curry_13:      WC("5/5c/Stephen_Curry_2013.jpg"),
  jokic:         WC("6/6b/Nikola_Jokic_%2840980299891%29.jpg"),
  luka:          WC("7/73/Luka_Doncic_%28cropped%29.jpg"),
  wemby:         WC("2/21/Victor_Wembanyama_San_Antonio_Spurs_2025_NBA_Cup.jpg"),
  lebron_block:  WC("6/60/Lebron_dunking_finals_2016.jpg"),
  lebron_duel:   WC("5/5e/LeBron_James_vs._Steph_Curry_%2827676810241%29.jpg"),
  lebron_heat:   WC("c/cf/LeBron_James_crop.jpg"),
  ray_heat:      WC("f/f7/Ray_Allen_Heat.jpg"),
  // Rate-limited but valid (will load in browser)
  magic:         WC("5/56/Magic_Johnson_2016.jpg"),
  giannis_early: WC("7/74/Giannis_Antetokounmpo_2015.jpg"),
  iverson:       WC("e/e4/Allen_Iverson_Wizards.jpg"),
  wade:          WC("d/d4/Dwyane_Wade_Heat.jpg"),
  duncan:        WC("3/3a/Tim_Duncan_2014.jpg"),
  hakeem:        WC("b/b9/Hakeem_Olajuwon.jpg"),
  bird:          WC("3/34/Larry_Bird.jpg"),
  dirk:          WC("e/e8/Dirk_Nowitzki_2011.jpg"),
  kareem:        WC("a/a5/Kareem_Abdul-Jabbar_1974.jpg"),
  barkley:       WC("e/ef/Charles_Barkley.jpg"),
  kd_16:         WC("8/86/Kevin_Durant_2016.jpg"),
  // NBA headshot proxy (active players, current uniform)
  curry_now:     HS(201939),
  lebron_now:    HS(2544),
  jokic_now:     HS(203999),
  luka_now:      HS(1629029),
  wemby_now:     HS(1641705),
  kd_now:        HS(201142),
  giannis_now:   HS(203507),
  lillard_now:   HS(203081),
};

// ─── Cards ─────────────────────────────────────────────────────────────────────
export const MY_TEAM_CARDS: MTCard[] = [

  // ── Michael Jordan ─────────────────────────────────────────────────
  {
    id: "jordan-8687",
    firstName: "Michael", lastName: "Jordan", era: "1986-87",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG", starLevel: 12,
    photo: P.jordan88, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Volume Scorer", "Ankle Breaker"],
    ppg: 37.1, rpg: 5.2, apg: 4.6, fg: 48.2,
  },
  {
    id: "jordan-9192",
    firstName: "Michael", lastName: "Jordan", era: "1991-92",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG", starLevel: 14,
    photo: P.jordan97, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Clutch Gene"],
    ppg: 30.1, rpg: 6.4, apg: 6.1, fg: 51.9,
  },
  {
    id: "jordan-9596",
    firstName: "Michael", lastName: "Jordan", era: "1995-96",
    team: "Chicago Bulls", teamAbbr: "CHI", position: "SG", starLevel: 15,
    photo: P.jordan97, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Clutch Gene", "Volume Scorer"],
    ppg: 30.4, rpg: 6.6, apg: 4.3, fg: 49.5,
  },

  // ── Stephen Curry ────────────────────────────────────────────────
  {
    id: "curry-1213",
    firstName: "Stephen", lastName: "Curry", era: "2012-13",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG", starLevel: 4,
    photo: P.curry_13, photoPos: "center 20%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Floor General"],
    ppg: 22.9, rpg: 4.0, apg: 6.9, fg: 45.1,
  },
  {
    id: "curry-1516",
    firstName: "Stephen", lastName: "Curry", era: "2015-16",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG", starLevel: 15,
    photo: P.curry_shoot, photoPos: "center 22%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range", "Ankle Breaker", "Clutch Gene"],
    ppg: 30.1, rpg: 5.4, apg: 6.7, fg: 50.4,
  },
  {
    id: "curry-1819",
    firstName: "Stephen", lastName: "Curry", era: "2018-19",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG", starLevel: 9,
    photo: P.curry_shoot, photoPos: "center 22%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range", "Ankle Breaker"],
    ppg: 27.3, rpg: 5.3, apg: 6.2, fg: 47.2,
  },
  {
    id: "curry-2223",
    firstName: "Stephen", lastName: "Curry", era: "2022-23",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "PG", starLevel: 7,
    photo: P.curry_now, photoPos: "center 10%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Limitless Range"],
    ppg: 29.4, rpg: 6.1, apg: 6.3, fg: 49.3,
  },

  // ── LeBron James ──────────────────────────────────────────────────
  {
    id: "lebron-1213",
    firstName: "LeBron", lastName: "James", era: "2012-13",
    team: "Miami Heat", teamAbbr: "MIA", position: "SF", starLevel: 14,
    photo: P.lebron_heat, photoPos: "center 10%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Floor General", "Transition Threat", "Clutch Gene"],
    ppg: 26.8, rpg: 8.0, apg: 7.3, fg: 56.5,
  },
  {
    id: "lebron-1516",
    firstName: "LeBron", lastName: "James", era: "2015-16",
    team: "Cleveland Cavaliers", teamAbbr: "CLE", position: "SF", starLevel: 12,
    photo: P.lebron_block, photoPos: "center 15%",
    teamColor: "#860038", accentColor: "#FDBB30",
    badges: ["Floor General", "Clutch Gene"],
    ppg: 25.3, rpg: 7.4, apg: 6.8, fg: 52.0,
  },
  {
    id: "lebron-1718",
    firstName: "LeBron", lastName: "James", era: "2017-18",
    team: "Cleveland Cavaliers", teamAbbr: "CLE", position: "SF", starLevel: 9,
    photo: P.lebron_duel, photoPos: "left 20%",
    teamColor: "#860038", accentColor: "#FDBB30",
    badges: ["Floor General", "Transition Threat"],
    ppg: 27.5, rpg: 8.6, apg: 9.1, fg: 54.2,
  },
  {
    id: "lebron-2324",
    firstName: "LeBron", lastName: "James", era: "2023-24",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SF", starLevel: 5,
    photo: P.lebron_now, photoPos: "center 10%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Transition Threat"],
    ppg: 25.7, rpg: 7.3, apg: 8.3, fg: 54.0,
  },

  // ── Kobe Bryant ───────────────────────────────────────────────────
  {
    id: "kobe-0001",
    firstName: "Kobe", lastName: "Bryant", era: "2000-01",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG", starLevel: 5,
    photo: P.kobe81, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Ankle Breaker"],
    ppg: 28.5, rpg: 5.9, apg: 5.0, fg: 46.4,
  },
  {
    id: "kobe-0506",
    firstName: "Kobe", lastName: "Bryant", era: "2005-06",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG", starLevel: 13,
    photo: P.kobe81, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Volume Scorer", "Mid-Range Maestro", "Clutch Gene"],
    ppg: 35.4, rpg: 5.3, apg: 4.5, fg: 45.0,
  },
  {
    id: "kobe-0708",
    firstName: "Kobe", lastName: "Bryant", era: "2007-08",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "SG", starLevel: 10,
    photo: P.kobe81, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Mid-Range Maestro", "Volume Scorer"],
    ppg: 28.3, rpg: 6.3, apg: 5.4, fg: 45.9,
  },

  // ── Nikola Jokic ──────────────────────────────────────────────────
  {
    id: "jokic-1718",
    firstName: "Nikola", lastName: "Jokić", era: "2017-18",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C", starLevel: 4,
    photo: P.jokic, photoPos: "center 12%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Pick & Roll"],
    ppg: 18.5, rpg: 10.7, apg: 6.1, fg: 49.9,
  },
  {
    id: "jokic-1920",
    firstName: "Nikola", lastName: "Jokić", era: "2019-20",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C", starLevel: 8,
    photo: P.jokic, photoPos: "center 12%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Pick & Roll"],
    ppg: 20.2, rpg: 10.2, apg: 6.9, fg: 52.8,
  },
  {
    id: "jokic-2122",
    firstName: "Nikola", lastName: "Jokić", era: "2021-22",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C", starLevel: 13,
    photo: P.jokic_now, photoPos: "center 10%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Flashy Passer", "Pick & Roll"],
    ppg: 27.1, rpg: 13.8, apg: 7.9, fg: 58.3,
  },
  {
    id: "jokic-2324",
    firstName: "Nikola", lastName: "Jokić", era: "2023-24",
    team: "Denver Nuggets", teamAbbr: "DEN", position: "C", starLevel: 14,
    photo: P.jokic_now, photoPos: "center 10%",
    teamColor: "#0E2240", accentColor: "#FEC524",
    badges: ["Floor General", "Flashy Passer", "Pick & Roll", "Box Out Beast"],
    ppg: 26.4, rpg: 12.4, apg: 9.0, fg: 58.3,
  },

  // ── Luka Doncic ───────────────────────────────────────────────────
  {
    id: "luka-2122",
    firstName: "Luka", lastName: "Dončić", era: "2021-22",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG", starLevel: 5,
    photo: P.luka, photoPos: "center 12%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker"],
    ppg: 28.4, rpg: 9.1, apg: 8.7, fg: 45.7,
  },
  {
    id: "luka-2223",
    firstName: "Luka", lastName: "Dončić", era: "2022-23",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG", starLevel: 8,
    photo: P.luka, photoPos: "center 12%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker", "Volume Scorer"],
    ppg: 32.4, rpg: 8.6, apg: 8.0, fg: 49.6,
  },
  {
    id: "luka-2324",
    firstName: "Luka", lastName: "Dončić", era: "2023-24",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PG", starLevel: 10,
    photo: P.luka_now, photoPos: "center 10%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Ankle Breaker", "Floor General", "Clutch Gene"],
    ppg: 33.9, rpg: 9.2, apg: 9.8, fg: 48.7,
  },

  // ── Victor Wembanyama ─────────────────────────────────────────────
  {
    id: "wemby-2324",
    firstName: "Victor", lastName: "Wembanyama", era: "2023-24",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "C", starLevel: 7,
    photo: P.wemby, photoPos: "center 8%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Rim Runner", "Limitless Range"],
    ppg: 21.4, rpg: 10.6, apg: 3.9, fg: 46.5,
  },
  {
    id: "wemby-2425",
    firstName: "Victor", lastName: "Wembanyama", era: "2024-25",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "C", starLevel: 11,
    photo: P.wemby_now, photoPos: "center 8%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Rim Runner", "Limitless Range", "Box Out Beast"],
    ppg: 24.3, rpg: 10.7, apg: 3.9, fg: 47.4,
  },

  // ── Shaquille O'Neal ──────────────────────────────────────────────
  {
    id: "shaq-9900",
    firstName: "Shaquille", lastName: "O'Neal", era: "1999-00",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "C", starLevel: 14,
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Backdown Bully", "Contact Finisher", "Rim Runner"],
    ppg: 29.7, rpg: 13.6, apg: 3.8, fg: 57.4,
  },
  {
    id: "shaq-0203",
    firstName: "Shaquille", lastName: "O'Neal", era: "2002-03",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "C", starLevel: 12,
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Backdown Bully", "Rim Runner"],
    ppg: 27.5, rpg: 12.0, apg: 3.6, fg: 57.4,
  },
  {
    id: "shaq-0506",
    firstName: "Shaquille", lastName: "O'Neal", era: "2005-06",
    team: "Miami Heat", teamAbbr: "MIA", position: "C", starLevel: 9,
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Backdown Bully", "Pick & Roll"],
    ppg: 20.0, rpg: 9.2, apg: 3.8, fg: 60.5,
  },

  // ── Magic Johnson ─────────────────────────────────────────────────
  {
    id: "magic-8687",
    firstName: "Magic", lastName: "Johnson", era: "1986-87",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "PG", starLevel: 13,
    photo: P.magic, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Floor General", "Flashy Passer", "Pick & Roll"],
    ppg: 23.9, rpg: 6.3, apg: 12.2, fg: 52.2,
  },
  {
    id: "magic-8889",
    firstName: "Magic", lastName: "Johnson", era: "1988-89",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "PG", starLevel: 11,
    photo: P.magic, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Floor General", "Flashy Passer"],
    ppg: 22.5, rpg: 7.9, apg: 12.8, fg: 50.9,
  },

  // ── Hakeem Olajuwon ───────────────────────────────────────────────
  {
    id: "hakeem-9394",
    firstName: "Hakeem", lastName: "Olajuwon", era: "1993-94",
    team: "Houston Rockets", teamAbbr: "HOU", position: "C", starLevel: 13,
    photo: P.hakeem, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#C4CED4",
    badges: ["Dream Shake", "Rim Runner", "Box Out Beast"],
    ppg: 27.3, rpg: 11.9, apg: 3.6, fg: 52.8,
  },
  {
    id: "hakeem-9495",
    firstName: "Hakeem", lastName: "Olajuwon", era: "1994-95",
    team: "Houston Rockets", teamAbbr: "HOU", position: "C", starLevel: 11,
    photo: P.hakeem, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#C4CED4",
    badges: ["Dream Shake", "Rim Runner"],
    ppg: 27.8, rpg: 10.8, apg: 3.5, fg: 51.7,
  },

  // ── Allen Iverson ────────────────────────────────────────────────
  {
    id: "iverson-0001",
    firstName: "Allen", lastName: "Iverson", era: "2000-01",
    team: "Philadelphia 76ers", teamAbbr: "PHI", position: "PG", starLevel: 12,
    photo: P.iverson, photoPos: "center 12%",
    teamColor: "#006BB6", accentColor: "#ED174C",
    badges: ["Ankle Breaker", "Volume Scorer", "Clutch Gene"],
    ppg: 31.1, rpg: 3.8, apg: 4.6, fg: 42.0,
  },
  {
    id: "iverson-0405",
    firstName: "Allen", lastName: "Iverson", era: "2004-05",
    team: "Philadelphia 76ers", teamAbbr: "PHI", position: "PG", starLevel: 8,
    photo: P.iverson, photoPos: "center 12%",
    teamColor: "#006BB6", accentColor: "#ED174C",
    badges: ["Ankle Breaker", "Volume Scorer"],
    ppg: 30.7, rpg: 4.0, apg: 7.9, fg: 42.2,
  },

  // ── Kevin Durant ─────────────────────────────────────────────────
  {
    id: "kd-1314",
    firstName: "Kevin", lastName: "Durant", era: "2013-14",
    team: "Oklahoma City Thunder", teamAbbr: "OKC", position: "SF", starLevel: 13,
    teamColor: "#007AC1", accentColor: "#EF3B24",
    badges: ["Mid-Range Maestro", "Volume Scorer", "Limitless Range"],
    ppg: 32.0, rpg: 7.4, apg: 5.5, fg: 50.3,
  },
  {
    id: "kd-1617",
    firstName: "Kevin", lastName: "Durant", era: "2016-17",
    team: "Golden State Warriors", teamAbbr: "GSW", position: "SF", starLevel: 11,
    photo: P.kd_16, photoPos: "center 12%",
    teamColor: "#1D428A", accentColor: "#FFC72C",
    badges: ["Mid-Range Maestro", "Limitless Range"],
    ppg: 25.1, rpg: 8.3, apg: 4.8, fg: 53.7,
  },
  {
    id: "kd-2122",
    firstName: "Kevin", lastName: "Durant", era: "2021-22",
    team: "Brooklyn Nets", teamAbbr: "BKN", position: "SF", starLevel: 9,
    photo: P.kd_now, photoPos: "center 10%",
    teamColor: "#000000", accentColor: "#FFFFFF",
    badges: ["Mid-Range Maestro", "Volume Scorer"],
    ppg: 29.9, rpg: 7.4, apg: 6.4, fg: 51.8,
  },

  // ── Giannis Antetokounmpo ────────────────────────────────────────
  {
    id: "giannis-1819",
    firstName: "Giannis", lastName: "Antetokounmpo", era: "2018-19",
    team: "Milwaukee Bucks", teamAbbr: "MIL", position: "PF", starLevel: 9,
    photo: P.giannis_early, photoPos: "center 12%",
    teamColor: "#00471B", accentColor: "#EEE1C6",
    badges: ["Rim Runner", "Contact Finisher"],
    ppg: 27.7, rpg: 12.5, apg: 5.9, fg: 57.8,
  },
  {
    id: "giannis-2021",
    firstName: "Giannis", lastName: "Antetokounmpo", era: "2020-21",
    team: "Milwaukee Bucks", teamAbbr: "MIL", position: "PF", starLevel: 12,
    photo: P.giannis_now, photoPos: "center 10%",
    teamColor: "#00471B", accentColor: "#EEE1C6",
    badges: ["Rim Runner", "Contact Finisher", "Box Out Beast"],
    ppg: 28.1, rpg: 11.0, apg: 5.9, fg: 56.9,
  },
  {
    id: "giannis-2324",
    firstName: "Giannis", lastName: "Antetokounmpo", era: "2023-24",
    team: "Milwaukee Bucks", teamAbbr: "MIL", position: "PF", starLevel: 10,
    photo: P.giannis_now, photoPos: "center 10%",
    teamColor: "#00471B", accentColor: "#EEE1C6",
    badges: ["Rim Runner", "Contact Finisher"],
    ppg: 30.4, rpg: 11.5, apg: 6.5, fg: 61.1,
  },

  // ── Dirk Nowitzki ────────────────────────────────────────────────
  {
    id: "dirk-0506",
    firstName: "Dirk", lastName: "Nowitzki", era: "2005-06",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PF", starLevel: 9,
    photo: P.dirk, photoPos: "center 12%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Mid-Range Maestro", "Volume Scorer"],
    ppg: 26.6, rpg: 9.0, apg: 2.8, fg: 48.0,
  },
  {
    id: "dirk-1011",
    firstName: "Dirk", lastName: "Nowitzki", era: "2010-11",
    team: "Dallas Mavericks", teamAbbr: "DAL", position: "PF", starLevel: 11,
    photo: P.dirk, photoPos: "center 12%",
    teamColor: "#00538C", accentColor: "#B8C4CA",
    badges: ["Mid-Range Maestro", "Clutch Gene", "Volume Scorer"],
    ppg: 23.0, rpg: 7.0, apg: 2.6, fg: 51.9,
  },

  // ── Dwyane Wade ──────────────────────────────────────────────────
  {
    id: "wade-0506",
    firstName: "Dwyane", lastName: "Wade", era: "2005-06",
    team: "Miami Heat", teamAbbr: "MIA", position: "SG", starLevel: 11,
    photo: P.wade, photoPos: "center 12%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Contact Finisher", "Clutch Gene", "Transition Threat"],
    ppg: 27.2, rpg: 5.7, apg: 6.7, fg: 49.5,
  },
  {
    id: "wade-1112",
    firstName: "Dwyane", lastName: "Wade", era: "2011-12",
    team: "Miami Heat", teamAbbr: "MIA", position: "SG", starLevel: 8,
    photo: P.wade, photoPos: "center 12%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Contact Finisher", "Transition Threat"],
    ppg: 22.1, rpg: 4.8, apg: 4.6, fg: 49.6,
  },

  // ── Tim Duncan ───────────────────────────────────────────────────
  {
    id: "duncan-0203",
    firstName: "Tim", lastName: "Duncan", era: "2002-03",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "PF", starLevel: 12,
    photo: P.duncan, photoPos: "center 12%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Box Out Beast", "Pick & Roll"],
    ppg: 23.3, rpg: 12.9, apg: 3.9, fg: 51.3,
  },
  {
    id: "duncan-0506",
    firstName: "Tim", lastName: "Duncan", era: "2005-06",
    team: "San Antonio Spurs", teamAbbr: "SAS", position: "PF", starLevel: 9,
    photo: P.duncan, photoPos: "center 12%",
    teamColor: "#C4CED4", accentColor: "#000000",
    badges: ["Mid-Range Maestro", "Box Out Beast"],
    ppg: 18.6, rpg: 11.0, apg: 3.2, fg: 50.6,
  },

  // ── Kareem Abdul-Jabbar ──────────────────────────────────────────
  {
    id: "kareem-7172",
    firstName: "Kareem", lastName: "Abdul-Jabbar", era: "1971-72",
    team: "Milwaukee Bucks", teamAbbr: "MIL", position: "C", starLevel: 13,
    photo: P.kareem, photoPos: "center 12%",
    teamColor: "#00471B", accentColor: "#EEE1C6",
    badges: ["Dream Shake", "Box Out Beast", "Mid-Range Maestro"],
    ppg: 34.8, rpg: 16.6, apg: 4.6, fg: 57.4,
  },
  {
    id: "kareem-7677",
    firstName: "Kareem", lastName: "Abdul-Jabbar", era: "1976-77",
    team: "Los Angeles Lakers", teamAbbr: "LAL", position: "C", starLevel: 10,
    photo: P.kareem, photoPos: "center 12%",
    teamColor: "#552583", accentColor: "#FDB927",
    badges: ["Dream Shake", "Box Out Beast"],
    ppg: 26.2, rpg: 13.3, apg: 3.9, fg: 57.9,
  },

  // ── Larry Bird ───────────────────────────────────────────────────
  {
    id: "bird-8384",
    firstName: "Larry", lastName: "Bird", era: "1983-84",
    team: "Boston Celtics", teamAbbr: "BOS", position: "SF", starLevel: 9,
    photo: P.bird, photoPos: "center 12%",
    teamColor: "#007A33", accentColor: "#BA9653",
    badges: ["Mid-Range Maestro", "Clutch Gene"],
    ppg: 24.2, rpg: 10.1, apg: 6.6, fg: 49.2,
  },
  {
    id: "bird-8586",
    firstName: "Larry", lastName: "Bird", era: "1985-86",
    team: "Boston Celtics", teamAbbr: "BOS", position: "SF", starLevel: 11,
    photo: P.bird, photoPos: "center 12%",
    teamColor: "#007A33", accentColor: "#BA9653",
    badges: ["Mid-Range Maestro", "Clutch Gene", "Floor General"],
    ppg: 25.8, rpg: 9.8, apg: 6.8, fg: 49.6,
  },

  // ── Charles Barkley ──────────────────────────────────────────────
  {
    id: "barkley-9293",
    firstName: "Charles", lastName: "Barkley", era: "1992-93",
    team: "Phoenix Suns", teamAbbr: "PHX", position: "PF", starLevel: 11,
    photo: P.barkley, photoPos: "center 12%",
    teamColor: "#1D1160", accentColor: "#E56020",
    badges: ["Box Out Beast", "Volume Scorer", "Backdown Bully"],
    ppg: 25.6, rpg: 12.2, apg: 5.1, fg: 52.0,
  },
  {
    id: "barkley-9596",
    firstName: "Charles", lastName: "Barkley", era: "1995-96",
    team: "Houston Rockets", teamAbbr: "HOU", position: "PF", starLevel: 8,
    photo: P.barkley, photoPos: "center 12%",
    teamColor: "#CE1141", accentColor: "#C4CED4",
    badges: ["Box Out Beast", "Volume Scorer"],
    ppg: 23.2, rpg: 11.2, apg: 3.5, fg: 55.7,
  },

  // ── Ray Allen ────────────────────────────────────────────────────
  {
    id: "rayallen-1011",
    firstName: "Ray", lastName: "Allen", era: "2010-11",
    team: "Boston Celtics", teamAbbr: "BOS", position: "SG", starLevel: 6,
    teamColor: "#007A33", accentColor: "#BA9653",
    badges: ["Limitless Range"],
    ppg: 16.5, rpg: 3.4, apg: 2.6, fg: 47.3,
  },
  {
    id: "rayallen-1213",
    firstName: "Ray", lastName: "Allen", era: "2012-13",
    team: "Miami Heat", teamAbbr: "MIA", position: "SG", starLevel: 7,
    photo: P.ray_heat, photoPos: "center 15%",
    teamColor: "#98002E", accentColor: "#F9A01B",
    badges: ["Limitless Range", "Clutch Gene"],
    ppg: 10.9, rpg: 2.7, apg: 1.2, fg: 42.9,
  },

  // ── Damian Lillard ───────────────────────────────────────────────
  {
    id: "lillard-2021",
    firstName: "Damian", lastName: "Lillard", era: "2020-21",
    team: "Portland Trail Blazers", teamAbbr: "POR", position: "PG", starLevel: 7,
    photo: P.lillard_now, photoPos: "center 10%",
    teamColor: "#E03A3E", accentColor: "#000000",
    badges: ["Limitless Range", "Clutch Gene"],
    ppg: 28.8, rpg: 4.2, apg: 7.5, fg: 45.1,
  },
  {
    id: "lillard-2324",
    firstName: "Damian", lastName: "Lillard", era: "2023-24",
    team: "Milwaukee Bucks", teamAbbr: "MIL", position: "PG", starLevel: 8,
    photo: P.lillard_now, photoPos: "center 10%",
    teamColor: "#00471B", accentColor: "#EEE1C6",
    badges: ["Limitless Range", "Ankle Breaker"],
    ppg: 24.3, rpg: 4.4, apg: 7.1, fg: 43.6,
  },
];

// ─── Saved state ───────────────────────────────────────────────────────────────
export interface TeamState {
  collection: string[];  // owned card IDs
  packs: number;         // pack inventory
  starters: string[];    // up to 5 IDs
  bench: string[];       // up to 5 IDs
}

export const DEFAULT_TEAM_STATE: TeamState = {
  collection: [],
  packs: 3,
  starters: [],
  bench: [],
};

export function cardById(id: string): MTCard | undefined {
  return MY_TEAM_CARDS.find(c => c.id === id);
}

// ─── Pack generation ──────────────────────────────────────────────────────────
function randomTier(slot: number, guaranteePurple: boolean): "gold" | "blue" | "purple" {
  if (guaranteePurple && slot === 4) return "purple";
  const r = Math.random();
  if (r < 0.12) return "purple";
  if (r < 0.45) return "blue";
  return "gold";
}

export function generatePack(owned: Set<string>): MTCard[] {
  const result: MTCard[] = [];
  const usedInPack = new Set<string>();
  let hasPurple = false;

  for (let i = 0; i < 5; i++) {
    const tier = randomTier(i, !hasPurple && i === 4);
    if (tier === "purple") hasPurple = true;

    // Prefer unowned cards of that tier
    const candidates = MY_TEAM_CARDS.filter(c =>
      tierFromLevel(c.starLevel) === tier &&
      !usedInPack.has(c.id) &&
      !owned.has(c.id)
    );
    // Fall back to any card of that tier not yet in this pack
    const fallback = MY_TEAM_CARDS.filter(c =>
      tierFromLevel(c.starLevel) === tier && !usedInPack.has(c.id)
    );
    // Final fallback: any card not in pack
    const any = MY_TEAM_CARDS.filter(c => !usedInPack.has(c.id));

    const pool = candidates.length > 0 ? candidates : fallback.length > 0 ? fallback : any;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    result.push(picked);
    usedInPack.add(picked.id);
  }

  return result;
}

export const DAILY_PACK_KEY = "my_team_last_pack_date_v1";
