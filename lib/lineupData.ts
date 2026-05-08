export type LineupPlayer = {
  name: string;
  number: string;
  position: "PG" | "SG" | "SF" | "PF" | "C";
  ppg: number;
  apg: number;
  rpg: number;
};

export type LineupTeam = {
  id: string;
  answer: string;
  aliases: string[];
  season: string;
  players: LineupPlayer[];
};

// Court position coords as % of container (left%, top%)
export const POSITION_COORDS: Record<string, { x: number; y: number }> = {
  PG: { x: 50, y: 22 },
  SG: { x: 82, y: 40 },
  SF: { x: 18, y: 40 },
  PF: { x: 73, y: 65 },
  C:  { x: 50, y: 65 },
};

export const LINEUPS: LineupTeam[] = [
  {
    id: "bulls-9596",
    answer: "Chicago Bulls",
    aliases: ["chicago bulls", "bulls", "chicago"],
    season: "1995–96",
    players: [
      { name: "Kukoc",   number: "7",  position: "PG", ppg: 13.1, apg: 3.5, rpg: 4.0 },
      { name: "Jordan",  number: "23", position: "SG", ppg: 30.4, apg: 4.3, rpg: 6.6 },
      { name: "Pippen",  number: "33", position: "SF", ppg: 19.4, apg: 5.9, rpg: 6.4 },
      { name: "Rodman",  number: "91", position: "PF", ppg: 5.5,  apg: 2.5, rpg: 14.9 },
      { name: "Longley", number: "13", position: "C",  ppg: 9.1,  apg: 2.4, rpg: 5.9 },
    ],
  },
  {
    id: "warriors-1516",
    answer: "Golden State Warriors",
    aliases: ["golden state warriors", "warriors", "golden state", "gsw"],
    season: "2015–16",
    players: [
      { name: "Curry",    number: "30", position: "PG", ppg: 30.1, apg: 6.7, rpg: 5.4 },
      { name: "Thompson", number: "11", position: "SG", ppg: 22.1, apg: 2.1, rpg: 3.8 },
      { name: "Barnes",   number: "40", position: "SF", ppg: 11.7, apg: 1.3, rpg: 5.0 },
      { name: "Green",    number: "23", position: "PF", ppg: 14.0, apg: 7.4, rpg: 9.5 },
      { name: "Bogut",    number: "12", position: "C",  ppg: 6.7,  apg: 1.8, rpg: 8.6 },
    ],
  },
  {
    id: "celtics-0708",
    answer: "Boston Celtics",
    aliases: ["boston celtics", "celtics", "boston"],
    season: "2007–08",
    players: [
      { name: "Rondo",   number: "9",  position: "PG", ppg: 10.6, apg: 5.1, rpg: 4.2 },
      { name: "Allen",   number: "20", position: "SG", ppg: 17.4, apg: 2.8, rpg: 3.7 },
      { name: "Pierce",  number: "34", position: "SF", ppg: 19.6, apg: 4.5, rpg: 5.1 },
      { name: "Garnett", number: "5",  position: "PF", ppg: 18.8, apg: 3.4, rpg: 9.2 },
      { name: "Perkins", number: "43", position: "C",  ppg: 6.7,  apg: 0.7, rpg: 6.9 },
    ],
  },
  {
    id: "lakers-0001",
    answer: "Los Angeles Lakers",
    aliases: ["los angeles lakers", "la lakers", "lakers", "los angeles"],
    season: "2000–01",
    players: [
      { name: "Fisher", number: "2",  position: "PG", ppg: 11.3, apg: 3.7, rpg: 2.9 },
      { name: "Bryant", number: "8",  position: "SG", ppg: 28.5, apg: 5.0, rpg: 5.9 },
      { name: "Harper", number: "6",  position: "SF", ppg: 5.5,  apg: 2.1, rpg: 3.0 },
      { name: "Horry",  number: "5",  position: "PF", ppg: 8.3,  apg: 2.7, rpg: 5.3 },
      { name: "O'Neal", number: "34", position: "C",  ppg: 28.7, apg: 3.7, rpg: 12.7 },
    ],
  },
  {
    id: "heat-1213",
    answer: "Miami Heat",
    aliases: ["miami heat", "heat", "miami"],
    season: "2012–13",
    players: [
      { name: "Chalmers", number: "15", position: "PG", ppg: 10.5, apg: 4.7, rpg: 2.6 },
      { name: "Wade",     number: "3",  position: "SG", ppg: 21.2, apg: 5.1, rpg: 5.0 },
      { name: "James",    number: "6",  position: "SF", ppg: 26.8, apg: 7.3, rpg: 8.0 },
      { name: "Bosh",     number: "1",  position: "PF", ppg: 18.0, apg: 1.9, rpg: 7.9 },
      { name: "Haslem",   number: "40", position: "C",  ppg: 5.9,  apg: 0.5, rpg: 5.0 },
    ],
  },
  {
    id: "spurs-0203",
    answer: "San Antonio Spurs",
    aliases: ["san antonio spurs", "spurs", "san antonio"],
    season: "2002–03",
    players: [
      { name: "Parker",   number: "9",  position: "PG", ppg: 15.5, apg: 5.3, rpg: 2.7 },
      { name: "Jackson",  number: "1",  position: "SG", ppg: 12.5, apg: 2.5, rpg: 3.8 },
      { name: "Bowen",    number: "12", position: "SF", ppg: 7.3,  apg: 1.2, rpg: 2.8 },
      { name: "Duncan",   number: "21", position: "PF", ppg: 23.3, apg: 3.9, rpg: 12.9 },
      { name: "Robinson", number: "50", position: "C",  ppg: 8.5,  apg: 1.8, rpg: 6.4 },
    ],
  },
  {
    id: "celtics-8687",
    answer: "Boston Celtics",
    aliases: ["boston celtics", "celtics", "boston"],
    season: "1986–87",
    players: [
      { name: "D. Johnson", number: "3",  position: "PG", ppg: 15.6, apg: 6.1, rpg: 3.6 },
      { name: "Ainge",      number: "44", position: "SG", ppg: 13.9, apg: 4.9, rpg: 2.5 },
      { name: "Bird",       number: "33", position: "SF", ppg: 28.1, apg: 7.6, rpg: 9.2 },
      { name: "McHale",     number: "32", position: "PF", ppg: 26.1, apg: 2.7, rpg: 9.9 },
      { name: "Parish",     number: "00", position: "C",  ppg: 17.2, apg: 1.7, rpg: 10.6 },
    ],
  },
  {
    id: "cavs-1617",
    answer: "Cleveland Cavaliers",
    aliases: ["cleveland cavaliers", "cavaliers", "cavs", "cleveland"],
    season: "2016–17",
    players: [
      { name: "Irving",   number: "2",  position: "PG", ppg: 25.2, apg: 5.8, rpg: 3.2 },
      { name: "Smith",    number: "5",  position: "SG", ppg: 12.0, apg: 2.1, rpg: 2.6 },
      { name: "James",    number: "23", position: "SF", ppg: 26.4, apg: 8.7, rpg: 8.6 },
      { name: "Love",     number: "0",  position: "PF", ppg: 19.0, apg: 1.8, rpg: 11.1 },
      { name: "Thompson", number: "13", position: "C",  ppg: 8.1,  apg: 1.1, rpg: 10.3 },
    ],
  },
  {
    id: "suns-9293",
    answer: "Phoenix Suns",
    aliases: ["phoenix suns", "suns", "phoenix"],
    season: "1992–93",
    players: [
      { name: "K. Johnson", number: "7",  position: "PG", ppg: 22.0, apg: 11.4, rpg: 3.3 },
      { name: "Majerle",    number: "9",  position: "SG", ppg: 16.2, apg: 3.2,  rpg: 4.3 },
      { name: "Dumas",      number: "5",  position: "SF", ppg: 15.8, apg: 1.4,  rpg: 4.3 },
      { name: "Barkley",    number: "34", position: "PF", ppg: 25.6, apg: 5.1,  rpg: 12.2 },
      { name: "West",       number: "41", position: "C",  ppg: 5.4,  apg: 0.5,  rpg: 5.2 },
    ],
  },
  {
    id: "warriors-1617",
    answer: "Golden State Warriors",
    aliases: ["golden state warriors", "warriors", "golden state", "gsw"],
    season: "2016–17",
    players: [
      { name: "Curry",    number: "30", position: "PG", ppg: 25.3, apg: 6.6, rpg: 4.5 },
      { name: "Thompson", number: "11", position: "SG", ppg: 22.3, apg: 2.1, rpg: 3.7 },
      { name: "Durant",   number: "35", position: "SF", ppg: 25.1, apg: 4.8, rpg: 8.3 },
      { name: "Green",    number: "23", position: "PF", ppg: 10.2, apg: 7.0, rpg: 8.0 },
      { name: "Pachulia", number: "27", position: "C",  ppg: 6.1,  apg: 2.0, rpg: 6.5 },
    ],
  },
  {
    id: "pistons-0304",
    answer: "Detroit Pistons",
    aliases: ["detroit pistons", "pistons", "detroit"],
    season: "2003–04",
    players: [
      { name: "Billups",   number: "1",  position: "PG", ppg: 16.9, apg: 5.7, rpg: 3.3 },
      { name: "R. Hamilton", number: "32", position: "SG", ppg: 17.6, apg: 3.0, rpg: 3.2 },
      { name: "Prince",    number: "3",  position: "SF", ppg: 13.4, apg: 2.3, rpg: 5.6 },
      { name: "R. Wallace", number: "3", position: "PF", ppg: 13.2, apg: 2.0, rpg: 7.4 },
      { name: "B. Wallace", number: "3", position: "C",  ppg: 9.6,  apg: 1.6, rpg: 12.4 },
    ],
  },
  {
    id: "showtime-8687",
    answer: "Los Angeles Lakers",
    aliases: ["los angeles lakers", "la lakers", "lakers", "los angeles", "showtime lakers"],
    season: "1986–87",
    players: [
      { name: "Johnson",  number: "32", position: "PG", ppg: 23.9, apg: 12.2, rpg: 6.3 },
      { name: "Scott",    number: "4",  position: "SG", ppg: 21.7, apg: 2.6,  rpg: 3.3 },
      { name: "Worthy",   number: "42", position: "SF", ppg: 19.4, apg: 3.6,  rpg: 5.3 },
      { name: "Rambis",   number: "31", position: "PF", ppg: 7.0,  apg: 1.8,  rpg: 5.7 },
      { name: "Abdul-Jabbar", number: "33", position: "C", ppg: 17.5, apg: 2.5, rpg: 6.7 },
    ],
  },
];
