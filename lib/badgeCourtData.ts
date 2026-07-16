export type BadgeId =
  | "limitless_range"
  | "mid_range_maestro"
  | "clutch_gene"
  | "contact_finisher"
  | "backdown_bully"
  | "rim_runner"
  | "box_out_beast"
  | "floor_general"
  | "flashy_passer"
  | "transition_threat"
  | "ankle_breaker"
  | "dream_shake"
  | "volume_scorer"
  | "pick_and_roll"
  | "hustle";

export type ActionId =
  | "pull_up_3"
  | "corner_3"
  | "midrange"
  | "drive_finish"
  | "post_up"
  | "alley_oop"
  | "offensive_board"
  | "fast_break"
  | "kick_out"
  | "pick_roll"
  | "no_look";

export interface Badge {
  id: BadgeId;
  name: string;
  desc: string;
  color: string; // glow color
}

export interface Action {
  id: ActionId;
  label: string;
  baseRate: number; // base success probability
  pts: number; // points if made
  badgeBoosts: Partial<Record<BadgeId, number>>; // additive boost to baseRate when badge active
}

export interface BCPlayer {
  id: string;
  name: string;
  short: string; // short display name
  team: string;
  era: string;
  color: string; // card accent color
  badges: [BadgeId, BadgeId];
  actions: ActionId[]; // preferred actions (shown first)
  overall: number; // 75–99
}

export const BADGES: Record<BadgeId, Badge> = {
  limitless_range: { id: "limitless_range", name: "Limitless Range", desc: "Deep 3s drain like layups.", color: "#f59e0b" },
  mid_range_maestro: { id: "mid_range_maestro", name: "Mid-Range Maestro", desc: "Midrange is automatic.", color: "#a78bfa" },
  clutch_gene: { id: "clutch_gene", name: "Clutch Gene", desc: "Hits big shots when it matters.", color: "#ef4444" },
  contact_finisher: { id: "contact_finisher", name: "Contact Finisher", desc: "Converts at the rim through contact.", color: "#f97316" },
  backdown_bully: { id: "backdown_bully", name: "Backdown Bully", desc: "Backs defenders down for easy buckets.", color: "#6366f1" },
  rim_runner: { id: "rim_runner", name: "Rim Runner", desc: "Catches lobs and cuts for dunks.", color: "#ec4899" },
  box_out_beast: { id: "box_out_beast", name: "Box Out Beast", desc: "Crashes boards relentlessly.", color: "#14b8a6" },
  floor_general: { id: "floor_general", name: "Floor General", desc: "Orchestrates the entire offense.", color: "#84cc16" },
  flashy_passer: { id: "flashy_passer", name: "Flashy Passer", desc: "No-look passes create easy buckets.", color: "#06b6d4" },
  transition_threat: { id: "transition_threat", name: "Transition Threat", desc: "Pushes pace and scores in the open floor.", color: "#10b981" },
  ankle_breaker: { id: "ankle_breaker", name: "Ankle Breaker", desc: "Crosses defenders into the ground.", color: "#f43f5e" },
  dream_shake: { id: "dream_shake", name: "Dream Shake", desc: "Unstoppable post footwork.", color: "#8b5cf6" },
  volume_scorer: { id: "volume_scorer", name: "Volume Scorer", desc: "Gets buckets by sheer will.", color: "#fb923c" },
  pick_and_roll: { id: "pick_and_roll", name: "Pick & Roll Artist", desc: "Thrives in the two-man game.", color: "#4ade80" },
  hustle: { id: "hustle", name: "Hustle", desc: "Out-works everyone on every possession.", color: "#e879f9" },
};

export const ACTIONS: Record<ActionId, Action> = {
  pull_up_3:       { id: "pull_up_3",       label: "Pull-Up 3",       baseRate: 0.33, pts: 3, badgeBoosts: { limitless_range: 0.18, ankle_breaker: 0.06, volume_scorer: 0.05 } },
  corner_3:        { id: "corner_3",        label: "Corner 3",        baseRate: 0.41, pts: 3, badgeBoosts: { limitless_range: 0.10, floor_general: 0.06 } },
  midrange:        { id: "midrange",        label: "Mid-Range J",     baseRate: 0.46, pts: 2, badgeBoosts: { mid_range_maestro: 0.20, clutch_gene: 0.08, ankle_breaker: 0.07 } },
  drive_finish:    { id: "drive_finish",    label: "Drive & Finish",  baseRate: 0.52, pts: 2, badgeBoosts: { contact_finisher: 0.18, transition_threat: 0.07, ankle_breaker: 0.06 } },
  post_up:         { id: "post_up",         label: "Post-Up",         baseRate: 0.46, pts: 2, badgeBoosts: { backdown_bully: 0.20, dream_shake: 0.20, volume_scorer: 0.06 } },
  alley_oop:       { id: "alley_oop",       label: "Alley-Oop",       baseRate: 0.62, pts: 2, badgeBoosts: { rim_runner: 0.18, floor_general: 0.08, flashy_passer: 0.10 } },
  offensive_board: { id: "offensive_board", label: "O-Board Putback", baseRate: 0.54, pts: 2, badgeBoosts: { box_out_beast: 0.22, hustle: 0.12, rim_runner: 0.06 } },
  fast_break:      { id: "fast_break",      label: "Fast Break",      baseRate: 0.60, pts: 2, badgeBoosts: { transition_threat: 0.20, contact_finisher: 0.06, hustle: 0.06 } },
  kick_out:        { id: "kick_out",        label: "Kick-Out 3",      baseRate: 0.44, pts: 3, badgeBoosts: { floor_general: 0.10, flashy_passer: 0.10, limitless_range: 0.06 } },
  pick_roll:       { id: "pick_roll",       label: "Pick & Roll",     baseRate: 0.54, pts: 2, badgeBoosts: { pick_and_roll: 0.22, floor_general: 0.08, rim_runner: 0.06 } },
  no_look:         { id: "no_look",         label: "No-Look Pass",    baseRate: 0.58, pts: 2, badgeBoosts: { flashy_passer: 0.22, floor_general: 0.10, pick_and_roll: 0.06 } },
};

export const PLAYERS: BCPlayer[] = [
  {
    id: "curry",
    name: "Stephen Curry",
    short: "Curry",
    team: "Golden State Warriors",
    era: "2010s–2020s",
    color: "#f59e0b",
    badges: ["limitless_range", "ankle_breaker"],
    actions: ["pull_up_3", "corner_3", "midrange", "drive_finish", "fast_break"],
    overall: 98,
  },
  {
    id: "jordan",
    name: "Michael Jordan",
    short: "MJ",
    team: "Chicago Bulls",
    era: "1980s–1990s",
    color: "#ef4444",
    badges: ["mid_range_maestro", "clutch_gene"],
    actions: ["midrange", "drive_finish", "pull_up_3", "fast_break", "post_up"],
    overall: 99,
  },
  {
    id: "lebron",
    name: "LeBron James",
    short: "LeBron",
    team: "Various",
    era: "2000s–2020s",
    color: "#f97316",
    badges: ["floor_general", "transition_threat"],
    actions: ["drive_finish", "fast_break", "no_look", "midrange", "alley_oop"],
    overall: 99,
  },
  {
    id: "shaq",
    name: "Shaquille O'Neal",
    short: "Shaq",
    team: "L.A. Lakers",
    era: "1990s–2000s",
    color: "#6366f1",
    badges: ["backdown_bully", "contact_finisher"],
    actions: ["post_up", "alley_oop", "offensive_board", "pick_roll", "drive_finish"],
    overall: 99,
  },
  {
    id: "kobe",
    name: "Kobe Bryant",
    short: "Kobe",
    team: "L.A. Lakers",
    era: "1990s–2010s",
    color: "#a78bfa",
    badges: ["mid_range_maestro", "volume_scorer"],
    actions: ["midrange", "pull_up_3", "drive_finish", "post_up", "fast_break"],
    overall: 98,
  },
  {
    id: "magic",
    name: "Magic Johnson",
    short: "Magic",
    team: "L.A. Lakers",
    era: "1980s",
    color: "#84cc16",
    badges: ["floor_general", "flashy_passer"],
    actions: ["no_look", "fast_break", "pick_roll", "alley_oop", "drive_finish"],
    overall: 98,
  },
  {
    id: "bird",
    name: "Larry Bird",
    short: "Bird",
    team: "Boston Celtics",
    era: "1980s",
    color: "#10b981",
    badges: ["clutch_gene", "mid_range_maestro"],
    actions: ["midrange", "corner_3", "kick_out", "no_look", "pull_up_3"],
    overall: 97,
  },
  {
    id: "hakeem",
    name: "Hakeem Olajuwon",
    short: "Hakeem",
    team: "Houston Rockets",
    era: "1980s–1990s",
    color: "#8b5cf6",
    badges: ["dream_shake", "rim_runner"],
    actions: ["post_up", "alley_oop", "offensive_board", "drive_finish", "midrange"],
    overall: 98,
  },
  {
    id: "kd",
    name: "Kevin Durant",
    short: "KD",
    team: "Various",
    era: "2010s–2020s",
    color: "#06b6d4",
    badges: ["mid_range_maestro", "volume_scorer"],
    actions: ["midrange", "pull_up_3", "drive_finish", "post_up", "corner_3"],
    overall: 98,
  },
  {
    id: "iverson",
    name: "Allen Iverson",
    short: "AI",
    team: "Philadelphia 76ers",
    era: "1990s–2000s",
    color: "#f43f5e",
    badges: ["ankle_breaker", "volume_scorer"],
    actions: ["drive_finish", "midrange", "pull_up_3", "fast_break", "no_look"],
    overall: 96,
  },
  {
    id: "wade",
    name: "Dwyane Wade",
    short: "D-Wade",
    team: "Miami Heat",
    era: "2000s–2010s",
    color: "#ec4899",
    badges: ["contact_finisher", "clutch_gene"],
    actions: ["drive_finish", "alley_oop", "fast_break", "midrange", "pick_roll"],
    overall: 96,
  },
  {
    id: "stockton",
    name: "John Stockton",
    short: "Stockton",
    team: "Utah Jazz",
    era: "1980s–2000s",
    color: "#4ade80",
    badges: ["floor_general", "pick_and_roll"],
    actions: ["pick_roll", "no_look", "kick_out", "fast_break", "midrange"],
    overall: 95,
  },
  {
    id: "malone",
    name: "Karl Malone",
    short: "Malone",
    team: "Utah Jazz",
    era: "1980s–2000s",
    color: "#fb923c",
    badges: ["pick_and_roll", "backdown_bully"],
    actions: ["pick_roll", "post_up", "offensive_board", "drive_finish", "midrange"],
    overall: 97,
  },
  {
    id: "barkley",
    name: "Charles Barkley",
    short: "Barkley",
    team: "Various",
    era: "1980s–2000s",
    color: "#e879f9",
    badges: ["box_out_beast", "volume_scorer"],
    actions: ["offensive_board", "post_up", "drive_finish", "midrange", "fast_break"],
    overall: 96,
  },
  {
    id: "rodman",
    name: "Dennis Rodman",
    short: "Rodman",
    team: "Chicago Bulls",
    era: "1990s",
    color: "#14b8a6",
    badges: ["box_out_beast", "hustle"],
    actions: ["offensive_board", "pick_roll", "alley_oop", "drive_finish", "fast_break"],
    overall: 90,
  },
];

export function getEffectiveRate(action: Action, playerBadges: BadgeId[]): number {
  let rate = action.baseRate;
  for (const badge of playerBadges) {
    const boost = action.badgeBoosts[badge] ?? 0;
    rate += boost;
  }
  return Math.min(rate, 0.92);
}

export function dealHands(pool: BCPlayer[], count = 5): { user: BCPlayer[]; ai: BCPlayer[] } {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return { user: shuffled.slice(0, count), ai: shuffled.slice(count, count * 2) };
}
