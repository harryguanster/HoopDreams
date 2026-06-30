"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Position = "PG" | "SG" | "SF" | "PF" | "C";
type Difficulty = "easy" | "medium" | "hard";
type Phase = "setup" | "auction" | "rosters" | "final";
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

interface RosterSlot { player: Player; paid: number; }

// ─── Player Pool ───────────────────────────────────────────────────────────────
const POOL: Player[] = [
  { id: "magic",   name: "Magic Johnson",       position: "PG", era: "1979–96",      desc: "5× Champion · 3× Finals MVP · ran Showtime",             value: 9.0, off: 9.2, def: 7.5 },
  { id: "curry",   name: "Stephen Curry",       position: "PG", era: "2009–present", desc: "4× Champion · 2× MVP · greatest shooter ever",           value: 8.8, off: 9.5, def: 6.8 },
  { id: "jordan",  name: "Michael Jordan",      position: "SG", era: "1984–2003",    desc: "6× Champion · 6× Finals MVP · The GOAT",                 value: 10,  off: 10,  def: 9.2 },
  { id: "kobe",    name: "Kobe Bryant",         position: "SG", era: "1996–2016",    desc: "5× Champion · 81 points · Mamba Mentality",              value: 9.0, off: 9.3, def: 8.5 },
  { id: "lebron",  name: "LeBron James",        position: "SF", era: "2003–present", desc: "4× Champion · 4× MVP · all-time scoring leader",         value: 9.8, off: 9.8, def: 8.8 },
  { id: "bird",    name: "Larry Bird",          position: "SF", era: "1979–92",      desc: "3× Champion · 3× MVP · Celtic legend",                   value: 8.8, off: 9.0, def: 7.8 },
  { id: "duncan",  name: "Tim Duncan",          position: "PF", era: "1997–2016",    desc: "5× Champion · 3× Finals MVP · The Big Fundamental",      value: 9.2, off: 8.8, def: 9.5 },
  { id: "kg",      name: "Kevin Garnett",       position: "PF", era: "1995–2016",    desc: "1× Champion · 1× MVP · 1× DPOY · defensive anchor",      value: 8.5, off: 8.2, def: 9.8 },
  { id: "kareem",  name: "Kareem Abdul-Jabbar", position: "C",  era: "1969–89",      desc: "6× Champion · 6× MVP · unstoppable skyhook",             value: 9.5, off: 9.3, def: 8.8 },
  { id: "shaq",    name: "Shaquille O'Neal",    position: "C",  era: "1992–2011",    desc: "4× Champion · 3× Finals MVP · most dominant big man",    value: 9.3, off: 9.5, def: 8.0 },
];

const POSITIONS: Position[] = ["PG", "SG", "SF", "PF", "C"];
const BUDGET = 20;

const POS_COLOR: Record<Position, string> = {
  PG: "#84cc16", SG: "#f59e0b", SF: "#3b82f6", PF: "#8b5cf6", C: "#ef4444",
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

function neededPositions(roster: RosterSlot[]): Position[] {
  const filled = new Set(roster.map(r => r.player.position));
  return POSITIONS.filter(p => !filled.has(p));
}

// Must keep $1 per remaining slot after this one
function maxBid(budget: number, slotsLeft: number): number {
  return Math.max(0, budget - Math.max(0, slotsLeft - 1));
}

function aiTargetBid(player: Player, difficulty: Difficulty, budget: number, slotsLeft: number, currentBid: number): number | null {
  const cap = maxBid(budget, slotsLeft);
  if (cap <= currentBid) return null;

  // Fair value: scale player value to budget per slot
  const fair = (player.value / 9.5) * (BUDGET / 5); // ~$4.2 avg
  let target: number;
  switch (difficulty) {
    case "easy":   target = fair * 0.45 + Math.random() * fair * 0.2; break;
    case "medium": target = fair * 0.85 + (Math.random() - 0.5) * fair * 0.15; break;
    case "hard":   target = fair * 1.05 + Math.random() * fair * 0.12; break;
  }

  const t = Math.floor(Math.min(cap, Math.max(1, target)));
  return t > currentBid ? currentBid + 1 : null;
}

function simulateGame(userRoster: RosterSlot[], aiRoster: RosterSlot[]) {
  const uOff = userRoster.reduce((s, r) => s + r.player.off, 0) / userRoster.length;
  const uDef = userRoster.reduce((s, r) => s + r.player.def, 0) / userRoster.length;
  const aOff = aiRoster.reduce((s, r) => s + r.player.off, 0) / aiRoster.length;
  const aDef = aiRoster.reduce((s, r) => s + r.player.def, 0) / aiRoster.length;

  const uStrength = uOff * 0.55 + (10 - aDef) * 0.45;
  const aStrength = aOff * 0.55 + (10 - uDef) * 0.45;
  const pUser = uStrength / (uStrength + aStrength);

  let uScore = 0, aScore = 0;
  while (uScore < 7 && aScore < 7) {
    if (Math.random() < pUser) uScore++; else aScore++;
  }

  const uStar = userRoster.reduce((a, b) => a.player.value > b.player.value ? a : b).player;
  const aStar = aiRoster.reduce((a, b) => a.player.value > b.player.value ? a : b).player;
  const winner = uScore === 7 ? "user" : "ai";

  return {
    winner: winner as "user" | "ai",
    userScore: uScore,
    aiScore: aScore,
    mvp: (winner === "user" ? uStar : aStar).name,
    userStar: uStar.name,
    aiStar: aStar.name,
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function RosterPanel({ title, roster, budget, dark }: { title: string; roster: RosterSlot[]; budget: number; dark?: boolean }) {
  return (
    <div>
      <div className="px-5 py-4 flex items-center justify-between" style={{ background: dark ? "#111827" : "#84cc16", borderBottom: "2px solid #111827" }}>
        <p className="font-playfair font-black" style={{ fontSize: "1rem", color: dark ? "#fff" : "#111827" }}>{title}</p>
        <span className="font-mono font-bold" style={{ color: dark ? "#84cc16" : "#111827", fontSize: "1.1rem" }}>${budget}</span>
      </div>
      <div>
        {POSITIONS.map(pos => {
          const slot = roster.find(r => r.player.position === pos);
          return (
            <div key={pos} className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
              <span className="text-[9px] font-mono font-bold w-6 shrink-0" style={{ color: POS_COLOR[pos] }}>{pos}</span>
              {slot ? (
                <>
                  <span className="font-mono text-xs flex-1 truncate" style={{ color: dark ? "#d1d5db" : "#111827" }}>{slot.player.name}</span>
                  <span className="font-mono text-[10px]" style={{ color: dark ? "#6b7280" : "#65a30d" }}>${slot.paid}</span>
                </>
              ) : (
                <span className="font-mono text-xs text-gray-300">— empty</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AuctionDraftPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

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

  const [gameResult, setGameResult] = useState<ReturnType<typeof simulateGame> | null>(null);

  // Refs for stable access inside timers
  const stateRef = useRef({ userRoster, aiRoster, userBudget, aiBudget, currentBid, holder, qIdx, queue, difficulty });
  useEffect(() => {
    stateRef.current = { userRoster, aiRoster, userBudget, aiBudget, currentBid, holder, qIdx, queue, difficulty };
  });

  const appendLog = (entry: LogEntry) => setLog(l => [...l, entry]);

  // ── Start game ───────────────────────────────────────────────────────────────
  function startGame() {
    const q = shuffle(POOL);
    setQueue(q);
    setQIdx(0);
    setUserRoster([]); setAiRoster([]);
    setUserBudget(BUDGET); setAiBudget(BUDGET);
    setCurrentBid(0); setHolder(null);
    setBidInput(""); setLog([]); setRoundMsg("");
    setGameResult(null);
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
    const uNeeds = neededPositions(uRoster).includes(player.position);
    const aNeeds = neededPositions(aRoster).includes(player.position);

    setCurrentBid(0);
    setHolder(null);
    setBidInput("");
    setLog([{ bidder: "sys", text: `🏀 Now up: ${player.name} (${player.position}) · ${player.era}` }]);
    setRoundMsg("");

    if (!uNeeds && !aNeeds) {
      // Both already have this position (can't happen with 10 players, but safety net)
      setRoundMsg("Both teams already have this position — skipping.");
      setAuctionState("round_over");
      setTimeout(() => advanceRound(uRoster, aRoster, uBudget, aBudget), 1200);
      return;
    }

    if (uNeeds && !aNeeds) {
      // User gets it uncontested for $1
      appendLog({ bidder: "sys", text: `AI already has a ${player.position}. You get this uncontested — bidding starts at $1.` });
      setAuctionState("user_act");
      return;
    }

    if (!uNeeds && aNeeds) {
      // AI gets it uncontested for $1
      appendLog({ bidder: "sys", text: `You already have a ${player.position}. AI wins uncontested.` });
      setTimeout(() => {
        const { aRoster: cur, aBudget: curB } = stateRef.current;
        const newAiRoster = [...cur, { player, paid: 1 }];
        const newAiBudget = curB - 1;
        setAiRoster(newAiRoster);
        setAiBudget(newAiBudget);
        appendLog({ bidder: "sys", text: `AI wins ${player.name} for $1.` });
        advanceRound(stateRef.current.userRoster, newAiRoster, stateRef.current.userBudget, newAiBudget);
      }, 1000);
      return;
    }

    // Both need it — open bidding
    setAuctionState("user_act");
  }

  // ── User bids ────────────────────────────────────────────────────────────────
  function handleUserBid() {
    const amount = parseInt(bidInput);
    const { userRoster: uR, userBudget: uB } = stateRef.current;
    const uSlots = neededPositions(uR).length;
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
      // User passes opening — check if AI needs it
      const { aiRoster: aR, aiBudget: aB, userRoster: uR, userBudget: uB } = stateRef.current;
      const player = stateRef.current.queue[stateRef.current.qIdx];
      const aNeeds = neededPositions(aR).includes(player.position);
      if (aNeeds) {
        const newAiRoster = [...aR, { player, paid: 1 }];
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

      const aNeeds = neededPositions(aR).includes(player.position);
      if (!aNeeds) {
        // AI doesn't need this pos
        appendLog({ bidder: "ai", text: "AI passes (already has this position)." });
        if (h === "user") awardToUser();
        else advanceRound(uR, aR, uB, aB);
        return;
      }

      const slotsLeft = neededPositions(aR).length;
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
    const { currentBid: cb, userRoster: uR, userBudget: uB, aiRoster: aR, aiBudget: aB, queue: q, qIdx: qi } = stateRef.current;
    const player = q[qi];
    const paid = Math.max(1, cb);
    const newRoster = [...uR, { player, paid }];
    const newBudget = uB - paid;
    setUserRoster(newRoster);
    setUserBudget(newBudget);
    appendLog({ bidder: "sys", text: `✅ You win ${player.name} for $${paid}!` });
    setRoundMsg(`You win ${player.name} for $${paid}!`);
    setAuctionState("round_over");
    setTimeout(() => advanceRound(newRoster, aR, newBudget, aB), 1500);
  }

  function awardToAi() {
    const { currentBid: cb, aiRoster: aR, aiBudget: aB, userRoster: uR, userBudget: uB, queue: q, qIdx: qi } = stateRef.current;
    const player = q[qi];
    const paid = Math.max(1, cb);
    const newRoster = [...aR, { player, paid }];
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
    setTimeout(() => {
      const result = simulateGame(userRoster, aiRoster);
      setGameResult(result);
      setPhase("final");
    }, 1800);
    setPhase("final"); // will show loading until result is set
  }

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
                ["Win", "After the draft, your 5 players face the AI's 5 in a game to 7"],
              ].map(([label, text]) => (
                <div key={label} className="flex gap-4">
                  <span className="font-mono font-bold text-[10px] text-[#84cc16] uppercase tracking-wider w-14 shrink-0 pt-0.5">{label}</span>
                  <span className="font-mono text-xs text-gray-500 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
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

    const uNeeded = neededPositions(userRoster);
    const uSlots = uNeeded.length;
    const canBid = uNeeded.includes(player.position);
    const cap = canBid ? maxBid(userBudget, uSlots) : 0;
    const bidNum = parseInt(bidInput) || 0;
    const bidOk = bidNum >= 1 && bidNum > currentBid && bidNum <= cap;
    const isUserTurn = (auctionState === "user_act") && canBid;

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Auction Draft" />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 border-2 border-[#111827]" style={{ minHeight: 600 }}>

            {/* Left: rosters */}
            <div style={{ borderRight: "2px solid #111827" }}>
              <RosterPanel title="Your Squad" roster={userRoster} budget={userBudget} />
              <div style={{ borderTop: "2px solid #111827" }}>
                <RosterPanel title="AI Squad" roster={aiRoster} budget={aiBudget} dark />
              </div>
            </div>

            {/* Right: auction arena */}
            <div className="lg:col-span-3 flex flex-col">

              {/* Player on the block */}
              <div className="p-8 relative overflow-hidden" style={{ background: "#111827", borderBottom: "2px solid #111827", minHeight: 180 }}>
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${POS_COLOR[player.position]}33 0%, transparent 70%)` }} />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-2.5 py-1 border" style={{ borderColor: POS_COLOR[player.position], color: POS_COLOR[player.position] }}>
                    {player.position}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{qIdx + 1} / {queue.length}</span>
                </div>
                <h2 className="font-playfair font-black text-white mb-1" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {player.name}
                </h2>
                <p className="font-mono text-gray-500 text-xs mb-1">{player.era}</p>
                <p className="font-mono text-gray-400 text-sm">{player.desc}</p>
              </div>

              {/* Bid status bar */}
              <div className="flex items-center gap-8 px-8 py-4" style={{ background: "#f4f0e6", borderBottom: "2px solid #111827" }}>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Current Bid</p>
                  <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "2rem", lineHeight: 1 }}>
                    {currentBid === 0 ? "—" : `$${currentBid}`}
                  </p>
                </div>
                {holder && (
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Holds</p>
                    <p className="font-mono font-bold text-sm" style={{ color: holder === "user" ? "#84cc16" : "#ef4444" }}>
                      {holder === "user" ? "You" : "AI"}
                    </p>
                  </div>
                )}
                {canBid && isUserTurn && (
                  <div className="ml-auto text-right">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-0.5">Your cap here</p>
                    <p className="font-mono font-bold text-[#111827]">${cap} max · ${userBudget} left · {uSlots} slots</p>
                  </div>
                )}
                {!canBid && (
                  <p className="ml-auto font-mono text-sm text-gray-400">You already have a {player.position}</p>
                )}
                {auctionState === "ai_thinking" && (
                  <p className="ml-auto font-mono text-sm text-gray-400 animate-pulse">AI is deciding…</p>
                )}
                {auctionState === "round_over" && roundMsg && (
                  <p className="ml-auto font-mono text-sm font-bold" style={{ color: roundMsg.startsWith("✅") ? "#84cc16" : "#6b7280" }}>{roundMsg}</p>
                )}
              </div>

              {/* Bid controls */}
              {isUserTurn && (
                <div className="px-8 py-5" style={{ borderBottom: "2px solid #111827", background: "#f4f0e6" }}>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min={currentBid + 1}
                      max={cap}
                      value={bidInput}
                      onChange={e => setBidInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && bidOk && handleUserBid()}
                      placeholder={`$${currentBid + 1} minimum`}
                      className="flex-1 px-4 py-3 font-mono text-sm border-2 bg-white text-[#111827] focus:outline-none"
                      style={{ borderColor: bidOk ? "#84cc16" : "#111827" }}
                    />
                    <button
                      onClick={handleUserBid}
                      disabled={!bidOk}
                      className="px-8 py-3 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 transition-colors"
                      style={bidOk
                        ? { background: "#84cc16", borderColor: "#111827", color: "#111827" }
                        : { background: "#f4f0e6", borderColor: "#d1d5db", color: "#d1d5db", cursor: "not-allowed" }}
                    >
                      Bid
                    </button>
                    <button
                      onClick={handleUserPass}
                      className="px-6 py-3 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] bg-white text-[#111827] hover:bg-gray-100 transition-colors"
                    >
                      Pass
                    </button>
                  </div>
                </div>
              )}

              {/* Bid log */}
              <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 200 }}>
                <div className="space-y-1">
                  {[...log].reverse().map((entry, i) => (
                    <p key={i} className="font-mono text-xs leading-relaxed" style={{
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-[#111827] mb-10">
            <div style={{ borderRight: "2px solid #111827" }}>
              <div className="p-5" style={{ background: "#84cc16", borderBottom: "2px solid #111827" }}>
                <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "1.3rem" }}>Your Squad</p>
                <p className="font-mono text-[10px] text-[#111827]/60 mt-0.5">${BUDGET - userBudget} spent · ${userBudget} left</p>
              </div>
              {userRoster.length === 0 && <p className="p-5 font-mono text-sm text-gray-400">No players drafted.</p>}
              {userRoster.map(slot => (
                <div key={slot.player.id} className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <span className="text-[9px] font-mono font-bold w-6 shrink-0" style={{ color: POS_COLOR[slot.player.position] }}>{slot.player.position}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair font-black text-[#111827] truncate" style={{ fontSize: "1rem" }}>{slot.player.name}</p>
                    <p className="font-mono text-gray-400 text-[10px]">{slot.player.era}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#84cc16]">${slot.paid}</span>
                </div>
              ))}
            </div>

            <div>
              <div className="p-5" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                <p className="font-playfair font-black text-white" style={{ fontSize: "1.3rem" }}>AI Squad</p>
                <p className="font-mono text-[10px] text-gray-400 mt-0.5">${BUDGET - aiBudget} spent · ${aiBudget} left</p>
              </div>
              {aiRoster.length === 0 && <p className="p-5 font-mono text-sm text-gray-400">No players drafted.</p>}
              {aiRoster.map(slot => (
                <div key={slot.player.id} className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <span className="text-[9px] font-mono font-bold w-6 shrink-0" style={{ color: POS_COLOR[slot.player.position] }}>{slot.player.position}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair font-black text-[#111827] truncate" style={{ fontSize: "1rem" }}>{slot.player.name}</p>
                    <p className="font-mono text-gray-400 text-[10px]">{slot.player.era}</p>
                  </div>
                  <span className="font-mono font-bold text-sm text-gray-400">${slot.paid}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={runSimulation}
              className="px-14 py-5 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827] bg-[#84cc16] text-[#111827] hover:bg-[#65a30d] transition-colors"
            >
              Simulate Game to 7 →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Final ──
  if (phase === "final") {
    if (!gameResult) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#111827" }}>
          <p className="font-mono text-[#84cc16] uppercase tracking-widest animate-pulse">Simulating…</p>
        </div>
      );
    }

    const won = gameResult.winner === "user";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: won ? "#f4f0e6" : "#111827" }}>
        <motion.div
          className="w-full max-w-lg text-center"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-6">
            {won ? "Victory" : "Defeat"}
          </p>
          <h2 className="font-playfair font-black italic mb-2" style={{
            fontSize: "clamp(4rem, 10vw, 7rem)",
            letterSpacing: "-0.03em", lineHeight: 0.88,
            color: won ? "#111827" : "#ffffff",
          }}>
            {won ? "You\nWin!" : "AI\nWins."}
          </h2>
          <div style={{ borderTop: `2px solid ${won ? "#111827" : "#84cc16"}`, margin: "24px auto", maxWidth: 100 }} />

          <p className="font-playfair font-black mb-1" style={{ fontSize: "3.5rem", lineHeight: 1, color: "#84cc16" }}>
            {gameResult.userScore} – {gameResult.aiScore}
          </p>
          <p className="font-mono text-sm mb-6" style={{ color: won ? "#9ca3af" : "#6b7280" }}>Game to 7</p>

          <div className="border-2 p-5 mb-8 text-left" style={{ borderColor: won ? "#111827" : "#84cc16" }}>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "#84cc16" }}>Recap</p>
            <p className="font-mono text-sm mb-1" style={{ color: won ? "#6b7280" : "#9ca3af" }}>
              Your star: <strong style={{ color: won ? "#111827" : "#ffffff" }}>{gameResult.userStar}</strong>
            </p>
            <p className="font-mono text-sm mb-3" style={{ color: won ? "#6b7280" : "#9ca3af" }}>
              AI star: <strong style={{ color: won ? "#111827" : "#ffffff" }}>{gameResult.aiStar}</strong>
            </p>
            <p className="font-mono text-sm font-bold" style={{ color: "#84cc16" }}>
              MVP: {gameResult.mvp}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setPhase("setup")}
              className="px-10 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 transition-colors"
              style={won
                ? { borderColor: "#111827", background: "#111827", color: "#84cc16" }
                : { borderColor: "#84cc16", background: "#84cc16", color: "#111827" }}
            >
              Play Again
            </button>
            <button
              onClick={() => setPhase("rosters")}
              className="px-8 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 transition-colors"
              style={won
                ? { borderColor: "#111827", background: "transparent", color: "#111827" }
                : { borderColor: "#84cc16", background: "transparent", color: "#84cc16" }}
            >
              View Rosters
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
