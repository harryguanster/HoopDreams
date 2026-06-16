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
    <div className="sticky top-[52px] z-30 backdrop-blur-md border-b overflow-hidden" style={{ background: "rgba(244,240,230,0.95)", borderColor: "rgba(0,0,0,0.09)" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 py-2.5">
        {(["alltime", "current"] as const).map(e => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className="relative px-5 py-2 text-sm font-bold transition-all duration-200 font-bebas tracking-widest"
            style={era === e ? {
              background: e === "current"
                ? "linear-gradient(90deg, #0ea5e9, #0284c7)"
                : "linear-gradient(90deg, #84cc16, #65a30d)",
              color: "#111827",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            } : { color: "#6b7280" }}
          >
            {e === "alltime" ? "ALL-TIME LEGENDS" : "CURRENT 2025–26"}
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
    return (
      <div className="flex-1 relative overflow-hidden">
        {gameState === "correct" && <SLConfetti />}
        <main className="flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto w-full min-h-full">
          <motion.div
            className="w-full rounded-2xl p-7 text-center bg-white shadow-sm"
            style={{ border: gameState === "correct" ? "1.5px solid rgba(132,204,22,0.4)" : "1.5px solid rgba(239,68,68,0.25)" }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <motion.div
              className="text-6xl mb-3"
              initial={{ scale: 0.3, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
            >
              {gameState === "correct" ? "🎯" : "😬"}
            </motion.div>
            <h2 className="text-2xl font-bebas tracking-widest text-[#111827] mb-1">
              {gameState === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {gameState === "correct" ? (
              <>
                <p className="font-semibold text-sm mb-2" style={{ color: "#65a30d" }}>Got it after {stepsRevealed} clue{stepsRevealed !== 1 ? "s" : ""}!</p>
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
              <p className="text-gray-500 text-sm mb-5">You guessed <span className="font-semibold text-[#111827]">&quot;{wrongGuess}&quot;</span> — the answer was:</p>
            )}

            <motion.div
              className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-5 text-left border border-gray-200"
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
                <p className="font-bold text-[#111827] text-base">{player.name}</p>
                <p className="text-gray-500 text-sm">{player.team} · {player.era}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              <StatBox label="PPG" value={player.stats.ppg} />
              <StatBox label="RPG" value={player.stats.rpg} />
              <StatBox label="APG" value={player.stats.apg} />
              <StatBox label="SPG" value={player.stats.spg} />
              <StatBox label="BPG" value={player.stats.bpg} />
              <StatBox label="FG%" value={player.stats.fgPct} suffix="%" />
              {player.stats.threePct !== null && <StatBox label="3P%" value={player.stats.threePct} suffix="%" />}
            </div>

            <motion.button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold rounded-2xl tracking-wide text-sm transition-all"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.15em" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              Next Player →
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">
      <div className="text-center mb-6">
        <p className="text-xs text-[#65a30d] font-semibold uppercase tracking-widest mb-1">
          {stepsRevealed} of 5 clues revealed
        </p>
        <h1 className="text-2xl font-bebas tracking-widest text-[#111827]">Who Am I?</h1>
        <p className="text-gray-400 text-sm mt-1">
          {allRevealed ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
        </p>
      </div>

      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, #84cc16, #65a30d)" }}
        animate={{ rotate: [0, -4, 4, -2, 2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        ❓
      </motion.div>

      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Career Averages</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs transition-all duration-300 ${i < stepsRevealed ? "opacity-100" : "opacity-20"}`}>
                {i < stepsRevealed ? "🟩" : "⬜"}
              </span>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          <AnimatePresence initial={false}>
            {REVEAL_STEPS.slice(0, stepsRevealed).map(step => (
              <motion.div
                key={step.key}
                className="flex items-center justify-between px-4 py-3"
                initial={{ opacity: 0, x: -14, backgroundColor: "rgba(132,204,22,0.12)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(132,204,22,0)" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <span className="text-sm text-gray-400 font-medium">{step.label}</span>
                <motion.span
                  className="text-sm font-bold text-[#65a30d]"
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
          {REVEAL_STEPS.slice(stepsRevealed).map(step => (
            <div key={step.key} className="flex items-center justify-between px-4 py-3 opacity-40">
              <span className="text-sm text-gray-400 font-medium">{step.label}</span>
              <span className="text-sm font-bold text-gray-300">• • •</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {wrongGuess && (
          <motion.p
            key={shakeKey}
            className="text-red-600 text-sm mb-3 font-medium bg-red-50 border border-red-200 rounded-xl px-3 py-2 w-full text-center"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -8, 8, -5, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            ❌ &quot;{wrongGuess}&quot; — {allRevealed ? "wrong answer!" : "next clue revealed!"}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="w-full flex gap-2 mb-3">
        <PlayerAutocomplete
          players={playerNames}
          value={guess}
          onChange={setGuess}
          onSubmit={checkGuess}
          autoFocus
        />
        <button
          onClick={checkGuess}
          disabled={!guess.trim()}
          className="px-5 py-3 bg-[#84cc16] hover:bg-[#65a30d] disabled:bg-gray-100 disabled:text-gray-400 text-[#111827] font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
        >
          Guess
        </button>
      </div>

      <div className="flex gap-2 w-full">
        {!allRevealed && (
          <button
            onClick={() => setRevealStep(s => Math.min(s + 1, 4))}
            className="flex-1 py-3 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-semibold rounded-xl transition-all active:scale-95 text-sm"
          >
            Reveal Clue 👀
          </button>
        )}
        <button
          onClick={() => setGameState("wrong")}
          className="py-3 px-4 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 font-semibold rounded-xl transition-all text-sm"
        >
          Give Up
        </button>
      </div>

      <div className="flex items-center gap-1 mt-5">
        <span className="text-gray-400 text-xs mr-1">Guess now:</span>
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
    <div className="min-h-screen flex flex-col">
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

function StatBox({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-center">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-[#111827]">{value}{suffix}</p>
    </div>
  );
}
