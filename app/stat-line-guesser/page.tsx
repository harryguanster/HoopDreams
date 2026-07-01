"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { STAT_LINE_PLAYERS, type StatLinePlayer } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";
import { ALL_PLAYER_NAMES, CURRENT_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";
import GameHeader from "@/app/components/GameHeader";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

type Era = "alltime" | "current";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GameState = "playing" | "correct" | "wrong";

const REVEAL_STEPS = [
  { label: "Points Per Game", key: "ppg" },
  { label: "Rebounds Per Game", key: "rpg" },
  { label: "Assists Per Game", key: "apg" },
  { label: "Position & Era", key: "meta" },
  { label: "Team", key: "team" },
];

const SL_CONFETTI_COLORS = ["#84cc16","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#a3e635"];

function SLConfetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    color: SL_CONFETTI_COLORS[i % SL_CONFETTI_COLORS.length],
    delay: Math.random() * 0.35,
    duration: 1.1 + Math.random() * 0.7,
    rotate: Math.random() * 720,
    size: 7 + Math.random() * 8,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm top-0"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function EraTab({ era, setEra }: { era: Era; setEra: (e: Era) => void }) {
  return (
    <div className="sticky top-[52px] z-30" style={{ background: "#f4f0e6", borderBottom: "2px solid #111827" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-0 py-0">
        {(["alltime", "current"] as const).map((e, i) => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className="px-6 py-3 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
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
    </div>
  );
}

// Inner game — fully remounts when era changes via key prop
function StatLineCore({ era }: { era: Era }) {
  const players = era === "current" ? CURRENT_STAT_LINE_PLAYERS : STAT_LINE_PLAYERS;
  const playerNames = era === "current" ? CURRENT_PLAYER_NAMES : ALL_PLAYER_NAMES;

  const [mounted, setMounted] = useState(false);
  const [shuffled, setShuffled] = useState<StatLinePlayer[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [wrongGuess, setWrongGuess] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    setShuffled(shuffleArray(players));
    setMounted(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted || shuffled.length === 0) {
    return <div className="flex-1" />;
  }

  const player: StatLinePlayer = shuffled[playerIndex];
  const stepsRevealed = revealStep + 1;
  const allRevealed = revealStep === 4;

  const checkGuess = () => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;
    const correct = player.aliases.some(a => a.toLowerCase() === trimmed) ||
      player.name.toLowerCase() === trimmed;
    if (correct) {
      setGameState("correct");
    } else {
      setWrongGuess(guess.trim());
      setShakeKey(k => k + 1);
      if (allRevealed) {
        setGameState("wrong");
      } else {
        setRevealStep(s => Math.min(s + 1, 4));
        setGuess("");
      }
    }
  };

  const handleNext = () => {
    setPlayerIndex(i => (i + 1) % shuffled.length);
    setRevealStep(0);
    setGuess("");
    setGameState("playing");
    setWrongGuess("");
  };

  if (gameState === "correct" || gameState === "wrong") {
    const starCount = 5 - revealStep;
    const won = gameState === "correct";
    return (
      <div className="flex-1 relative overflow-hidden" style={{ background: "#f4f0e6" }}>
        {won && <SLConfetti />}
        <main className="flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto w-full min-h-full">
          <motion.div
            className="w-full"
            style={{
              background: won ? "#f4f0e6" : "#111827",
              border: "2px solid #111827",
            }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            {/* Dark/light header */}
            <div className="px-7 pt-7 pb-5 text-center" style={{ borderBottom: "2px solid #111827", background: won ? "#111827" : "#f4f0e6" }}>
              <motion.div
                className="text-5xl mb-3"
                initial={{ scale: 0.3, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
              >
                {won ? "🎯" : "😬"}
              </motion.div>
              <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-2">
                {won ? "Correct" : "Wrong Answer"}
              </p>
              <h2 className="font-playfair font-black italic mb-0" style={{
                fontSize: "clamp(2.5rem, 6vw, 3.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 0.92,
                color: won ? "#ffffff" : "#111827",
              }}>
                {won ? "Got it!" : "Nice try."}
              </h2>
            </div>

            {/* Content area */}
            <div className="p-6" style={{ background: won ? "#f4f0e6" : "#111827" }}>
              {won ? (
                <>
                  <p className="font-mono text-xs text-center mb-4 text-gray-500">
                    Got it after {stepsRevealed} clue{stepsRevealed !== 1 ? "s" : ""}!
                  </p>
                  <div className="flex justify-center gap-1 text-2xl mb-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: i < starCount ? 1 : 0.5 }}
                        transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 400 }}
                        style={{ filter: i < starCount ? "none" : "grayscale(1)", opacity: i < starCount ? 1 : 0.3 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="font-mono text-xs text-center mb-5" style={{ color: "#9ca3af" }}>
                  You guessed <span className="font-bold" style={{ color: won ? "#111827" : "#ffffff" }}>&quot;{wrongGuess}&quot;</span> — the answer was:
                </p>
              )}

              <motion.div
                className="flex items-center gap-4 p-4 mb-5 text-left border-2"
                style={{
                  background: won ? "#ffffff" : "#1f2937",
                  borderColor: "#84cc16",
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.38 }}
              >
                <PlayerHeadshot
                  playerId={player.id}
                  teamColor={player.teamColor}
                  jersey={player.jersey}
                  size={64}
                />
                <div>
                  <p className="font-playfair font-black text-base" style={{ color: won ? "#111827" : "#ffffff" }}>{player.name}</p>
                  <p className="font-mono text-xs text-gray-400">{player.team} · {player.era}</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-4 gap-0 border-2 border-[#111827] mb-5">
                <StatBox label="PPG" value={player.stats.ppg} won={won} last={false} />
                <StatBox label="RPG" value={player.stats.rpg} won={won} last={false} />
                <StatBox label="APG" value={player.stats.apg} won={won} last={false} />
                <StatBox label="SPG" value={player.stats.spg} won={won} last={true} />
                <StatBox label="BPG" value={player.stats.bpg} won={won} last={false} />
                <StatBox label="FG%" value={player.stats.fgPct} suffix="%" won={won} last={false} />
                {player.stats.threePct !== null && <StatBox label="3P%" value={player.stats.threePct} suffix="%" won={won} last={false} />}
              </div>

              <motion.button
                onClick={handleNext}
                className="w-full py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] transition-colors"
                style={{ background: "#84cc16", color: "#111827", fontSize: "0.95rem", letterSpacing: "0.15em" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                Next Player →
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 max-w-2xl mx-auto w-full" style={{ background: "#f4f0e6" }}>
      {/* Top bordered panel: title + progress + icon */}
      <div className="w-full border-2 border-[#111827] mb-8">
        {/* Dark header strip */}
        <div className="px-6 py-5 text-center" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
          <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">
            {stepsRevealed} of 5 clues revealed
          </p>
          <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}>
            Who Am I?
          </h1>
        </div>
        {/* Cream strip: progress dots + icon */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#f4f0e6" }}>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 border border-[#111827]"
                style={{ background: i < stepsRevealed ? "#84cc16" : "transparent" }}
              />
            ))}
          </div>
          <motion.div
            className="w-12 h-12 flex items-center justify-center text-2xl border-2 border-[#111827]"
            style={{ background: "#84cc16" }}
            animate={{ rotate: [0, -4, 4, -2, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ❓
          </motion.div>
        </div>
      </div>

      {/* Clue rows */}
      <div className="w-full border-2 border-[#111827] mb-6">
        {/* Header row */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
          <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16]">Career Averages</p>
          <p className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.1em]">
            {allRevealed ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
          </p>
        </div>
        {/* Revealed rows */}
        <AnimatePresence initial={false}>
          {REVEAL_STEPS.slice(0, stepsRevealed).map((step, idx) => (
            <motion.div
              key={step.key}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "2px solid #111827", background: "#f4f0e6" }}
              initial={{ opacity: 0, x: -14, backgroundColor: "rgba(132,204,22,0.12)" }}
              animate={{ opacity: 1, x: 0, backgroundColor: "#f4f0e6" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <span className="font-mono text-xs text-gray-400 uppercase tracking-[0.1em]">{step.label}</span>
              <motion.span
                className="font-playfair font-black"
                style={{ color: "#84cc16", fontSize: "1.1rem" }}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {step.key === "ppg" && `${player.stats.ppg}`}
                {step.key === "rpg" && `${player.stats.rpg}`}
                {step.key === "apg" && `${player.stats.apg}`}
                {step.key === "meta" && `${player.position} · ${player.era}`}
                {step.key === "team" && player.team}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
        {/* Hidden rows */}
        {REVEAL_STEPS.slice(stepsRevealed).map(step => (
          <div key={step.key} className="flex items-center justify-between px-5 py-4 opacity-30" style={{ borderBottom: "2px solid #111827", background: "#f4f0e6" }}>
            <span className="font-mono text-xs text-gray-400 uppercase tracking-[0.1em]">{step.label}</span>
            <span className="font-mono text-xs text-gray-300">• • •</span>
          </div>
        ))}
      </div>

      {/* Wrong guess feedback */}
      <AnimatePresence mode="wait">
        {wrongGuess && (
          <motion.div
            key={shakeKey}
            className="w-full border-2 border-[#ef4444] px-4 py-3 mb-4 font-mono text-xs text-center"
            style={{ background: "#f4f0e6", color: "#ef4444" }}
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            ❌ &quot;{wrongGuess}&quot; — {allRevealed ? "wrong answer!" : "next clue revealed!"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input + Guess button */}
      <div className="w-full flex gap-0 mb-4 border-2 border-[#111827]">
        <div className="flex-1">
          <PlayerAutocomplete
            players={playerNames}
            value={guess}
            onChange={setGuess}
            onSubmit={checkGuess}
            autoFocus
          />
        </div>
        <button
          onClick={checkGuess}
          disabled={!guess.trim()}
          className="px-7 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-l-2 border-[#111827] transition-colors shrink-0"
          style={guess.trim()
            ? { background: "#84cc16", color: "#111827" }
            : { background: "#f4f0e6", color: "#d1d5db", cursor: "not-allowed" }}
        >
          Guess
        </button>
      </div>

      {/* Reveal + Give Up buttons */}
      <div className="flex gap-0 w-full border-2 border-[#111827]">
        {!allRevealed && (
          <button
            onClick={() => setRevealStep(s => Math.min(s + 1, 4))}
            className="flex-1 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
            style={{ background: "#ffffff", color: "#111827", borderRight: "2px solid #111827" }}
          >
            Reveal Clue 👀
          </button>
        )}
        <button
          onClick={() => setGameState("wrong")}
          className="py-4 px-6 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
          style={{ background: "#f4f0e6", color: "#9ca3af" }}
        >
          Give Up
        </button>
      </div>

      {/* Stars rating */}
      <div className="flex items-center gap-1 mt-5">
        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.1em] mr-1">Guess now:</span>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-base transition-all duration-300 ${i < (5 - revealStep) ? "opacity-100" : "opacity-20 grayscale"}`}>
            ⭐
          </span>
        ))}
      </div>
    </main>
  );
}

function StatLineGuesserGame() {
  const searchParams = useSearchParams();
  const [era, setEra] = useState<Era>(
    searchParams.get("era") === "current" ? "current" : "alltime"
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Stat Line Guesser" era={era} />
      <EraTab era={era} setEra={setEra} />
      <StatLineCore key={era} era={era} />
    </div>
  );
}

export default function StatLineGuesserPage() {
  return (
    <Suspense>
      <StatLineGuesserGame />
    </Suspense>
  );
}

function StatBox({ label, value, suffix = "", won, last }: { label: string; value: number; suffix?: string; won: boolean; last: boolean }) {
  return (
    <div
      className="flex flex-col items-center py-2"
      style={{
        borderRight: last ? undefined : "2px solid #111827",
        borderBottom: "2px solid #111827",
        background: won ? "#ffffff" : "#1f2937",
      }}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: "#84cc16" }}>{label}</p>
      <p className="font-playfair font-black text-sm" style={{ color: won ? "#111827" : "#ffffff" }}>{value}{suffix}</p>
    </div>
  );
}
