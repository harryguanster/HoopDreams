export type ConnectionColor = "yellow" | "green" | "blue" | "purple";

export type ConnectionCategory = {
  title: string;
  color: ConnectionColor;
  members: string[];
};

export type ConnectionPuzzle = {
  id: number;
  categories: ConnectionCategory[];
};

export const CONNECTIONS_PUZZLES: ConnectionPuzzle[] = [
  {
    id: 0,
    categories: [
      {
        title: "2003 NBA Draft Class",
        color: "yellow",
        members: ["LeBron James", "Carmelo Anthony", "Dwyane Wade", "Chris Bosh"],
      },
      {
        title: "NBA Players Named Kevin",
        color: "green",
        members: ["Kevin Durant", "Kevin Garnett", "Kevin Love", "Kevin McHale"],
      },
      {
        title: "All-Time Triple-Double Leaders",
        color: "blue",
        members: ["Oscar Robertson", "Magic Johnson", "Jason Kidd", "Russell Westbrook"],
      },
      {
        title: "1996 NBA Draft Class",
        color: "purple",
        members: ["Kobe Bryant", "Allen Iverson", "Steve Nash", "Ray Allen"],
      },
    ],
  },
  {
    id: 1,
    categories: [
      {
        title: "Sons of NBA Players",
        color: "yellow",
        members: ["Klay Thompson", "Gary Payton II", "Tim Hardaway Jr.", "Scotty Pippen Jr."],
      },
      {
        title: "Famous Ringless NBA Legends",
        color: "green",
        members: ["Charles Barkley", "Patrick Ewing", "John Stockton", "Karl Malone"],
      },
      {
        title: "2024 Paris Olympics USA Gold Team",
        color: "blue",
        members: ["Stephen Curry", "LeBron James", "Kevin Durant", "Jayson Tatum"],
      },
      {
        title: "High School Directly to NBA (No College)",
        color: "purple",
        members: ["Kobe Bryant", "Kevin Garnett", "Dwight Howard", "Tracy McGrady"],
      },
    ],
  },
  {
    id: 2,
    categories: [
      {
        title: "2016 Cleveland Cavaliers Champions",
        color: "yellow",
        members: ["LeBron James", "Kyrie Irving", "Kevin Love", "J.R. Smith"],
      },
      {
        title: "Iconic NBA Dunk Contest Winners",
        color: "green",
        members: ["Vince Carter", "Michael Jordan", "Dominique Wilkins", "Zach LaVine"],
      },
      {
        title: "Changed Their Legal Name",
        color: "blue",
        members: ["Metta World Peace", "Kareem Abdul-Jabbar", "Mahmoud Abdul-Rauf", "World B. Free"],
      },
      {
        title: "Foreign-Born NBA Champions",
        color: "purple",
        members: ["Dirk Nowitzki", "Tony Parker", "Manu Ginobili", "Hakeem Olajuwon"],
      },
    ],
  },
  {
    id: 3,
    categories: [
      {
        title: "NBA All-Time Top 4 Scorers",
        color: "yellow",
        members: ["LeBron James", "Kareem Abdul-Jabbar", "Karl Malone", "Kobe Bryant"],
      },
      {
        title: "NBA Stars Named Chris",
        color: "green",
        members: ["Chris Paul", "Chris Bosh", "Chris Webber", "Chris Mullin"],
      },
      {
        title: "Foreign-Born NBA MVP Winners",
        color: "blue",
        members: ["Dirk Nowitzki", "Steve Nash", "Nikola Jokic", "Giannis Antetokounmpo"],
      },
      {
        title: "Players With 8+ Championship Rings",
        color: "purple",
        members: ["Bill Russell", "Sam Jones", "K.C. Jones", "Tom Heinsohn"],
      },
    ],
  },
];
