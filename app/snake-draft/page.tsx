"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import GameHeader from "@/app/components/GameHeader";
import {
  DRAFT_POOL, BRACKET_OPPONENTS, SNAKE_ORDER, aiPick,
  type SDPlayer, type BracketOpponent,
} from "@/lib/snakeDraftData";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATS = [
  { key: "ppg" as const, label: "PPG", full: "Points Per Game" },
  { key: "rpg" as const, label: "RPG", full: "Rebounds Per Game" },
  { key: "apg" as const, label: "APG", full: "Assists Per Game" },
  { key: "spg" as const, label: "SPG", full: "Steals Per Game" },
  { key: "bpg" as const, label: "BPG", full: "Blocks Per Game" },
] as const;

type StatKey = (typeof CATS)[number]["key"];
type CatResult = "user" | "opp" | "tie";
type Phase = "draft" | "reveal" | "matchup" | "between" | "eliminated" | "champion";

const TIER_COLOR: Record<number, string> = { 1: "#84cc16", 2: "#f59e0b", 3: "#9ca3af" };
const TIER_LABEL: Record<number, string> = { 1: "Superstar", 2: "Star", 3: "Role Player" };
const DIFF_COLOR: Record<string, string> = { moderate: "#84cc16", hard: "#f59e0b", legendary: "#ef4444" };

function stat(players: { ppg: number; rpg: number; apg: number; spg: number; bpg: number }[], key: StatKey) {
  return parseFloat(players.reduce((s, p) => s + p[key], 0).toFixed(1));
}

const POS_ORDER = ["PG", "SG", "SF", "PF", "C"];

// ─── Player Card ──────────────────────────────────────────────────────────────
function PlayerCard({
  player, onClick, disabled, dim,
}: {
  player: SDPlayer; onClick?: () => void; disabled?: boolean; dim?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || dim}
      whileHover={!disabled && !dim ? { scale: 1.025, y: -2 } : {}}
      whileTap={!disabled && !dim ? { scale: 0.97 } : {}}
      className="w-full text-left border-2 overflow-hidden"
      style={{
        borderColor: "#111827",
        background: "#fff",
        opacity: dim ? 0.38 : 1,
        cursor: disabled || dim ? "default" : "pointer",
        transition: "opacity 0.2s",
      }}
    >
      {/* Dark header */}
      <div className="px-3 pt-3 pb-2" style={{ background: "#111827" }}>
        <div className="flex items-center justify-between mb-1">
          <span
            className="font-mono font-bold text-[8px] uppercase tracking-widest"
            style={{ color: TIER_COLOR[player.tier] }}
          >
            {player.position} · {TIER_LABEL[player.tier]}
          </span>
          <span className="font-mono text-[8px] text-gray-500">{player.era}</span>
        </div>
        <p className="font-playfair font-black text-white leading-tight" style={{ fontSize: "0.95rem" }}>
          {player.name}
        </p>
        <p className="font-mono text-[9px] text-gray-400 mt-0.5 leading-tight">{player.hint}</p>
      </div>
      {/* Cream stats */}
      <div className="px-3 py-2 grid grid-cols-5 gap-0" style={{ background: "#f4f0e6" }}>
        {CATS.map(cat => (
          <div key={cat.key} className="text-center">
            <p className="font-mono text-[7px] text-gray-400 uppercase">{cat.label}</p>
            <p className="font-playfair font-black text-[#111827]" style={{ fontSize: "0.8rem" }}>
              {player[cat.key].toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Roster Slot ─────────────────────────────────────────────────────────────
function RosterSlot({
  player, isEmpty, label, onClick, highlight,
}: {
  player?: SDPlayer; isEmpty?: boolean; label: string; onClick?: () => void; highlight?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="border-2 px-3 py-2 flex items-center justify-between"
      style={{
        borderColor: highlight ? "#84cc16" : "#111827",
        background: player ? "#111827" : "transparent",
        minHeight: 52,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {player ? (
        <>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: TIER_COLOR[player.tier] }}>
              {player.position}
            </p>
            <p className="font-playfair font-black text-white leading-tight" style={{ fontSize: "0.9rem" }}>
              {player.name}
            </p>
          </div>
          {highlight && <span className="font-mono text-[10px] text-red-400 ml-2">drop ✕</span>}
        </>
      ) : (
        <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">{label} — Empty</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SnakeDraftPage() {
  const { user } = useUser();
  const userName = user?.firstName || user?.username || "You";

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("draft");
  const [pool, setPool] = useState<SDPlayer[]>([...DRAFT_POOL]);
  const [userRoster, setUserRoster] = useState<SDPlayer[]>([]);
  const [aiRoster, setAiRoster] = useState<SDPlayer[]>([]);
  const [pickNum, setPickNum] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [catResults, setCatResults] = useState<CatResult[]>([]);
  const [revealedCats, setRevealedCats] = useState(0);
  const [aiMsg, setAiMsg] = useState<string | null>(null);
  const [undrafted, setUndrafted] = useState<SDPlayer[]>([]);
  const [waiverDropId, setWaiverDropId] = useState<string | null>(null);
  const [posFilter, setPosFilter] = useState<string>("ALL");

  // Refs to prevent stale closures
  const poolRef = useRef(pool);
  const aiRosterRef = useRef(aiRoster);
  const userRosterRef = useRef(userRoster);
  poolRef.current = pool;
  aiRosterRef.current = aiRoster;
  userRosterRef.current = userRoster;

  const currentTurn = SNAKE_ORDER[pickNum] ?? "done";
  const opponent = BRACKET_OPPONENTS[roundIdx] ?? BRACKET_OPPONENTS[2];

  useEffect(() => { setMounted(true); }, []);

  // AI auto-pick
  useEffect(() => {
    if (!mounted || phase !== "draft" || currentTurn !== "ai" || pickNum >= 10) return;

    const t = setTimeout(() => {
      const pick = aiPick(poolRef.current, aiRosterRef.current);
      const newPool = poolRef.current.filter(p => p.id !== pick.id);
      setAiMsg(pick.name);
      setAiRoster(prev => [...prev, pick]);
      setPool(newPool);
      poolRef.current = newPool;

      setTimeout(() => {
        setAiMsg(null);
        const next = pickNum + 1;
        if (next >= 10) {
          setUndrafted(newPool);
          setPhase("reveal");
        } else {
          setPickNum(next);
        }
      }, 1100);
    }, 750);

    return () => clearTimeout(t);
  }, [mounted, phase, pickNum, currentTurn]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleUserPick(player: SDPlayer) {
    if (phase !== "draft" || currentTurn !== "user") return;
    const newPool = pool.filter(p => p.id !== player.id);
    setPool(newPool);
    setUserRoster(prev => [...prev, player]);
    const next = pickNum + 1;
    if (next >= 10) {
      setUndrafted(newPool);
      setPhase("reveal");
    } else {
      setPickNum(next);
    }
  }

  function startMatchup(roster: SDPlayer[], opp: BracketOpponent) {
    setCatResults([]);
    setRevealedCats(0);
    setPhase("matchup");
    CATS.forEach((cat, i) => {
      setTimeout(() => {
        const uTotal = stat(roster, cat.key);
        const oTotal = stat(opp.players, cat.key);
        const result: CatResult = uTotal > oTotal ? "user" : oTotal > uTotal ? "opp" : "tie";
        setCatResults(prev => [...prev, result]);
        setRevealedCats(i + 1);
      }, (i + 1) * 1350);
    });
  }

  function handleStartTournament() {
    setRoundIdx(0);
    startMatchup(userRosterRef.current, BRACKET_OPPONENTS[0]);
  }

  function handleMatchupContinue() {
    const userWins = catResults.filter(r => r === "user").length;
    if (userWins >= 3) {
      if (roundIdx >= 2) setPhase("champion");
      else setPhase("between");
    } else {
      setPhase("eliminated");
    }
  }

  function handleNextRound() {
    const next = roundIdx + 1;
    setRoundIdx(next);
    setWaiverDropId(null);
    startMatchup(userRosterRef.current, BRACKET_OPPONENTS[next]);
  }

  function handleWaiverAdd(addPlayer: SDPlayer) {
    if (!waiverDropId) return;
    const newRoster = userRoster.map(p =>
      p.id === waiverDropId ? addPlayer : p
    );
    const dropped = userRoster.find(p => p.id === waiverDropId)!;
    setUserRoster(newRoster);
    userRosterRef.current = newRoster;
    setUndrafted(prev => prev.filter(p => p.id !== addPlayer.id).concat([dropped]));
    setWaiverDropId(null);
  }

  function handleRestart() {
    setPhase("draft");
    setPool([...DRAFT_POOL]);
    setUserRoster([]);
    setAiRoster([]);
    setPickNum(0);
    setRoundIdx(0);
    setCatResults([]);
    setRevealedCats(0);
    setAiMsg(null);
    setUndrafted([]);
    setWaiverDropId(null);
    setPosFilter("ALL");
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f0e6" }}>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Loading…</p>
      </div>
    );
  }

  // ── DRAFT PHASE ────────────────────────────────────────────────────────────
  if (phase === "draft") {
    const isUserTurn = currentTurn === "user";
    const filteredPool = posFilter === "ALL" ? pool : pool.filter(p => p.position === posFilter);

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Draft Duel" />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 pb-20">

          {/* Pick order banner */}
          <div className="border-2 border-[#111827] mb-5" style={{ background: "#111827" }}>
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-1">
                  Pick {pickNum + 1} of 10
                </p>
                <p className="font-playfair font-black text-white" style={{ fontSize: "1.4rem" }}>
                  {isUserTurn ? (
                    <span style={{ color: "#84cc16" }}>{userName}&apos;s Turn — Make Your Pick</span>
                  ) : (
                    <span className="text-gray-300">
                      AI is picking…{aiMsg ? <span style={{ color: "#a78bfa" }}> {aiMsg}</span> : null}
                    </span>
                  )}
                </p>
              </div>
              {/* Snake order visual */}
              <div className="hidden sm:flex gap-1 items-center">
                {SNAKE_ORDER.map((turn, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 flex items-center justify-center border font-mono text-[9px] font-bold"
                    style={{
                      borderColor: i === pickNum ? "#84cc16" : i < pickNum ? "#374151" : "#374151",
                      background: i === pickNum ? "#84cc16" : i < pickNum ? "#1f2937" : "transparent",
                      color: i === pickNum ? "#111827" : i < pickNum ? "#6b7280" : turn === "user" ? "#84cc16" : "#a78bfa",
                    }}
                  >
                    {i < pickNum ? "✓" : turn === "user" ? "U" : "A"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0" style={{ border: "2px solid #111827" }}>

            {/* Left: pool (2/3 width) */}
            <div className="lg:col-span-2" style={{ borderRight: "2px solid #111827" }}>
              {/* Position filter */}
              <div className="flex" style={{ borderBottom: "2px solid #111827" }}>
                {["ALL", "PG", "SG", "SF", "PF", "C"].map((pos, i, arr) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className="px-4 py-2.5 font-mono font-bold text-[10px] uppercase tracking-widest transition-colors"
                    style={{
                      background: posFilter === pos ? "#111827" : "#f4f0e6",
                      color: posFilter === pos ? "#84cc16" : "#111827",
                      borderRight: i < arr.length - 1 ? "2px solid #111827" : undefined,
                      flex: 1,
                    }}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* Player grid */}
              <div
                className="p-3 grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  background: "#f4f0e6",
                  minHeight: 420,
                }}
              >
                <AnimatePresence>
                  {filteredPool.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.15 }}
                    >
                      <PlayerCard
                        player={p}
                        onClick={() => handleUserPick(p)}
                        disabled={!isUserTurn}
                        dim={!isUserTurn}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredPool.length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                      No {posFilter}s remaining
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: rosters (1/3 width) */}
            <div style={{ background: "#f4f0e6" }}>
              {/* Your roster */}
              <div style={{ borderBottom: "2px solid #111827" }}>
                <div className="px-4 py-3" style={{ background: "#84cc16", borderBottom: "2px solid #111827" }}>
                  <p className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] text-[#111827]">
                    {userName}&apos;s Picks ({userRoster.length}/5)
                  </p>
                </div>
                <div className="flex flex-col gap-0">
                  {POS_ORDER.map(pos => {
                    const pick = userRoster.find(p => p.position === pos);
                    return (
                      <div key={pos} style={{ borderBottom: "1px solid #d1cdc2" }}>
                        <RosterSlot player={pick} isEmpty={!pick} label={pos} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI roster */}
              <div>
                <div className="px-4 py-3" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                  <p className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] text-[#a78bfa]">
                    AI Picks ({aiRoster.length}/5)
                  </p>
                </div>
                <div className="flex flex-col gap-0">
                  {POS_ORDER.map(pos => {
                    const pick = aiRoster.find(p => p.position === pos);
                    return (
                      <div key={pos} style={{ borderBottom: "1px solid #d1cdc2" }}>
                        <RosterSlot player={pick} isEmpty={!pick} label={pos} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center font-mono text-xs text-gray-400 mt-4 uppercase tracking-widest">
            Pick 5 legends · You go first · Snake order: U A A U U A A U U A
          </p>
        </main>
      </div>
    );
  }

  // ── REVEAL PHASE ───────────────────────────────────────────────────────────
  if (phase === "reveal") {
    const userTotals = CATS.map(c => stat(userRoster, c.key));

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Draft Duel" />
        <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10 pb-20">

          <div className="border-2 border-[#111827] mb-6" style={{ background: "#111827" }}>
            <div className="px-8 py-6 text-center" style={{ borderBottom: "2px solid #84cc16" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#84cc16] mb-2">Draft Complete</p>
              <h2 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Your Squad Is Set.
              </h2>
            </div>
            <div className="px-8 py-6" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-3">{userName}&apos;s Roster</p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
                {POS_ORDER.map(pos => {
                  const p = userRoster.find(pl => pl.position === pos);
                  return (
                    <div key={pos} className="border-2 border-[#111827] overflow-hidden">
                      <div className="px-3 py-2" style={{ background: "#111827" }}>
                        <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: p ? TIER_COLOR[p.tier] : "#6b7280" }}>
                          {pos}
                        </p>
                        <p className="font-playfair font-black text-white leading-tight text-sm">
                          {p?.name ?? "—"}
                        </p>
                      </div>
                      <div className="px-3 py-2" style={{ background: "#f4f0e6" }}>
                        {p ? CATS.map(c => (
                          <div key={c.key} className="flex justify-between">
                            <span className="font-mono text-[9px] text-gray-400 uppercase">{c.label}</span>
                            <span className="font-playfair font-black text-[10px] text-[#111827]">{p[c.key].toFixed(1)}</span>
                          </div>
                        )) : <p className="font-mono text-[9px] text-gray-300 uppercase">no pick</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Team totals */}
              <div className="border-2 border-[#111827] mb-6">
                <div className="px-4 py-3" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#84cc16]">Team Totals</p>
                </div>
                <div className="grid grid-cols-5">
                  {CATS.map((c, i) => (
                    <div
                      key={c.key}
                      className="px-4 py-4 text-center"
                      style={{ borderRight: i < 4 ? "2px solid #111827" : undefined }}
                    >
                      <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mb-1">{c.full}</p>
                      <p className="font-playfair font-black" style={{ fontSize: "2rem", color: "#84cc16", lineHeight: 1 }}>
                        {userTotals[i].toFixed(1)}
                      </p>
                      <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-1">{c.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bracket preview */}
              <div className="border-2 border-[#111827] mb-6">
                <div className="px-4 py-3" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#84cc16]">Your Path to Glory</p>
                </div>
                <div className="grid grid-cols-3">
                  {BRACKET_OPPONENTS.map((opp, i) => (
                    <div
                      key={opp.id}
                      className="px-5 py-4 text-center"
                      style={{ borderRight: i < 2 ? "2px solid #111827" : undefined }}
                    >
                      <p className="font-mono text-[8px] uppercase tracking-widest text-gray-400 mb-1">
                        {opp.subtitle}
                      </p>
                      <p className="font-playfair font-black text-[#111827] leading-tight" style={{ fontSize: "1.05rem" }}>
                        {opp.name}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest font-bold border"
                        style={{ borderColor: DIFF_COLOR[opp.difficulty], color: DIFF_COLOR[opp.difficulty] }}
                      >
                        {opp.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={handleStartTournament}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-5 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827]"
                style={{ background: "#84cc16", color: "#111827" }}
              >
                Enter the Tournament →
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── MATCHUP PHASE ──────────────────────────────────────────────────────────
  if (phase === "matchup") {
    const userWins = catResults.filter(r => r === "user").length;
    const oppWins = catResults.filter(r => r === "opp").length;
    const done = revealedCats >= CATS.length;

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Draft Duel" />
        <main className="max-w-5xl mx-auto px-6 sm:px-10 py-8 pb-20">

          {/* Match header */}
          <div className="border-2 border-[#111827] mb-6" style={{ background: "#111827" }}>
            <div className="px-8 py-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-0.5">
                  {opponent.subtitle} · {opponent.difficulty.toUpperCase()}
                </p>
                <p className="font-playfair font-black text-white" style={{ fontSize: "1.5rem" }}>
                  {userName} vs <span style={{ color: DIFF_COLOR[opponent.difficulty] }}>{opponent.name}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1">Score</p>
                <p className="font-playfair font-black" style={{ fontSize: "2.2rem", lineHeight: 1, color: "#84cc16" }}>
                  {userWins} – {oppWins}
                </p>
              </div>
            </div>
          </div>

          {/* Category battle */}
          <div className="border-2 border-[#111827] mb-6" style={{ background: "#fff" }}>
            {/* Column headers */}
            <div className="grid grid-cols-3" style={{ borderBottom: "2px solid #111827" }}>
              <div className="px-5 py-3" style={{ background: "#84cc16" }}>
                <p className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] text-[#111827] truncate">
                  {userName}
                </p>
              </div>
              <div className="px-5 py-3 text-center" style={{ background: "#111827", borderLeft: "2px solid #111827", borderRight: "2px solid #111827" }}>
                <p className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] text-gray-400">Category</p>
              </div>
              <div className="px-5 py-3 text-right" style={{ background: DIFF_COLOR[opponent.difficulty] }}>
                <p className="font-mono font-bold text-[10px] uppercase tracking-[0.25em] text-[#111827] truncate">
                  {opponent.name}
                </p>
              </div>
            </div>

            {CATS.map((cat, i) => {
              const revealed = i < revealedCats;
              const uTotal = stat(userRoster, cat.key);
              const oTotal = stat(opponent.players, cat.key);
              const result = catResults[i];

              return (
                <div
                  key={cat.key}
                  className="grid grid-cols-3"
                  style={{ borderBottom: i < CATS.length - 1 ? "2px solid #111827" : undefined }}
                >
                  {/* User side */}
                  <div
                    className="px-5 py-5 flex items-center"
                    style={{
                      background: revealed && result === "user" ? "rgba(132,204,22,0.12)" : "#fff",
                      transition: "background 0.4s",
                    }}
                  >
                    <AnimatePresence>
                      {revealed ? (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 22 }}
                          className="flex items-center gap-2"
                        >
                          {result === "user" && (
                            <span className="font-mono text-[#84cc16] font-bold text-sm">✓</span>
                          )}
                          <span
                            className="font-playfair font-black tabular-nums"
                            style={{
                              fontSize: "2rem",
                              lineHeight: 1,
                              color: result === "user" ? "#84cc16" : result === "tie" ? "#f59e0b" : "#9ca3af",
                            }}
                          >
                            {uTotal.toFixed(1)}
                          </span>
                        </motion.div>
                      ) : (
                        <span className="font-playfair font-black text-gray-300" style={{ fontSize: "2rem", lineHeight: 1 }}>—</span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Category label */}
                  <div
                    className="px-5 py-5 flex flex-col items-center justify-center text-center"
                    style={{ background: "#f4f0e6", borderLeft: "2px solid #111827", borderRight: "2px solid #111827" }}
                  >
                    <p className="font-mono font-bold uppercase tracking-widest text-[#111827] text-xs">{cat.label}</p>
                    <p className="font-mono text-[8px] text-gray-400 uppercase tracking-widest">{cat.full}</p>
                    {revealed && result === "tie" && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="font-mono text-[9px] font-bold mt-1"
                        style={{ color: "#f59e0b" }}
                      >
                        TIE
                      </motion.span>
                    )}
                  </div>

                  {/* Opponent side */}
                  <div
                    className="px-5 py-5 flex items-center justify-end"
                    style={{
                      background: revealed && result === "opp" ? "rgba(239,68,68,0.08)" : "#fff",
                      transition: "background 0.4s",
                    }}
                  >
                    <AnimatePresence>
                      {revealed ? (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 22 }}
                          className="flex items-center gap-2"
                        >
                          <span
                            className="font-playfair font-black tabular-nums"
                            style={{
                              fontSize: "2rem",
                              lineHeight: 1,
                              color: result === "opp" ? "#ef4444" : result === "tie" ? "#f59e0b" : "#9ca3af",
                            }}
                          >
                            {oTotal.toFixed(1)}
                          </span>
                          {result === "opp" && (
                            <span className="font-mono text-red-500 font-bold text-sm">✓</span>
                          )}
                        </motion.div>
                      ) : (
                        <span className="font-playfair font-black text-gray-300" style={{ fontSize: "2rem", lineHeight: 1 }}>—</span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Result CTA */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-[#111827]"
                style={{ background: "#111827" }}
              >
                <div className="px-8 py-6 text-center" style={{ borderBottom: "2px solid #84cc16" }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.35em] mb-2" style={{ color: userWins >= 3 ? "#84cc16" : "#ef4444" }}>
                    {userWins >= 3 ? "Victory" : "Eliminated"}
                  </p>
                  <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2rem,5vw,3rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {userWins >= 3
                      ? `${userWins}–${oppWins} — You advance!`
                      : `${userWins}–${oppWins} — Sent packing.`}
                  </h2>
                </div>
                <div className="px-8 py-6" style={{ background: "#f4f0e6" }}>
                  <motion.button
                    onClick={handleMatchupContinue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827]"
                    style={{
                      background: userWins >= 3 ? "#84cc16" : "#111827",
                      color: userWins >= 3 ? "#111827" : "#84cc16",
                    }}
                  >
                    {userWins >= 3 ? (roundIdx >= 2 ? "Claim the Trophy →" : "Continue →") : "See Results →"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // ── BETWEEN ROUNDS ─────────────────────────────────────────────────────────
  if (phase === "between") {
    const nextOpp = BRACKET_OPPONENTS[roundIdx + 1];

    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Draft Duel" />
        <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10 pb-20">

          <div className="border-2 border-[#111827] mb-6" style={{ background: "#111827" }}>
            <div className="px-8 py-6" style={{ borderBottom: "2px solid #84cc16" }}>
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-[#84cc16] mb-2">Round Complete</p>
              <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2rem,5vw,3rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                Next Up: {nextOpp?.name}
              </h2>
              <p className="font-mono text-gray-400 text-xs mt-2 uppercase tracking-widest">
                {nextOpp?.subtitle} · {nextOpp?.difficulty}
              </p>
            </div>
            <div className="px-8 py-6" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-sm text-[#111827] mb-5">
                <span className="font-bold">Waiver Wire:</span> Optionally swap one player from your roster
                for someone from the undrafted pool.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-2 border-[#111827] mb-5">
                {/* Your roster */}
                <div style={{ borderRight: "2px solid #111827" }}>
                  <div className="px-4 py-2" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#84cc16]">
                      Your Roster {waiverDropId ? "— select a player to drop" : "— click to drop"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0">
                    {userRoster.map((p, i) => (
                      <div key={p.id} style={{ borderBottom: i < userRoster.length - 1 ? "1px solid #d1cdc2" : undefined }}>
                        <RosterSlot
                          player={p}
                          label={p.position}
                          highlight={waiverDropId === p.id}
                          onClick={() => setWaiverDropId(prev => prev === p.id ? null : p.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Undrafted pool */}
                <div>
                  <div className="px-4 py-2" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400">
                      Undrafted Pool {waiverDropId ? "— click to add" : "— drop a player first"}
                    </p>
                  </div>
                  <div
                    className="p-2 grid gap-1.5 overflow-y-auto"
                    style={{ maxHeight: 320, gridTemplateColumns: "1fr", background: "#f4f0e6" }}
                  >
                    {undrafted.length === 0 ? (
                      <p className="font-mono text-xs text-gray-400 text-center py-8 uppercase tracking-widest">No undrafted players</p>
                    ) : (
                      undrafted.sort((a, b) => a.tier - b.tier).map(p => (
                        <PlayerCard
                          key={p.id}
                          player={p}
                          onClick={() => waiverDropId ? handleWaiverAdd(p) : undefined}
                          dim={!waiverDropId}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleNextRound}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827]"
                style={{ background: "#84cc16", color: "#111827" }}
              >
                {nextOpp?.subtitle}: Face {nextOpp?.name} →
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── ELIMINATED ─────────────────────────────────────────────────────────────
  if (phase === "eliminated") {
    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Draft Duel" />
        <main className="max-w-2xl mx-auto px-6 py-20 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-[#111827]"
            style={{ background: "#111827" }}
          >
            <div className="px-8 py-10 text-center" style={{ borderBottom: "2px solid #ef4444" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-red-400 mb-3">Eliminated</p>
              <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem,8vw,4rem)", letterSpacing: "-0.03em", lineHeight: 0.9 }}>
                Season<br />Over.
              </h2>
              <p className="font-mono text-gray-400 text-xs mt-4 uppercase tracking-widest">
                Fell in the {opponent.subtitle}
              </p>
            </div>
            <div className="px-8 py-8 text-center" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-sm text-gray-500 mb-6">
                You were no match for <strong className="text-[#111827]">{opponent.name}</strong>.
                Better picks, better chance.
              </p>
              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827]"
                style={{ background: "#84cc16", color: "#111827" }}
              >
                Draft Again
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── CHAMPION ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Draft Duel" />
      <main className="max-w-2xl mx-auto px-6 py-20 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="border-2 border-[#111827]"
          style={{ background: "#111827" }}
        >
          <div className="px-8 py-10 text-center" style={{ borderBottom: "2px solid #84cc16" }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#84cc16] mb-3"
            >
              Draft Duel Champion
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 280, damping: 22 }}
              className="font-playfair font-black italic text-white"
              style={{ fontSize: "clamp(3rem,10vw,5rem)", letterSpacing: "-0.03em", lineHeight: 0.9 }}
            >
              {userName}<br />
              <span style={{ color: "#84cc16" }}>Wins.</span>
            </motion.h2>
          </div>
          <div className="px-8 py-8" style={{ background: "#f4f0e6" }}>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest text-center mb-4">Your championship roster</p>
            <div className="grid grid-cols-5 gap-1 mb-8">
              {POS_ORDER.map(pos => {
                const p = userRoster.find(pl => pl.position === pos);
                return (
                  <div key={pos} className="border-2 border-[#111827] text-center overflow-hidden">
                    <div className="py-2 px-1" style={{ background: "#111827" }}>
                      <p className="font-mono text-[7px] uppercase tracking-widest" style={{ color: p ? TIER_COLOR[p.tier] : "#6b7280" }}>{pos}</p>
                      <p className="font-playfair font-black text-white leading-tight" style={{ fontSize: "0.65rem" }}>
                        {p?.name.split(" ").pop() ?? "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center">
              <motion.button
                onClick={handleRestart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827]"
                style={{ background: "#84cc16", color: "#111827" }}
              >
                Draft Again
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
