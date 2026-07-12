"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Position = "PG" | "SG" | "SF" | "PF" | "C";
type Difficulty = "easy" | "medium" | "hard";
type Era = "alltime" | "current";
type Phase = "setup" | "auction" | "rosters" | "simcast";
type AuctionState = "user_act" | "ai_thinking" | "round_over";
type LogEntry = { bidder: "user" | "ai" | "sys"; text: string };

interface Player {
  id: string;
  name: string;
  position: Position;
  era: string;
  desc: string;
  value: number;   // 1–10
  off: number;
  def: number;
}

interface RosterSlot { player: Player; paid: number; slot: Position; }

// ─── Player Pools ──────────────────────────────────────────────────────────────
// Values ranked on a true 1–10 scale so the bidding algorithm prices correctly.
// Elite (9.5+) → fair bid ~$8–10 | Star (8–9.4) → ~$6–8 | Solid (6–7.9) → ~$3–5 | Role (<6) → ~$1–2

// All-Time: 5 per position (25 total) — shuffled each game so variety is high
const ALLTIME_POOL: Player[] = [
  // ── PG ──
  { id: "magic",    name: "Magic Johnson",       position: "PG", era: "1979–96",   desc: "5× Champion · 3× Finals MVP · ran Showtime",              value: 9.5, off: 9.2, def: 8.0 },
  { id: "stockton", name: "John Stockton",       position: "PG", era: "1984–2003", desc: "All-time assists & steals leader · 2× runner-up",          value: 8.0, off: 7.8, def: 8.5 },
  { id: "oscar",    name: "Oscar Robertson",     position: "PG", era: "1960–74",   desc: "1× Champion · 1× MVP · averaged a triple-double over a full season", value: 8.8, off: 9.0, def: 7.5 },
  { id: "isiah",    name: "Isiah Thomas",        position: "PG", era: "1981–94",   desc: "2× Champion · 1990 Finals MVP · Bad Boys leader",          value: 7.5, off: 7.8, def: 7.2 },
  { id: "cp3",      name: "Chris Paul",          position: "PG", era: "2005–24",   desc: "12× All-Star · career assists/steals pace setter",          value: 7.2, off: 7.5, def: 8.2 },
  // ── SG ──
  { id: "jordan",   name: "Michael Jordan",      position: "SG", era: "1984–2003", desc: "6× Champion · 6× Finals MVP · The GOAT",                  value: 10.0, off: 10.0, def: 9.5 },
  { id: "kobe",     name: "Kobe Bryant",         position: "SG", era: "1996–2016", desc: "5× Champion · 2009 Finals MVP · 81-point game",            value: 9.0, off: 9.2, def: 8.5 },
  { id: "wade",     name: "Dwyane Wade",         position: "SG", era: "2003–19",   desc: "3× Champion · 2006 Finals MVP · South Beach icon",         value: 8.2, off: 8.5, def: 8.0 },
  { id: "iverson",  name: "Allen Iverson",       position: "SG", era: "1996–2010", desc: "2001 MVP · scoring title king · answered the call",         value: 7.8, off: 8.5, def: 6.5 },
  { id: "reggie",   name: "Reggie Miller",       position: "SG", era: "1987–2005", desc: "5× All-Star · clutch three-point assassin",                value: 6.2, off: 7.0, def: 6.0 },
  // ── SF ──
  { id: "lebron",   name: "LeBron James",        position: "SF", era: "2003–pres", desc: "4× Champion · 4× Finals MVP · all-time scoring leader",    value: 9.8, off: 9.8, def: 8.8 },
  { id: "bird",     name: "Larry Bird",          position: "SF", era: "1979–92",   desc: "3× Champion · 3× MVP · Celtics legend",                    value: 9.0, off: 9.2, def: 7.8 },
  { id: "drj",      name: "Julius Erving",       position: "SF", era: "1971–87",   desc: "1× Champion · 3× ABA MVP · invented the modern dunk",      value: 8.2, off: 8.5, def: 7.5 },
  { id: "pippen",   name: "Scottie Pippen",      position: "SF", era: "1987–2004", desc: "6× Champion · top-5 defender all time · Jordan's co-star",  value: 7.8, off: 7.5, def: 9.2 },
  { id: "worthy",   name: "James Worthy",        position: "SF", era: "1982–94",   desc: "3× Champion · 1988 Finals MVP · Big Game James",           value: 6.8, off: 7.2, def: 6.5 },
  // ── PF ──
  { id: "duncan",   name: "Tim Duncan",          position: "PF", era: "1997–2016", desc: "5× Champion · 3× Finals MVP · The Big Fundamental",        value: 9.2, off: 8.8, def: 9.5 },
  { id: "malone",   name: "Karl Malone",         position: "PF", era: "1985–2004", desc: "2× MVP · 14× All-Star · most points without a ring",        value: 8.5, off: 9.0, def: 7.5 },
  { id: "kg",       name: "Kevin Garnett",       position: "PF", era: "1995–2016", desc: "1× Champion · 2004 MVP · greatest two-way PF ever",         value: 8.5, off: 8.2, def: 9.3 },
  { id: "barkley",  name: "Charles Barkley",     position: "PF", era: "1984–2000", desc: "1993 MVP · 11× All-Star · never won a ring",                value: 8.2, off: 9.0, def: 7.2 },
  { id: "rodman",   name: "Dennis Rodman",       position: "PF", era: "1986–2000", desc: "5× Champion · 2× DPOY · greatest rebounder ever",           value: 6.5, off: 4.5, def: 9.8 },
  // ── C ──
  { id: "kareem",   name: "Kareem Abdul-Jabbar", position: "C",  era: "1969–89",   desc: "6× Champion · 6× MVP · all-time scoring record holder",     value: 9.5, off: 9.5, def: 8.5 },
  { id: "wilt",     name: "Wilt Chamberlain",    position: "C",  era: "1959–73",   desc: "2× Champion · 4× MVP · 100-point game",                     value: 9.5, off: 10.0, def: 8.5 },
  { id: "shaq",     name: "Shaquille O'Neal",    position: "C",  era: "1992–2011", desc: "4× Champion · 3× Finals MVP · most dominant big man",       value: 9.3, off: 9.5, def: 8.0 },
  { id: "hakeem",   name: "Hakeem Olajuwon",     position: "C",  era: "1984–2002", desc: "2× Champion · 2× Finals MVP · Dream Shake inventor",        value: 9.0, off: 9.0, def: 9.5 },
  { id: "russell",  name: "Bill Russell",        position: "C",  era: "1956–69",   desc: "11× Champion · 5× MVP · the greatest winner in sports",     value: 9.3, off: 7.5, def: 10.0 },
];

// Current: 5 per position (25 total) — 2025–26 season
const CURRENT_POOL: Player[] = [
  // ── PG ──
  { id: "sga",      name: "Shai Gilgeous-Alexander", position: "PG", era: "2025–26", desc: "31.1 PPG · 2× MVP · OKC franchise cornerstone",          value: 9.0, off: 9.3, def: 7.8 },
  { id: "curry_c",  name: "Stephen Curry",           position: "PG", era: "2025–26", desc: "25.1 PPG · still elite shooter at 37 · all-time 3PM record", value: 7.8, off: 8.5, def: 6.2 },
  { id: "dame_c",   name: "Damian Lillard",          position: "PG", era: "2025–26", desc: "19.8 PPG · returning from torn Achilles · Portland",      value: 6.5, off: 7.2, def: 6.0 },
  { id: "hali_c",   name: "Tyrese Haliburton",       position: "PG", era: "2025–26", desc: "22.4 PPG · 10.9 APG · Indiana's engine",                  value: 7.2, off: 7.5, def: 6.8 },
  { id: "brunson",  name: "Jalen Brunson",           position: "PG", era: "2025–26", desc: "26 PPG · 6.8 APG · Knicks engine",                        value: 7.0, off: 7.5, def: 6.5 },
  // ── SG ──
  { id: "ant_c",    name: "Anthony Edwards",         position: "SG", era: "2025–26", desc: "28.8 PPG · elite two-way SG · #1 pick in 2020",           value: 8.5, off: 8.8, def: 8.0 },
  { id: "booker_c", name: "Devin Booker",            position: "SG", era: "2025–26", desc: "26.1 PPG · 2× Olympic gold · scored 70 at age 20",        value: 8.0, off: 8.5, def: 7.0 },
  { id: "jbrown",   name: "Jaylen Brown",            position: "SG", era: "2025–26", desc: "28.7 PPG · 2024 Finals MVP · Celtic lockdown wing",        value: 7.8, off: 8.0, def: 7.5 },
  { id: "dmitch_c", name: "Donovan Mitchell",        position: "SG", era: "2025–26", desc: "26.1 PPG · elite playoff performer · Spida",               value: 7.5, off: 8.0, def: 7.0 },
  { id: "dbane",    name: "Desmond Bane",            position: "SG", era: "2025–26", desc: "20.1 PPG · 3&D specialist · Orlando breakout",             value: 6.0, off: 6.8, def: 6.2 },
  // ── SF ──
  { id: "durant_c", name: "Kevin Durant",            position: "SF", era: "2025–26", desc: "24.5 PPG · elite mid-range at 36 · less explosive than peak", value: 8.0, off: 8.5, def: 6.8 },
  { id: "tatum_c",  name: "Jayson Tatum",            position: "SF", era: "2025–26", desc: "2024 Champion · Finals MVP · Boston's cornerstone",        value: 8.5, off: 8.8, def: 7.5 },
  { id: "kawhi_c",  name: "Kawhi Leonard",           position: "SF", era: "2025–26", desc: "20.5 PPG when healthy · load managed · Clippers",         value: 7.0, off: 7.8, def: 8.0 },
  { id: "lebron_c", name: "LeBron James",            position: "SF", era: "2025–26", desc: "20.9 PPG · IQ still elite but athleticism declining at 41", value: 7.5, off: 7.8, def: 7.0 },
  { id: "sbarnes",  name: "Scottie Barnes",          position: "SF", era: "2025–26", desc: "18.1 PPG · 7.5 RPG · versatile two-way wing",              value: 6.5, off: 6.8, def: 7.0 },
  // ── PF ──
  { id: "giannis",  name: "Giannis Antetokounmpo",  position: "PF", era: "2025–26", desc: "27.7 PPG · 11.7 RPG · 2021 Champion · 2× MVP",            value: 9.5, off: 9.4, def: 8.5 },
  { id: "ad_c",     name: "Anthony Davis",           position: "PF", era: "2025–26", desc: "2020 Champion · elite rim protector · 8× All-Star",        value: 8.0, off: 8.5, def: 9.0 },
  { id: "zion_c",   name: "Zion Williamson",         position: "PF", era: "2025–26", desc: "28.9 PPG · 8.2 RPG · most powerful player in the game",   value: 8.0, off: 8.8, def: 7.0 },
  { id: "siakam_c", name: "Pascal Siakam",           position: "PF", era: "2025–26", desc: "2019 Champion · 23.9 PPG · versatile four",                value: 7.5, off: 7.8, def: 7.2 },
  { id: "randle",   name: "Julius Randle",           position: "PF", era: "2025–26", desc: "21.1 PPG · 6.7 RPG · Minnesota double-double machine",     value: 6.8, off: 7.2, def: 6.0 },
  // ── C ──
  { id: "jokic",    name: "Nikola Jokic",            position: "C",  era: "2025–26", desc: "27.7 PPG · 12.9 RPG · 10.7 APG · 3× MVP",                value: 9.8, off: 9.8, def: 8.0 },
  { id: "wemby_c",  name: "Victor Wembanyama",       position: "C",  era: "2025–26", desc: "25.0 PPG · 11.5 RPG · 3.1 BPG · generational talent",     value: 8.5, off: 8.2, def: 9.5 },
  { id: "embiid_c", name: "Joel Embiid",             position: "C",  era: "2025–26", desc: "2022–23 MVP · dominant scorer-rebounder combo",            value: 8.8, off: 9.0, def: 7.5 },
  { id: "bam_c",    name: "Bam Adebayo",             position: "C",  era: "2025–26", desc: "20.1 PPG · 10 RPG · elite defensive anchor",               value: 7.0, off: 7.2, def: 8.5 },
  { id: "gobert_c", name: "Rudy Gobert",             position: "C",  era: "2025–26", desc: "3× DPOY · elite shot-blocker and screener",                value: 6.8, off: 6.5, def: 9.2 },
];

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];
const BUDGET = 20;

const POS_COLOR: Record<Position, string> = {
  PG: "#84cc16", SG: "#f59e0b", SF: "#3b82f6", PF: "#8b5cf6", C: "#ef4444",
};

// Positional flexibility chain: PG ↔ SG ↔ SF ↔ PF ↔ C
// A player can reasonably occupy their own slot or an adjacent one.
const POS_ADJACENT: Record<Position, Position[]> = {
  PG: ["PG", "SG"],
  SG: ["SG", "PG", "SF"],
  SF: ["SF", "SG", "PF"],
  PF: ["PF", "SF", "C"],
  C:  ["C",  "PF"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick 2 random players per position (10 total) so every game has a fresh set
function samplePool(pool: Player[]): Player[] {
  const byPos: Record<Position, Player[]> = { PG: [], SG: [], SF: [], PF: [], C: [] };
  pool.forEach(p => byPos[p.position].push(p));
  const selected: Player[] = [];
  for (const pos of POSITIONS) {
    selected.push(...shuffle(byPos[pos]).slice(0, 2));
  }
  return shuffle(selected);
}

// Must keep $1 per remaining slot after this one
function maxBid(budget: number, slotsLeft: number): number {
  return Math.max(0, budget - Math.max(0, slotsLeft - 1));
}

// Fair value: non-linear scale so elite players (9.5+) cost $8–10,
// stars (7.5–9) cost $5–7, solid starters (6–7.5) cost $3–5, role players $1–2.
// Formula: fair = (value - 4) * 1.5, clamped to [1, BUDGET-slotsLeft+1]
function playerFairValue(player: Player): number {
  return Math.max(1, Math.round((player.value - 4) * 1.5));
}

function aiTargetBid(player: Player, difficulty: Difficulty, budget: number, slotsLeft: number, currentBid: number): number | null {
  const cap = maxBid(budget, slotsLeft);
  if (cap <= currentBid) return null;

  const fair = playerFairValue(player);
  let target: number;
  switch (difficulty) {
    case "easy":
      // Underbids by 40–60% — good players can be stolen
      target = fair * 0.50 + Math.random() * fair * 0.15;
      break;
    case "medium":
      // Bids close to fair value ±10%
      target = fair * 0.90 + (Math.random() - 0.5) * fair * 0.20;
      break;
    case "hard":
      // Slightly overbids on stars, rarely lets them go cheap
      target = fair * 1.10 + Math.random() * fair * 0.15;
      break;
    default:
      target = fair;
  }

  const t = Math.floor(Math.min(cap, Math.max(1, target)));
  return t > currentBid ? currentBid + 1 : null;
}

// Can this player realistically fit the AI's roster? (checks adjacent slots)
function aiCanFit(player: Player, roster: RosterSlot[]): boolean {
  const filled = new Set(roster.map(r => r.slot));
  return POS_ADJACENT[player.position].some(p => !filled.has(p));
}

// Best slot for AI to assign a player: natural position first, then adjacent
function aiBestSlot(player: Player, roster: RosterSlot[]): Position {
  const filled = new Set(roster.map(r => r.slot));
  for (const pos of POS_ADJACENT[player.position]) {
    if (!filled.has(pos)) return pos;
  }
  return POSITIONS.find(p => !filled.has(p))!;
}

// ─── Simulation helpers ────────────────────────────────────────────────────────
type GameLog = { num: number; winner: "user"|"ai"; uTotal: number; aTotal: number; };
type BoxRow  = { name: string; slot: Position; pts: number; reb: number; ast: number; stl: number; blk: number; };

function getWinProb(uR: RosterSlot[], aR: RosterSlot[]): number {
  const uOff = uR.reduce((s,r)=>s+r.player.off,0)/uR.length;
  const uDef = uR.reduce((s,r)=>s+r.player.def,0)/uR.length;
  const aOff = aR.reduce((s,r)=>s+r.player.off,0)/aR.length;
  const aDef = aR.reduce((s,r)=>s+r.player.def,0)/aR.length;
  const uStr = uOff*0.55 + (10-aDef)*0.45;
  const aStr = aOff*0.55 + (10-uDef)*0.45;
  return uStr/(uStr+aStr);
}

function generateSeries(pUser: number): GameLog[] {
  const games: GameLog[] = [];
  let uW=0, aW=0, n=1;
  while (uW<4 && aW<4) {
    const won = Math.random() < pUser;
    let uT = 92 + Math.floor(Math.random()*22);
    let aT = 92 + Math.floor(Math.random()*22);
    if (won  && uT<=aT) uT = aT + 1 + Math.floor(Math.random()*9);
    if (!won && aT<=uT) aT = uT + 1 + Math.floor(Math.random()*9);
    games.push({ num: n++, winner: won?"user":"ai", uTotal: uT, aTotal: aT });
    if (won) uW++; else aW++;
  }
  return games;
}

function buildBoxScore(roster: RosterSlot[], isWinner: boolean): BoxRow[] {
  const basePts = isWinner ? 108 : 100;
  const totOff = roster.reduce((s,r)=>s+r.player.off, 0);
  return roster.map(({player, slot}) => {
    const share = player.off / totOff;
    const pts  = Math.max(4, Math.round(basePts*share + (Math.random()-0.5)*10));
    const reb  = Math.max(1, Math.round(player.def*0.7 + Math.random()*5));
    const isG  = player.position==="PG" || player.position==="SG";
    const ast  = Math.max(0, Math.round((isG?5:2) + Math.random()*5));
    const stl  = Math.max(0, Math.round(Math.random()*2));
    const blk  = Math.max(0, Math.round((player.position==="C"||player.position==="PF"?1:0)+Math.random()*2));
    return { name: player.name, slot, pts, reb, ast, stl, blk };
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function RosterPanel({
  title, roster, budget, dark, onSwap,
}: {
  title: string; roster: RosterSlot[]; budget: number; dark?: boolean;
  onSwap?: (from: Position, to: Position) => void;
}) {
  const [dragFrom, setDragFrom] = useState<Position | null>(null);
  return (
    <div>
      <div className="px-6 py-5 flex items-center justify-between" style={{ background: dark ? "#111827" : "#84cc16", borderBottom: "2px solid #111827" }}>
        <p className="font-playfair font-black" style={{ fontSize: "1.15rem", color: dark ? "#fff" : "#111827" }}>{title}</p>
        <span className="font-mono font-bold" style={{ color: dark ? "#84cc16" : "#111827", fontSize: "1.25rem" }}>${budget}</span>
      </div>
      <div>
        {POSITIONS.map(pos => {
          const s = roster.find(r => r.slot === pos);
          const isTarget = dragFrom !== null && dragFrom !== pos;
          return (
            <div
              key={pos}
              className="px-6 py-4 flex items-center gap-3"
              style={{
                borderBottom: "1px solid #e5e7eb",
                background: isTarget ? "rgba(132,204,22,0.07)" : undefined,
                outline: isTarget ? "1px dashed #84cc16" : undefined,
              }}
              onDragOver={e => { if (onSwap) e.preventDefault(); }}
              onDrop={() => { if (onSwap && dragFrom && dragFrom !== pos) { onSwap(dragFrom, pos); setDragFrom(null); } }}
            >
              <span className="text-xs font-mono font-bold w-7 shrink-0" style={{ color: POS_COLOR[pos] }}>{pos}</span>
              {s ? (
                <div
                  className="flex items-center gap-2 flex-1 min-w-0"
                  draggable={!!onSwap}
                  onDragStart={e => { e.dataTransfer.effectAllowed = "move"; setDragFrom(pos); }}
                  onDragEnd={() => setDragFrom(null)}
                  style={{ cursor: onSwap ? "grab" : "default" }}
                >
                  <span className="font-mono text-[10px] font-bold shrink-0" style={{ color: POS_COLOR[s.player.position] }}>{s.player.position}</span>
                  <span className="font-mono text-sm flex-1 truncate" style={{ color: dark ? "#d1d5db" : "#111827" }}>{s.player.name}</span>
                  {onSwap && <span className="font-mono text-xs text-gray-400 select-none">⠿</span>}
                  <span className="font-mono text-xs" style={{ color: dark ? "#6b7280" : "#65a30d" }}>${s.paid}</span>
                </div>
              ) : (
                <span className="font-mono text-sm text-gray-300">— empty</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlacementModal({ player, openSlots, onPlace }: {
  player: Player; openSlots: Position[]; onPlace: (slot: Position) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-2 border-[#111827] bg-[#f4f0e6] p-8 max-w-sm w-full mx-4"
      >
        <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">Assign Position</p>
        <p className="font-playfair font-black text-[#111827] mb-1" style={{ fontSize: "1.3rem" }}>{player.name}</p>
        <p className="font-mono text-xs mb-1">
          Natural slot: <span style={{ color: POS_COLOR[player.position] }}>{player.position}</span>
          <span className="text-gray-400"> · already filled</span>
        </p>
        <p className="font-mono text-xs text-gray-400 mb-6">Choose an open slot. Drag players to rearrange after drafting.</p>
        <div className="flex flex-col gap-2">
          {openSlots.map(pos => (
            <button
              key={pos}
              onClick={() => onPlace(pos)}
              className="flex items-center gap-3 px-4 py-3 border-2 border-[#111827] bg-white hover:bg-[#84cc16] transition-colors font-mono font-bold text-sm"
            >
              <span style={{ color: POS_COLOR[pos] }}>{pos}</span>
              <span className="text-[#111827]">Place at {pos}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AuctionDraftPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [era, setEra] = useState<Era>("alltime");

  const [queue, setQueue] = useState<Player[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [userRoster, setUserRoster] = useState<RosterSlot[]>([]);
  const [aiRoster, setAiRoster] = useState<RosterSlot[]>([]);
  const [userBudget, setUserBudget] = useState(BUDGET);
  const [aiBudget, setAiBudget] = useState(BUDGET);

  const [currentBid, setCurrentBid] = useState(0);
  const [holder, setHolder] = useState<"user" | "ai" | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState>("user_act");
  const [bidInput, setBidInput] = useState("");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [roundMsg, setRoundMsg] = useState("");

  const [pendingPlayer, setPendingPlayer] = useState<{ player: Player; paid: number } | null>(null);

  // ── Simcast state ────────────────────────────────────────────────────────────
  const [simGames,       setSimGames]       = useState<GameLog[]>([]);
  const [simGameIdx,     setSimGameIdx]     = useState(0);
  const [simCurU,        setSimCurU]        = useState(0);  // live score current game
  const [simCurA,        setSimCurA]        = useState(0);
  const [simSeriesU,     setSimSeriesU]     = useState(0);  // series wins
  const [simSeriesA,     setSimSeriesA]     = useState(0);
  const [simDoneGames,   setSimDoneGames]   = useState<GameLog[]>([]);
  const [simStep,        setSimStep]        = useState<"scoring"|"pause"|"done">("done");
  const [simPUser,       setSimPUser]       = useState(0.5);
  const [simWinner,      setSimWinner]      = useState<"user"|"ai"|null>(null);
  const [bsUser,         setBsUser]         = useState<BoxRow[]>([]);
  const [bsAi,           setBsAi]           = useState<BoxRow[]>([]);

  // Refs for stable access inside timers
  const stateRef = useRef({ userRoster, aiRoster, userBudget, aiBudget, currentBid, holder, qIdx, queue, difficulty });
  useEffect(() => {
    stateRef.current = { userRoster, aiRoster, userBudget, aiBudget, currentBid, holder, qIdx, queue, difficulty };
  });

  const appendLog = (entry: LogEntry) => setLog(l => [...l, entry]);

  // ── Start game ───────────────────────────────────────────────────────────────
  function startGame() {
    const q = samplePool(era === "current" ? CURRENT_POOL : ALLTIME_POOL);
    setQueue(q);
    setQIdx(0);
    setUserRoster([]); setAiRoster([]);
    setUserBudget(BUDGET); setAiBudget(BUDGET);
    setCurrentBid(0); setHolder(null);
    setBidInput(""); setLog([]); setRoundMsg("");
    setGameResult(null);
    setPendingPlayer(null);
    setPhase("auction");

    // Begin first round immediately
    beginRound(q[0], [], [], BUDGET, BUDGET);
  }

  // ── Begin a round ────────────────────────────────────────────────────────────
  function beginRound(
    player: Player,
    uRoster: RosterSlot[], aRoster: RosterSlot[],
    uBudget: number, aBudget: number
  ) {
    setCurrentBid(0);
    setHolder(null);
    setBidInput("");
    setLog([{ bidder: "sys", text: `🏀 Now up: ${player.name} (${player.position}) · ${player.era}` }]);
    setRoundMsg("");

    const uFull = uRoster.length >= 5;
    const aFull = aRoster.length >= 5;

    if (uFull && aFull) {
      // Both rosters done — end auction
      setPhase("rosters");
      return;
    }

    if (uFull) {
      // User is full — auto-give to AI for $1 if it fits, else skip
      if (aiCanFit(player, aRoster) && aRoster.length < 5) {
        const slot = aiBestSlot(player, aRoster);
        const newAiRoster = [...aRoster, { player, paid: 1, slot }];
        const newAiBudget = aBudget - 1;
        setAiRoster(newAiRoster);
        setAiBudget(newAiBudget);
        appendLog({ bidder: "sys", text: `Roster full — AI claims ${player.name} for $1.` });
        setRoundMsg(`AI claims ${player.name} for $1 (your roster is full).`);
        setAuctionState("round_over");
        setTimeout(() => advanceRound(uRoster, newAiRoster, uBudget, newAiBudget), 1200);
      } else {
        appendLog({ bidder: "sys", text: `Skipping ${player.name} — no room on either roster.` });
        setAuctionState("round_over");
        setTimeout(() => advanceRound(uRoster, aRoster, uBudget, aBudget), 800);
      }
      return;
    }

    if (aFull) {
      // AI is full — user bids uncontested, just set user_act (AI will auto-pass in ai_thinking)
      setAuctionState("user_act");
      appendLog({ bidder: "sys", text: `AI roster full — bid uncontested.` });
      return;
    }

    setAuctionState("user_act");
  }

  // ── User bids ────────────────────────────────────────────────────────────────
  function handleUserBid() {
    const amount = parseInt(bidInput);
    const { userRoster: uR, userBudget: uB } = stateRef.current;
    const uSlots = 5 - uR.length;
    const cap = maxBid(uB, uSlots);
    if (isNaN(amount) || amount < 1 || amount <= currentBid || amount > cap) return;

    setCurrentBid(amount);
    setHolder("user");
    appendLog({ bidder: "user", text: `You bid $${amount}.` });
    setBidInput("");
    setAuctionState("ai_thinking");
  }

  function handleUserPass() {
    const { holder: h } = stateRef.current;
    appendLog({ bidder: "user", text: "You pass." });
    if (h === "ai") {
      // AI wins
      awardToAi();
    } else {
      // User passes opening — AI claims it for $1 if they have room
      const { aiRoster: aR, aiBudget: aB, userRoster: uR, userBudget: uB } = stateRef.current;
      const player = stateRef.current.queue[stateRef.current.qIdx];
      if (aR.length < 5 && aiCanFit(player, aR) && aB >= 1) {
        const slot = aiBestSlot(player, aR);
        const newAiRoster = [...aR, { player, paid: 1, slot }];
        const newAiBudget = aB - 1;
        setAiRoster(newAiRoster);
        setAiBudget(newAiBudget);
        appendLog({ bidder: "sys", text: `AI wins ${player.name} for $1.` });
        setAuctionState("round_over");
        setRoundMsg(`AI wins ${player.name} for $1.`);
        setTimeout(() => advanceRound(uR, newAiRoster, uB, newAiBudget), 1400);
      } else {
        appendLog({ bidder: "sys", text: "Player not claimed — moving on." });
        setAuctionState("round_over");
        setTimeout(() => advanceRound(uR, aR, uB, aB), 1000);
      }
    }
  }

  // ── AI thinking ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (auctionState !== "ai_thinking") return;

    const delay = 900 + Math.random() * 700;
    const timer = setTimeout(() => {
      const { aiRoster: aR, aiBudget: aB, currentBid: cb, holder: h, userRoster: uR, userBudget: uB, queue: q, qIdx: qi, difficulty: diff } = stateRef.current;
      const player = q[qi];
      if (!player) return;

      if (aR.length >= 5 || !aiCanFit(player, aR)) {
        appendLog({ bidder: "ai", text: "AI passes." });
        if (h === "user") awardToUser();
        else advanceRound(uR, aR, uB, aB);
        return;
      }

      const slotsLeft = 5 - aR.length;
      const bid = aiTargetBid(player, diff, aB, slotsLeft, cb);

      if (bid === null) {
        appendLog({ bidder: "ai", text: `AI passes at $${cb}.` });
        if (h === "user") {
          awardToUser();
        } else {
          advanceRound(uR, aR, uB, aB);
        }
      } else {
        setCurrentBid(bid);
        setHolder("ai");
        appendLog({ bidder: "ai", text: `AI bids $${bid}.` });
        setAuctionState("user_act");
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [auctionState]);

  // ── Award helpers ─────────────────────────────────────────────────────────────
  function awardToUser() {
    const { currentBid: cb, userRoster: uR, userBudget: uB, queue: q, qIdx: qi } = stateRef.current;
    const player = q[qi];
    const paid = Math.max(1, cb);
    appendLog({ bidder: "sys", text: `✅ You win ${player.name} for $${paid}!` });
    setRoundMsg(`You win ${player.name} for $${paid}!`);
    setAuctionState("round_over");

    const filledSlots = new Set(uR.map(r => r.slot));
    if (!filledSlots.has(player.position)) {
      // Natural slot open — auto-assign and advance
      const newRoster = [...uR, { player, paid, slot: player.position }];
      const newBudget = uB - paid;
      setUserRoster(newRoster);
      setUserBudget(newBudget);
      setTimeout(() => {
        const { aiRoster: aR, aiBudget: aB } = stateRef.current;
        advanceRound(newRoster, aR, newBudget, aB);
      }, 1500);
    } else {
      // Natural slot taken — show placement modal, wait for user to choose
      setPendingPlayer({ player, paid });
    }
  }

  function handlePlacement(slot: Position) {
    if (!pendingPlayer) return;
    const { player, paid } = pendingPlayer;
    const { userRoster: uR, userBudget: uB, aiRoster: aR, aiBudget: aB } = stateRef.current;
    const newRoster = [...uR, { player, paid, slot }];
    const newBudget = uB - paid;
    setUserRoster(newRoster);
    setUserBudget(newBudget);
    setPendingPlayer(null);
    setTimeout(() => advanceRound(newRoster, aR, newBudget, aB), 500);
  }

  function handleRosterSwap(from: Position, to: Position) {
    setUserRoster(r => r.map(s =>
      s.slot === from ? { ...s, slot: to } : s.slot === to ? { ...s, slot: from } : s
    ));
  }

  function awardToAi() {
    const { currentBid: cb, aiRoster: aR, aiBudget: aB, userRoster: uR, userBudget: uB, queue: q, qIdx: qi } = stateRef.current;
    const player = q[qi];
    const paid = Math.max(1, cb);
    const slot = aiBestSlot(player, aR);
    const newRoster = [...aR, { player, paid, slot }];
    const newBudget = aB - paid;
    setAiRoster(newRoster);
    setAiBudget(newBudget);
    appendLog({ bidder: "sys", text: `AI wins ${player.name} for $${paid}.` });
    setRoundMsg(`AI wins ${player.name} for $${paid}.`);
    setAuctionState("round_over");
    setTimeout(() => advanceRound(uR, newRoster, uB, newBudget), 1500);
  }

  // ── Advance to next round ──────────────────────────────────────────────────
  function advanceRound(uRoster: RosterSlot[], aRoster: RosterSlot[], uBudget: number, aBudget: number) {
    const next = stateRef.current.qIdx + 1;
    if (next >= stateRef.current.queue.length || (uRoster.length === 5 && aRoster.length === 5)) {
      setPhase("rosters");
      return;
    }
    setQIdx(next);
    beginRound(stateRef.current.queue[next], uRoster, aRoster, uBudget, aBudget);
  }

  // ── Simulate ─────────────────────────────────────────────────────────────────
  function runSimulation() {
    const p = getWinProb(userRoster, aiRoster);
    const games = generateSeries(p);
    setSimGames(games);
    setSimGameIdx(0);
    setSimCurU(0); setSimCurA(0);
    setSimSeriesU(0); setSimSeriesA(0);
    setSimDoneGames([]);
    setSimWinner(null);
    setSimPUser(p);
    setBsUser([]); setBsAi([]);
    setSimStep("scoring");
    setPhase("simcast");
  }

  // ── Simcast: score ticker ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "simcast" || simStep !== "scoring" || simGames.length === 0) return;
    const game = simGames[simGameIdx];
    if (!game) return;
    const p = simPUser;
    const interval = setInterval(() => {
      setSimCurU(u => u < game.uTotal ? Math.min(u + (Math.random()<p ? Math.ceil(Math.random()*3) : 0), game.uTotal) : u);
      setSimCurA(a => a < game.aTotal ? Math.min(a + (Math.random()>=p ? Math.ceil(Math.random()*3) : 0), game.aTotal) : a);
    }, 35);
    return () => clearInterval(interval);
  }, [phase, simStep, simGameIdx, simGames, simPUser]);

  // ── Simcast: detect when current game finishes scoring ───────────────────────
  useEffect(() => {
    if (phase !== "simcast" || simStep !== "scoring" || simGames.length === 0) return;
    const game = simGames[simGameIdx];
    if (!game) return;
    if (simCurU >= game.uTotal && simCurA >= game.aTotal) setSimStep("pause");
  }, [phase, simStep, simCurU, simCurA, simGameIdx, simGames]);

  // ── Simcast: pause → advance to next game or end series ──────────────────────
  useEffect(() => {
    if (phase !== "simcast" || simStep !== "pause" || simGames.length === 0) return;
    const game = simGames[simGameIdx];
    if (!game) return;
    const timer = setTimeout(() => {
      const newDone  = [...simDoneGames, game];
      const newSU    = simSeriesU + (game.winner==="user" ? 1 : 0);
      const newSA    = simSeriesA + (game.winner==="ai"   ? 1 : 0);
      setSimDoneGames(newDone);
      setSimSeriesU(newSU);
      setSimSeriesA(newSA);
      if (newSU>=4 || newSA>=4) {
        const winner = newSU>=4 ? "user" : "ai";
        setSimWinner(winner);
        setBsUser(buildBoxScore(userRoster, winner==="user"));
        setBsAi(buildBoxScore(aiRoster, winner==="ai"));
        setSimStep("done");
      } else {
        setSimGameIdx(i => i+1);
        setSimCurU(0); setSimCurA(0);
        setSimStep("scoring");
      }
    }, 1400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, simStep, simGameIdx]);

  // ─── RENDER ────────────────────────────────────────────────────────────────────

  // ── Setup ──
  if (phase === "setup") {
    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Auction Draft" />
        <main className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-4">New Game Mode</p>
            <h1 className="font-playfair font-black text-[#111827] italic mb-4" style={{ fontSize: "clamp(3.5rem, 7vw, 5.5rem)", lineHeight: 0.92, letterSpacing: "-0.03em" }}>
              Auction<br />Draft
            </h1>
            <div style={{ borderTop: "2px solid #111827", margin: "20px auto", maxWidth: 120 }} />
            <p className="font-mono text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
              10 all-time legends. $20 each. Outbid the AI to build the greatest team ever assembled — then play a game to 7.
            </p>
          </div>

          {/* How to play */}
          <div className="border-2 border-[#111827] p-6 mb-8">
            <p className="font-playfair font-black text-[#111827] mb-4" style={{ fontSize: "1.1rem" }}>How It Works</p>
            <div className="space-y-2.5">
              {[
                ["Pool", "10 all-time legends — 2 per position (PG, SG, SF, PF, C)"],
                ["Budget", "$20 each — spend wisely across all 5 roster spots"],
                ["Bidding", "You bid first. AI responds. Raise or pass each turn."],
                ["Reserve", "Must keep $1 per remaining unfilled position"],
                ["Win", "After the draft, your 5 players face the AI's 5 in a best-of-7 playoff series"],
              ].map(([label, text]) => (
                <div key={label} className="flex gap-4">
                  <span className="font-mono font-bold text-[10px] text-[#84cc16] uppercase tracking-wider w-14 shrink-0 pt-0.5">{label}</span>
                  <span className="font-mono text-xs text-gray-500 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Era */}
          <div className="mb-8">
            <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-3 text-center">Player Pool</p>
            <div className="grid grid-cols-2 gap-0 border-2 border-[#111827]">
              {(["alltime", "current"] as Era[]).map((e, i) => (
                <button
                  key={e}
                  onClick={() => setEra(e)}
                  className="py-5 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
                  style={{
                    borderRight: i === 0 ? "2px solid #111827" : undefined,
                    background: era === e ? "#111827" : "#f4f0e6",
                    color: era === e ? "#84cc16" : "#111827",
                  }}
                >
                  {e === "alltime" ? "All-Time Legends" : "Current 2025–26"}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-gray-400 mt-2.5 text-center">
              {era === "alltime"
                ? "Jordan, LeBron, Shaq — but also Rodman, Reggie Miller, Alonzo Mourning."
                : "Jokic, Giannis, SGA — but also Bane, Randle, Scottie Barnes."}
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-10">
            <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-3 text-center">AI Difficulty</p>
            <div className="grid grid-cols-3 gap-0 border-2 border-[#111827]">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d, i) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="py-5 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
                  style={{
                    borderRight: i < 2 ? "2px solid #111827" : undefined,
                    background: difficulty === d ? "#111827" : "#f4f0e6",
                    color: difficulty === d ? "#84cc16" : "#111827",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-gray-400 mt-2.5 text-center">
              {difficulty === "easy" && "AI underbids — great for learning the ropes."}
              {difficulty === "medium" && "AI values players fairly — a real contest."}
              {difficulty === "hard" && "AI bids aggressively on stars — bring your A-game."}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={startGame}
              className="px-16 py-5 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827] bg-[#84cc16] text-[#111827] hover:bg-[#65a30d] transition-colors"
            >
              Start Auction →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Auction ──
  if (phase === "auction") {
    const player = queue[qIdx];
    if (!player) return null;

    const uSlots = 5 - userRoster.length;
    const canBid = userRoster.length < 5;
    const cap = canBid ? maxBid(userBudget, uSlots) : 0;
    const bidNum = parseInt(bidInput) || 0;
    const bidOk = bidNum >= 1 && bidNum > currentBid && bidNum <= cap;
    const isUserTurn = (auctionState === "user_act") && canBid;

    // Open slots for the placement modal
    const filledUserSlots = new Set(userRoster.map(r => r.slot));
    const openUserSlots = POSITIONS.filter(p => !filledUserSlots.has(p));

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Auction Draft" />

        {pendingPlayer && (
          <PlacementModal
            player={pendingPlayer.player}
            openSlots={openUserSlots}
            onPlace={handlePlacement}
          />
        )}

        <main className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-2 border-[#111827]" style={{ minHeight: 860 }}>

            {/* Left: rosters */}
            <div style={{ borderRight: "2px solid #111827" }}>
              <RosterPanel title="Your Squad" roster={userRoster} budget={userBudget} onSwap={handleRosterSwap} />
              <div style={{ borderTop: "2px solid #111827" }}>
                <RosterPanel title="AI Squad" roster={aiRoster} budget={aiBudget} dark />
              </div>
            </div>

            {/* Right: auction arena */}
            <div className="lg:col-span-3 flex flex-col">

              {/* Player on the block */}
              <div className="p-12 relative overflow-hidden" style={{ background: "#111827", borderBottom: "2px solid #111827", minHeight: 260 }}>
                <div className="absolute -right-8 -top-8 w-72 h-72 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${POS_COLOR[player.position]}44 0%, transparent 70%)` }} />
                <div className="flex items-start justify-between mb-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] px-4 py-2 border" style={{ borderColor: POS_COLOR[player.position], color: POS_COLOR[player.position] }}>
                    {player.position}
                  </span>
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{qIdx + 1} / {queue.length}</span>
                </div>
                <h2 className="font-playfair font-black text-white mb-3" style={{ fontSize: "clamp(3rem, 5vw, 5rem)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {player.name}
                </h2>
                <p className="font-mono text-gray-500 text-base mb-2">{player.era}</p>
                <p className="font-mono text-gray-300 text-lg">{player.desc}</p>
              </div>

              {/* Bid status bar */}
              <div className="flex items-center gap-12 px-12 py-6" style={{ background: "#f4f0e6", borderBottom: "2px solid #111827" }}>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">Current Bid</p>
                  <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
                    {currentBid === 0 ? "—" : `$${currentBid}`}
                  </p>
                </div>
                {holder && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">Holds</p>
                    <p className="font-mono font-bold text-lg" style={{ color: holder === "user" ? "#84cc16" : "#ef4444" }}>
                      {holder === "user" ? "You" : "AI"}
                    </p>
                  </div>
                )}
                {canBid && isUserTurn && (
                  <div className="ml-auto text-right">
                    <p className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-0.5">Your cap here</p>
                    <p className="font-mono font-bold text-base text-[#111827]">${cap} max · ${userBudget} left · {uSlots} slots</p>
                  </div>
                )}
                {!canBid && (
                  <p className="ml-auto font-mono text-base text-gray-400">Roster full</p>
                )}
                {auctionState === "ai_thinking" && (
                  <p className="ml-auto font-mono text-base text-gray-400 animate-pulse">AI is deciding…</p>
                )}
                {auctionState === "round_over" && roundMsg && (
                  <p className="ml-auto font-mono text-base font-bold" style={{ color: roundMsg.startsWith("✅") ? "#84cc16" : "#6b7280" }}>{roundMsg}</p>
                )}
              </div>

              {/* Bid controls */}
              {isUserTurn && (
                <div className="px-12 py-7" style={{ borderBottom: "2px solid #111827", background: "#f4f0e6" }}>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min={currentBid + 1}
                      max={cap}
                      value={bidInput}
                      onChange={e => setBidInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && bidOk && handleUserBid()}
                      placeholder={`$${currentBid + 1} minimum`}
                      className="flex-1 px-6 py-5 font-mono text-lg border-2 bg-white text-[#111827] focus:outline-none"
                      style={{ borderColor: bidOk ? "#84cc16" : "#111827" }}
                    />
                    <button
                      onClick={handleUserBid}
                      disabled={!bidOk}
                      className="px-12 py-5 font-mono font-bold text-lg uppercase tracking-[0.1em] border-2 transition-colors"
                      style={bidOk
                        ? { background: "#84cc16", borderColor: "#111827", color: "#111827" }
                        : { background: "#f4f0e6", borderColor: "#d1d5db", color: "#d1d5db", cursor: "not-allowed" }}
                    >
                      Bid
                    </button>
                    <button
                      onClick={handleUserPass}
                      className="px-10 py-5 font-mono font-bold text-lg uppercase tracking-[0.1em] border-2 border-[#111827] bg-white text-[#111827] hover:bg-gray-100 transition-colors"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              )}

              {/* Bid log */}
              <div className="flex-1 p-8 overflow-y-auto" style={{ maxHeight: 280 }}>
                <div className="space-y-2">
                  {[...log].reverse().map((entry, i) => (
                    <p key={i} className="font-mono text-sm leading-relaxed" style={{
                      color: entry.bidder === "user" ? "#65a30d" : entry.bidder === "ai" ? "#ef4444" : "#9ca3af"
                    }}>
                      {entry.bidder === "user" ? "▶ " : entry.bidder === "ai" ? "◀ " : "  "}{entry.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Rosters ──
  if (phase === "rosters") {
    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Auction Draft" />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-3">Draft Complete</p>
            <h2 className="font-playfair font-black text-[#111827] italic" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}>
              Final Rosters
            </h2>
          </div>

          <p className="font-mono text-xs text-gray-400 text-center mb-4">Drag players on your squad to rearrange positions before simulating.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-[#111827] mb-10">
            <div style={{ borderRight: "2px solid #111827" }}>
              <RosterPanel title="Your Squad" roster={userRoster} budget={userBudget} onSwap={handleRosterSwap} />
            </div>
            <div>
              <RosterPanel title="AI Squad" roster={aiRoster} budget={aiBudget} dark />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={runSimulation}
              className="px-14 py-5 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827] bg-[#84cc16] text-[#111827] hover:bg-[#65a30d] transition-colors"
            >
              Simulate Best of 7 →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Final ──
  // ── Simcast ──
  if (phase === "simcast") {
    const currentGame = simGames[simGameIdx];
    const won = simWinner === "user";
    const uStar = userRoster.reduce((a,b) => a.player.value>b.player.value?a:b).player.name;
    const aStar = aiRoster.reduce((a,b)  => a.player.value>b.player.value?a:b).player.name;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#111827" }}>
        <GameHeader title="Auction Draft" />

        <main className="flex-1 flex flex-col items-center px-6 py-8 gap-6">

          {/* ── Live Scoreboard ── */}
          <div className="w-full max-w-4xl border-2 border-[#84cc16]">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b-2 border-[#84cc16]">
              <div className="px-6 py-5 border-r-2 border-[#84cc16] text-center">
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">Your Squad</p>
                <p className="font-playfair font-black text-white" style={{ fontSize: "3.5rem", lineHeight: 1 }}>{simSeriesU}</p>
                <p className="font-mono text-[10px] text-[#84cc16] mt-1 uppercase tracking-widest">series wins</p>
              </div>
              <div className="px-6 py-5 text-center flex flex-col justify-center">
                {simStep !== "done" ? (
                  <>
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-3">
                      Game {currentGame?.num ?? 1} · Live
                    </p>
                    <div className="flex items-center justify-center gap-5">
                      <span className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "3rem", lineHeight: 1 }}>{simCurU}</span>
                      <span className="font-mono text-gray-600 text-xl">–</span>
                      <span className="font-playfair font-black text-[#84cc16]" style={{ fontSize: "3rem", lineHeight: 1 }}>{simCurA}</span>
                    </div>
                    <p className="font-mono text-xs text-[#84cc16] mt-2 animate-pulse">● LIVE</p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-2">Series Final</p>
                    <p className="font-playfair font-black" style={{ fontSize: "2rem", lineHeight: 1, color: "#84cc16" }}>
                      {simSeriesU} – {simSeriesA}
                    </p>
                    <p className="font-mono text-xs text-gray-400 mt-2">Best of 7</p>
                  </>
                )}
              </div>
              <div className="px-6 py-5 border-l-2 border-[#84cc16] text-center">
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-1">AI Squad</p>
                <p className="font-playfair font-black text-white" style={{ fontSize: "3.5rem", lineHeight: 1 }}>{simSeriesA}</p>
                <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase tracking-widest">series wins</p>
              </div>
            </div>

            {/* Game log */}
            <div className="divide-y divide-gray-800">
              {simDoneGames.map(g => (
                <div key={g.num} className="flex items-center gap-4 px-6 py-3">
                  <span className="font-mono text-xs text-gray-600 w-16 shrink-0">Game {g.num}</span>
                  <span className="font-mono text-sm font-bold" style={{ color: g.winner==="user" ? "#84cc16" : "#ef4444" }}>
                    {g.winner==="user" ? "Your Squad wins" : "AI Squad wins"}
                  </span>
                  <span className="font-mono text-sm text-gray-500 ml-auto">{g.uTotal} – {g.aTotal}</span>
                </div>
              ))}
              {simStep === "scoring" && currentGame && (
                <div className="flex items-center gap-4 px-6 py-3">
                  <span className="font-mono text-xs text-gray-600 w-16 shrink-0">Game {currentGame.num}</span>
                  <span className="font-mono text-xs text-[#84cc16] animate-pulse">In progress…</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Series result banner ── */}
          {simStep === "done" && simWinner && (
            <motion.div
              className="w-full max-w-4xl text-center py-8 border-2"
              style={{ borderColor: "#84cc16" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#84cc16] mb-2">
                {won ? "Victory" : "Defeat"}
              </p>
              <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
                {won ? "Your Squad\nWins!" : "AI Squad\nWins."}
              </h2>
              <p className="font-mono text-sm text-gray-500 mt-3">
                Series stars — You: <strong className="text-white">{uStar}</strong> · AI: <strong className="text-white">{aStar}</strong>
              </p>
            </motion.div>
          )}

          {/* ── Box Score ── */}
          {simStep === "done" && bsUser.length > 0 && (
            <motion.div
              className="w-full max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#84cc16] mb-3">Box Score</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-[#84cc16]">
                {/* User box score */}
                <div style={{ borderRight: "2px solid #84cc16" }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#84cc16" }}>
                    <p className="font-playfair font-black text-[#111827]">Your Squad</p>
                    <p className="font-mono text-xs text-[#111827] font-bold">{won ? "SERIES WIN" : "SERIES LOSS"}</p>
                  </div>
                  <div className="px-5 py-2 grid grid-cols-6 gap-1 border-b border-gray-700">
                    {["PLAYER","PTS","REB","AST","STL","BLK"].map(h => (
                      <span key={h} className="font-mono text-[9px] text-gray-500 uppercase tracking-wider text-center first:text-left">{h}</span>
                    ))}
                  </div>
                  {bsUser.map((row, i) => (
                    <div key={i} className="px-5 py-2.5 grid grid-cols-6 gap-1 border-b border-gray-800">
                      <span className="font-mono text-xs text-white truncate col-span-1">{row.name.split(" ").slice(-1)[0]}</span>
                      <span className="font-mono text-sm font-bold text-center" style={{ color: "#84cc16" }}>{row.pts}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.reb}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.ast}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.stl}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.blk}</span>
                    </div>
                  ))}
                </div>
                {/* AI box score */}
                <div>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#1f2937", borderBottom: "2px solid #374151" }}>
                    <p className="font-playfair font-black text-white">AI Squad</p>
                    <p className="font-mono text-xs text-gray-400 font-bold">{!won ? "SERIES WIN" : "SERIES LOSS"}</p>
                  </div>
                  <div className="px-5 py-2 grid grid-cols-6 gap-1 border-b border-gray-700">
                    {["PLAYER","PTS","REB","AST","STL","BLK"].map(h => (
                      <span key={h} className="font-mono text-[9px] text-gray-500 uppercase tracking-wider text-center first:text-left">{h}</span>
                    ))}
                  </div>
                  {bsAi.map((row, i) => (
                    <div key={i} className="px-5 py-2.5 grid grid-cols-6 gap-1 border-b border-gray-800">
                      <span className="font-mono text-xs text-white truncate">{row.name.split(" ").slice(-1)[0]}</span>
                      <span className="font-mono text-sm font-bold text-center" style={{ color: !won ? "#84cc16" : "#ef4444" }}>{row.pts}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.reb}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.ast}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.stl}</span>
                      <span className="font-mono text-xs text-gray-300 text-center">{row.blk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-8 justify-center">
                <button
                  onClick={() => setPhase("setup")}
                  className="px-12 py-5 font-mono font-bold uppercase tracking-[0.2em] text-base border-2 border-[#84cc16] bg-[#84cc16] text-[#111827] hover:bg-[#65a30d] transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setPhase("rosters")}
                  className="px-10 py-5 font-mono font-bold uppercase tracking-[0.2em] text-base border-2 border-[#84cc16] text-[#84cc16] hover:bg-[#84cc16]/10 transition-colors"
                >
                  View Rosters
                </button>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    );
  }

  return null;
}
