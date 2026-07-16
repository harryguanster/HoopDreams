"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PLAYERS, BADGES, ACTIONS, dealHands, getEffectiveRate,
  type BCPlayer, type ActionId, type BadgeId,
} from "@/lib/badgeCourtData";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Phase = "menu" | "draft" | "game" | "end";
type Turn = "user" | "ai";

interface PlayResult {
  player: BCPlayer;
  action: ActionId;
  made: boolean;
  pts: number;
  activeBadges: BadgeId[];
  isOnFire: boolean;
}

interface LogEntry {
  id: number;
  turn: Turn;
  text: string;
  pts: number;
  badgeFlash?: string;
  made: boolean;
}

interface GameState {
  quarter: number;
  qUserPlays: number;
  qAiPlays: number;
  userScore: number;
  aiScore: number;
  momentum: number; // -5 to +5 (positive = user leading momentum)
  streak: number;   // consecutive makes
  onFirePlayer: string | null;
  turn: Turn;
  logId: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PLAYS_PER_TEAM_PER_Q = 5;
const QUARTERS = 4;

function badgeName(id: BadgeId) { return BADGES[id].name; }

function buildPlayText(p: BCPlayer, actionId: ActionId, made: boolean, activeBadges: BadgeId[], isOnFire: boolean): string {
  const action = ACTIONS[actionId];
  const badgePart = activeBadges.length > 0 ? ` [${activeBadges.map(badgeName).join(" + ")}]` : "";
  const firePart = isOnFire ? " 🔥" : "";
  if (made) {
    const excl = Math.random() > 0.5 ? "!" : ".";
    const flavor = [
      `${p.short} connects on the ${action.label}${badgePart} — ${action.pts} pts${firePart}`,
      `${p.short} buries the ${action.label}${badgePart}${firePart} — ${action.pts}!`,
      `${action.label} drops for ${p.short}${badgePart} — ${action.pts} pts${firePart}`,
    ];
    return flavor[Math.floor(Math.random() * flavor.length)] + excl;
  } else {
    const miss = [
      `${p.short} misses the ${action.label}${badgePart}.`,
      `${action.label} off the rim for ${p.short}.`,
      `No good — ${p.short}'s ${action.label}${badgePart} rattles out.`,
    ];
    return miss[Math.floor(Math.random() * miss.length)];
  }
}

function aiPickAction(player: BCPlayer): ActionId {
  // Weight preferred actions more heavily
  const pool: ActionId[] = [];
  player.actions.forEach((a, i) => {
    const weight = Math.max(5 - i, 1);
    for (let w = 0; w < weight; w++) pool.push(a);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function runPlay(player: BCPlayer, actionId: ActionId, momentum: number, streak: number): PlayResult {
  const action = ACTIONS[actionId];
  const activeBadges = (Object.keys(action.badgeBoosts) as BadgeId[]).filter(b =>
    player.badges.includes(b) && (action.badgeBoosts[b] ?? 0) > 0
  );
  const isOnFire = streak >= 3;
  const fireBoost = isOnFire ? 0.12 : 0;
  let rate = getEffectiveRate(action, player.badges) + fireBoost;
  // momentum swings ±8%
  const momFactor = momentum * 0.016;
  rate = Math.min(Math.max(rate + momFactor, 0.1), 0.94);
  const made = Math.random() < rate;
  return { player, action: actionId, made, pts: made ? action.pts : 0, activeBadges, isOnFire };
}

// ─── Components ────────────────────────────────────────────────────────────────

function BadgePill({ id, glow }: { id: BadgeId; glow?: boolean }) {
  const b = BADGES[id];
  return (
    <motion.span
      className="inline-block text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border"
      style={{
        borderColor: b.color,
        color: b.color,
        background: glow ? `${b.color}22` : "transparent",
        boxShadow: glow ? `0 0 12px ${b.color}88` : "none",
      }}
      animate={glow ? { boxShadow: [`0 0 8px ${b.color}66`, `0 0 20px ${b.color}cc`, `0 0 8px ${b.color}66`] } : {}}
      transition={{ duration: 0.6, repeat: glow ? 2 : 0 }}
    >
      {b.name}
    </motion.span>
  );
}

function PlayerCard({
  player,
  selected,
  onSelect,
  disabled,
  glowBadges,
  small,
}: {
  player: BCPlayer;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  glowBadges?: BadgeId[];
  small?: boolean;
}) {
  return (
    <motion.div
      onClick={disabled ? undefined : onSelect}
      className="relative flex flex-col gap-1 select-none"
      style={{
        cursor: disabled ? "default" : "pointer",
        border: selected ? `2px solid ${player.color}` : "2px solid rgba(255,255,255,0.08)",
        background: "#0d1526",
        padding: small ? "10px 12px" : "14px 16px",
        borderRadius: 8,
        boxShadow: selected ? `0 0 24px ${player.color}55` : "none",
        minWidth: small ? 120 : 150,
        opacity: disabled && !selected ? 0.5 : 1,
      }}
      whileHover={!disabled ? { scale: 1.03, boxShadow: `0 0 20px ${player.color}44` } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
    >
      {/* Color bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: player.color, borderRadius: "6px 6px 0 0" }} />
      <p className="font-mono font-bold text-white" style={{ fontSize: small ? "10px" : "12px", marginTop: 2 }}>{player.short}</p>
      <p className="font-mono text-white/40" style={{ fontSize: "9px" }}>{player.era}</p>
      <div className="flex flex-wrap gap-1 mt-1">
        {player.badges.map(b => (
          <BadgePill key={b} id={b} glow={glowBadges?.includes(b)} />
        ))}
      </div>
      <div className="mt-1 flex items-center gap-1">
        <span className="font-mono text-white/30" style={{ fontSize: "9px" }}>OVR</span>
        <span className="font-mono font-bold" style={{ fontSize: "11px", color: player.color }}>{player.overall}</span>
      </div>
    </motion.div>
  );
}

function MomentumBar({ value }: { value: number }) {
  // value -5 to +5
  const pct = ((value + 5) / 10) * 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-mono text-white/40 text-[9px] uppercase tracking-widest">Momentum</p>
      <div className="relative w-48 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: "50%",
            background: value >= 0 ? "#84cc16" : "#ef4444",
            transformOrigin: value >= 0 ? "left" : "right",
          }}
          animate={{ width: `${Math.abs(pct - 50)}%`, left: value >= 0 ? "50%" : `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30" />
      </div>
      <p className="font-mono text-[9px]" style={{ color: value >= 0 ? "#84cc16" : "#ef4444" }}>
        {value > 0 ? `+${value} Your side` : value < 0 ? `${value} AI side` : "Neutral"}
      </p>
    </div>
  );
}

function ScoreBoard({ userScore, aiScore, quarter, turn }: { userScore: number; aiScore: number; quarter: number; turn: Turn }) {
  return (
    <div className="flex items-center justify-center gap-8">
      <div className="text-center">
        <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-0.5">You</p>
        <motion.p
          key={userScore}
          className="font-playfair font-black text-white"
          style={{ fontSize: "2.8rem", lineHeight: 1 }}
          animate={{ scale: [1.15, 1] }}
          transition={{ duration: 0.3 }}
        >
          {userScore}
        </motion.p>
      </div>
      <div className="text-center">
        <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">Q{quarter}</p>
        <p className="font-mono font-bold text-white/40" style={{ fontSize: "1.1rem" }}>—</p>
        <p className="font-mono text-[9px] mt-1" style={{ color: turn === "user" ? "#84cc16" : "#f59e0b" }}>
          {turn === "user" ? "Your turn" : "AI turn"}
        </p>
      </div>
      <div className="text-center">
        <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest mb-0.5">AI</p>
        <motion.p
          key={aiScore}
          className="font-playfair font-black text-white"
          style={{ fontSize: "2.8rem", lineHeight: 1 }}
          animate={{ scale: [1.15, 1] }}
          transition={{ duration: 0.3 }}
        >
          {aiScore}
        </motion.p>
      </div>
    </div>
  );
}

function PlayLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);
  return (
    <div ref={ref} className="overflow-y-auto space-y-1" style={{ maxHeight: 180 }}>
      <AnimatePresence initial={false}>
        {entries.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: e.turn === "user" ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[10px] leading-snug px-2 py-1 rounded"
            style={{
              background: e.turn === "user" ? "rgba(132,204,22,0.07)" : "rgba(245,158,11,0.07)",
              color: e.made
                ? (e.turn === "user" ? "#84cc16" : "#f59e0b")
                : "rgba(255,255,255,0.3)",
            }}
          >
            {e.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BadgeCourtPage() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [userHand, setUserHand] = useState<BCPlayer[]>([]);
  const [aiHand, setAiHand] = useState<BCPlayer[]>([]);

  // Game state
  const gs = useRef<GameState>({
    quarter: 1, qUserPlays: 0, qAiPlays: 0,
    userScore: 0, aiScore: 0, momentum: 0,
    streak: 0, onFirePlayer: null, turn: "user", logId: 0,
  });

  const [display, setDisplay] = useState({
    userScore: 0, aiScore: 0, quarter: 1, momentum: 0, turn: "user" as Turn,
    onFirePlayer: null as string | null,
  });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<BCPlayer | null>(null);
  const [lastResult, setLastResult] = useState<PlayResult | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionId | null>(null);

  const syncDisplay = useCallback(() => {
    const g = gs.current;
    setDisplay({ userScore: g.userScore, aiScore: g.aiScore, quarter: g.quarter, momentum: g.momentum, turn: g.turn, onFirePlayer: g.onFirePlayer });
  }, []);

  function startGame() {
    const { user, ai } = dealHands(PLAYERS, 5);
    setUserHand(user);
    setAiHand(ai);
    gs.current = { quarter: 1, qUserPlays: 0, qAiPlays: 0, userScore: 0, aiScore: 0, momentum: 0, streak: 0, onFirePlayer: null, turn: "user", logId: 0 };
    setLog([]);
    setSelectedPlayer(null);
    setLastResult(null);
    setAiThinking(false);
    setPendingAction(null);
    syncDisplay();
    setPhase("game");
  }

  function pushLog(entry: Omit<LogEntry, "id">) {
    const g = gs.current;
    const id = ++g.logId;
    setLog(prev => [...prev.slice(-30), { ...entry, id }]);
  }

  function advanceTurn() {
    const g = gs.current;
    const totalPlaysPerQ = PLAYS_PER_TEAM_PER_Q * 2;
    const totalQ = g.qUserPlays + g.qAiPlays;

    // Switch turn
    if (g.turn === "user") {
      g.turn = "ai";
    } else {
      g.turn = "user";
    }

    // Quarter boundary
    if (totalQ >= totalPlaysPerQ) {
      if (g.quarter >= QUARTERS) {
        gs.current = g;
        syncDisplay();
        setPhase("end");
        return;
      }
      g.quarter++;
      g.qUserPlays = 0;
      g.qAiPlays = 0;
      const qMsg = g.quarter <= QUARTERS ? `── Q${g.quarter} starts ──` : "";
      if (qMsg) pushLog({ turn: "user", text: qMsg, pts: 0, made: true });
    }

    gs.current = g;
    syncDisplay();

    if (g.turn === "ai") {
      triggerAiPlay();
    }
  }

  function applyResult(result: PlayResult, isUser: boolean) {
    const g = gs.current;
    if (isUser) {
      g.userScore += result.pts;
      g.qUserPlays++;
      if (result.made) {
        g.streak++;
        g.momentum = Math.min(g.momentum + 1, 5);
        if (g.streak >= 3) g.onFirePlayer = result.player.name;
      } else {
        g.streak = 0;
        g.onFirePlayer = null;
        g.momentum = Math.max(g.momentum - 1, -5);
      }
    } else {
      g.aiScore += result.pts;
      g.qAiPlays++;
      if (result.made) {
        g.momentum = Math.max(g.momentum - 1, -5);
      } else {
        g.momentum = Math.min(g.momentum + 1, 5);
      }
    }
    gs.current = g;
    setLastResult(result);
    pushLog({
      turn: isUser ? "user" : "ai",
      text: buildPlayText(result.player, result.action, result.made, result.activeBadges, result.isOnFire),
      pts: result.pts,
      made: result.made,
      badgeFlash: result.activeBadges[0],
    });
    syncDisplay();
  }

  function handleUserAction(actionId: ActionId) {
    if (!selectedPlayer || gs.current.turn !== "user") return;
    setPendingAction(actionId);
    const result = runPlay(selectedPlayer, actionId, gs.current.momentum, gs.current.streak);
    applyResult(result, true);
    setSelectedPlayer(null);
    setPendingAction(null);
    setTimeout(() => advanceTurn(), 800);
  }

  function triggerAiPlay() {
    setAiThinking(true);
    setTimeout(() => {
      const g = gs.current;
      const aiPlayer = aiHand[Math.floor(Math.random() * aiHand.length)];
      const actionId = aiPickAction(aiPlayer);
      const result = runPlay(aiPlayer, actionId, -g.momentum, 0); // AI sees reversed momentum
      applyResult(result, false);
      setAiThinking(false);
      setTimeout(() => advanceTurn(), 800);
    }, 1200);
  }

  const isUserTurn = display.turn === "user" && !aiThinking;
  const userPlaysDone = gs.current.qUserPlays >= PLAYS_PER_TEAM_PER_Q;

  // ── Menu ──
  if (phase === "menu") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: "#0a0f1a" }}>
        <div className="w-full max-w-2xl">
          <a href="/games" className="font-mono text-white/30 text-xs hover:text-white/60 transition-colors mb-12 block">← Back to Games</a>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#84cc16] mb-4">Badge Court</p>
            <h1 className="font-playfair font-black text-white italic mb-6" style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 0.95, letterSpacing: "-0.03em" }}>
              Basketball<br />Card Battle.
            </h1>
            <p className="font-mono text-white/50 text-sm leading-relaxed mb-10 max-w-lg">
              You get 5 all-time legends. So does the AI. Pick your player, call your play, watch badges activate. Four quarters. Best score wins.
            </p>

            {/* Badge preview */}
            <div className="mb-10 p-5 border border-white/10 rounded-lg" style={{ background: "#0d1526" }}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-3">How Badges Work</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <BadgePill id="limitless_range" />
                <BadgePill id="clutch_gene" />
                <BadgePill id="dream_shake" />
                <BadgePill id="floor_general" />
              </div>
              <p className="font-mono text-white/30 text-[10px]">Each player carries 2 badges that boost specific plays. Pick the right action for your player's badges to maximize your shot percentage.</p>
            </div>

            <motion.button
              onClick={startGame}
              className="w-full py-5 font-mono font-bold uppercase tracking-[0.25em] text-[#111827]"
              style={{ background: "#84cc16", fontSize: "14px" }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(132,204,22,0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              Deal Cards →
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── End Screen ──
  if (phase === "end") {
    const userWon = display.userScore > display.aiScore;
    const tied = display.userScore === display.aiScore;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#0a0f1a" }}>
        <motion.div
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] mb-6" style={{ color: userWon ? "#84cc16" : tied ? "#f59e0b" : "#ef4444" }}>
            {tied ? "Tie Game" : userWon ? "Victory" : "Defeat"}
          </p>
          <h1 className="font-playfair font-black text-white italic mb-8" style={{ fontSize: "clamp(3rem, 10vw, 5.5rem)", lineHeight: 0.95 }}>
            {tied ? "All Square." : userWon ? "You Win." : "AI Wins."}
          </h1>
          <div className="flex items-center justify-center gap-10 mb-12">
            <div>
              <p className="font-mono text-white/40 text-[9px] uppercase tracking-widest mb-1">You</p>
              <p className="font-playfair font-black text-white" style={{ fontSize: "4rem", lineHeight: 1 }}>{display.userScore}</p>
            </div>
            <p className="font-mono text-white/20 text-2xl">–</p>
            <div>
              <p className="font-mono text-white/40 text-[9px] uppercase tracking-widest mb-1">AI</p>
              <p className="font-playfair font-black text-white" style={{ fontSize: "4rem", lineHeight: 1 }}>{display.aiScore}</p>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={startGame}
              className="px-8 py-3 font-mono font-bold uppercase tracking-[0.2em] text-sm text-[#111827]"
              style={{ background: "#84cc16" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Play Again
            </motion.button>
            <a href="/games">
              <motion.button
                className="px-8 py-3 font-mono font-bold uppercase tracking-[0.2em] text-sm text-white/60 border border-white/20"
                whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.4)" }}
                whileTap={{ scale: 0.96 }}
              >
                Games
              </motion.button>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Game Screen ──
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0f1a" }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <a href="/games" className="font-mono text-white/30 text-xs hover:text-white/60 transition-colors">← Games</a>
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#84cc16]">Badge Court</p>
        <div style={{ width: 60 }} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Scoreboard + Momentum */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-white/8 rounded-lg" style={{ background: "#0d1526" }}>
          <ScoreBoard userScore={display.userScore} aiScore={display.aiScore} quarter={display.quarter} turn={display.turn} />
          <MomentumBar value={display.momentum} />
          {display.onFirePlayer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-xs font-bold uppercase tracking-widest"
              style={{ color: "#f97316" }}
            >
              {display.onFirePlayer} is ON FIRE
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

          {/* Left: Your roster */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#84cc16]">Your Roster</p>
            <div className="flex flex-col gap-2">
              {userHand.map(p => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  selected={selectedPlayer?.id === p.id}
                  onSelect={() => isUserTurn && !userPlaysDone ? setSelectedPlayer(p) : undefined}
                  disabled={!isUserTurn || userPlaysDone}
                  glowBadges={lastResult?.player.id === p.id && lastResult.made ? lastResult.activeBadges : undefined}
                  small
                />
              ))}
            </div>
          </div>

          {/* Center: Action picker + Log */}
          <div className="flex flex-col gap-4">

            {/* Action picker */}
            <div className="border border-white/8 rounded-lg p-4" style={{ background: "#0d1526" }}>
              {selectedPlayer ? (
                <>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/40 mb-3">
                    {selectedPlayer.name} — Pick a Play
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlayer.actions.map(aId => {
                      const action = ACTIONS[aId];
                      const hasBadgeBoost = selectedPlayer.badges.some(b => (action.badgeBoosts[b] ?? 0) > 0);
                      const eff = getEffectiveRate(action, selectedPlayer.badges);
                      return (
                        <motion.button
                          key={aId}
                          onClick={() => handleUserAction(aId)}
                          disabled={pendingAction !== null}
                          className="flex flex-col items-start p-2.5 text-left border rounded"
                          style={{
                            borderColor: hasBadgeBoost ? selectedPlayer.color : "rgba(255,255,255,0.1)",
                            background: hasBadgeBoost ? `${selectedPlayer.color}11` : "transparent",
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <p className="font-mono font-bold text-white text-[10px]">{action.label}</p>
                          <p className="font-mono text-[8px] text-white/30 mt-0.5">{action.pts} pts · {Math.round(eff * 100)}%</p>
                          {hasBadgeBoost && (
                            <p className="font-mono text-[8px] mt-1" style={{ color: selectedPlayer.color }}>Badge active</p>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  {aiThinking ? (
                    <motion.p
                      className="font-mono text-[10px] text-[#f59e0b] uppercase tracking-widest"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      AI is running a play…
                    </motion.p>
                  ) : userPlaysDone ? (
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Waiting for AI…</p>
                  ) : (
                    <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">← Select a player</p>
                  )}
                </div>
              )}
            </div>

            {/* Play-by-play */}
            <div className="border border-white/8 rounded-lg p-4 flex-1" style={{ background: "#0d1526" }}>
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-3">Play-by-Play</p>
              <PlayLog entries={log} />
              {log.length === 0 && (
                <p className="font-mono text-[9px] text-white/20 text-center py-8">Game hasn&apos;t started yet. Pick a player to begin.</p>
              )}
            </div>
          </div>

          {/* Right: AI roster */}
          <div className="flex flex-col gap-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b]">AI Roster</p>
            <div className="flex flex-col gap-2">
              {aiHand.map(p => (
                <PlayerCard key={p.id} player={p} disabled small glowBadges={lastResult?.player.id === p.id && lastResult.made && display.turn === "user" ? lastResult.activeBadges : undefined} />
              ))}
            </div>
          </div>
        </div>

        {/* Quarter progress */}
        <div className="flex items-center gap-4 justify-center">
          {Array.from({ length: QUARTERS }, (_, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="w-8 h-1 rounded-full"
                style={{ background: i + 1 < display.quarter ? "#84cc16" : i + 1 === display.quarter ? "rgba(132,204,22,0.5)" : "rgba(255,255,255,0.1)" }}
              />
              <p className="font-mono text-[8px] text-white/30">Q{i + 1}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
