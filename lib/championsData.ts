export type Champion = {
  year: number;
  team: string;
  shortName: string;
};

export const CHAMPIONS: Champion[] = [
  { year: 1990, team: "Detroit Pistons",      shortName: "Detroit" },
  { year: 1991, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1992, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1993, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1994, team: "Houston Rockets",       shortName: "Houston" },
  { year: 1995, team: "Houston Rockets",       shortName: "Houston" },
  { year: 1996, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1997, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1998, team: "Chicago Bulls",         shortName: "Chicago" },
  { year: 1999, team: "San Antonio Spurs",     shortName: "San Antonio" },
  { year: 2000, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2001, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2002, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2003, team: "San Antonio Spurs",     shortName: "San Antonio" },
  { year: 2004, team: "Detroit Pistons",       shortName: "Detroit" },
  { year: 2005, team: "San Antonio Spurs",     shortName: "San Antonio" },
  { year: 2006, team: "Miami Heat",            shortName: "Miami" },
  { year: 2007, team: "San Antonio Spurs",     shortName: "San Antonio" },
  { year: 2008, team: "Boston Celtics",        shortName: "Boston" },
  { year: 2009, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2010, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2011, team: "Dallas Mavericks",      shortName: "Dallas" },
  { year: 2012, team: "Miami Heat",            shortName: "Miami" },
  { year: 2013, team: "Miami Heat",            shortName: "Miami" },
  { year: 2014, team: "San Antonio Spurs",     shortName: "San Antonio" },
  { year: 2015, team: "Golden State Warriors", shortName: "Golden State" },
  { year: 2016, team: "Cleveland Cavaliers",   shortName: "Cleveland" },
  { year: 2017, team: "Golden State Warriors", shortName: "Golden State" },
  { year: 2018, team: "Golden State Warriors", shortName: "Golden State" },
  { year: 2019, team: "Toronto Raptors",       shortName: "Toronto" },
  { year: 2020, team: "Los Angeles Lakers",    shortName: "L.A. Lakers" },
  { year: 2021, team: "Milwaukee Bucks",       shortName: "Milwaukee" },
  { year: 2022, team: "Golden State Warriors", shortName: "Golden State" },
  { year: 2023, team: "Denver Nuggets",        shortName: "Denver" },
  { year: 2024, team: "Boston Celtics",        shortName: "Boston" },
];

const ALIASES: Record<string, string> = {
  // Bulls
  "bulls": "Chicago Bulls", "chicago": "Chicago Bulls", "chicago bulls": "Chicago Bulls",
  // Lakers
  "lakers": "Los Angeles Lakers", "la lakers": "Los Angeles Lakers",
  "los angeles lakers": "Los Angeles Lakers", "lal": "Los Angeles Lakers",
  "la": "Los Angeles Lakers",
  // Spurs
  "spurs": "San Antonio Spurs", "san antonio": "San Antonio Spurs",
  "san antonio spurs": "San Antonio Spurs", "sas": "San Antonio Spurs",
  // Warriors
  "warriors": "Golden State Warriors", "golden state": "Golden State Warriors",
  "golden state warriors": "Golden State Warriors", "gsw": "Golden State Warriors",
  "dubs": "Golden State Warriors",
  // Heat
  "heat": "Miami Heat", "miami": "Miami Heat", "miami heat": "Miami Heat",
  // Celtics
  "celtics": "Boston Celtics", "boston": "Boston Celtics", "boston celtics": "Boston Celtics",
  // Pistons
  "pistons": "Detroit Pistons", "detroit": "Detroit Pistons", "detroit pistons": "Detroit Pistons",
  // Rockets
  "rockets": "Houston Rockets", "houston": "Houston Rockets", "houston rockets": "Houston Rockets",
  // Mavericks
  "mavericks": "Dallas Mavericks", "mavs": "Dallas Mavericks",
  "dallas": "Dallas Mavericks", "dallas mavericks": "Dallas Mavericks",
  // Cavaliers
  "cavaliers": "Cleveland Cavaliers", "cavs": "Cleveland Cavaliers",
  "cleveland": "Cleveland Cavaliers", "cleveland cavaliers": "Cleveland Cavaliers",
  // Raptors
  "raptors": "Toronto Raptors", "toronto": "Toronto Raptors", "toronto raptors": "Toronto Raptors",
  // Bucks
  "bucks": "Milwaukee Bucks", "milwaukee": "Milwaukee Bucks", "milwaukee bucks": "Milwaukee Bucks",
  // Nuggets
  "nuggets": "Denver Nuggets", "denver": "Denver Nuggets", "denver nuggets": "Denver Nuggets",
};

export function matchChampion(input: string): string | null {
  const norm = input.toLowerCase().trim();
  if (norm.length < 2) return null;
  return ALIASES[norm] ?? null;
}

export const UNIQUE_CHAMPIONS = [...new Set(CHAMPIONS.map(c => c.team))];
