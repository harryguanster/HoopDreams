"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { STAT_LINE_PLAYERS, type StatLinePlayer } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";
import { ALL_PLAYER_NAMES, CURRENT_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";
import GameHeader from "@/app/components/GameHeader";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type GameState = "playing" | "correct" | "wrong";

const STARS = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"];

const REVEAL_STEPS = [
  { label: "Points Per Game", key: "ppg" },
  { label: "Rebounds Per Game", key: "rpg" },
  { label: "Assists Per Game", key: "apg" },
  { label: "Position & Era", key: "meta" },
  { label: "Team", key: "team" },
];

const SL_CONFETTI_COLORS = ["#14b8a6","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#10b981"];

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
      {pieces.map((p) => (
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

function StatLineGuesserGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era]);

  if (!mounted || shuffled.length === 0) {
    return <div className="min-h-screen "><GameHeader title="Stat Line Guesser" era={era} /></div>;
  }

  const player: StatLinePlayer = shuffled[playerIndex];
  const stepsRevealed = revealStep + 1;
  const allRevealed = revealStep === 4;

  const checkGuess = () => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;
    const correct = player.aliases.some((a) => a.toLowerCase() === trimmed) ||
      player.name.toLowerCase() === trimmed;
    if (correct) {
      setGameState("correct");
    } else {
      setWrongGuess(guess.trim());
      setShakeKey((k) => k + 1);
      if (allRevealed) {
        setGameState("wrong");
      } else {
        setRevealStep((s) => Math.min(s + 1, 4));
        setGuess("");
      }
    }
  };

  const handleNext = () => {
    setPlayerIndex((i) => (i + 1) % shuffled.length);
    setRevealStep(0);
    setGuess("");
    setGameState("playing");
    setWrongGuess("");
  };

  if (gameState === "correct" || gameState === "wrong") {
    const starCount = 5 - revealStep;
    return (
      <div className="min-h-screen flex flex-col  relative overflow-hidden">
        <GameHeader title="Stat Line Guesser" era={era} />
        {gameState === "correct" && <SLConfetti />}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto w-full">
          <motion.div
            className={`w-full rounded-3xl border-2 p-7 text-center bg-white/6 backdrop-blur-xl ${gameState === "correct" ? "border-teal-400/40" : "border-red-400/40"}`}
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
            <h2 className="text-2xl font-bold text-white mb-1">
              {gameState === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {gameState === "correct" ? (
              <>
                <p className="text-teal-400 font-semibold text-sm mb-2">Got it after {stepsRevealed} clue{stepsRevealed !== 1 ? "s" : ""}!</p>
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
              <p className="text-white/45 text-sm mb-5">You guessed <span className="font-semibold text-white/80">&quot;{wrongGuess}&quot;</span> — the answer was:</p>
            )}

            <motion.div
              className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 mb-5 text-left border border-white/8"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.38 }}
            >
              <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-white text-lg shadow-md shrink-0" style={{ backgroundColor: player.teamColor }}>
                <span className="leading-none">{player.jersey}</span>
                <span className="text-[8px] font-semibold opacity-90">{player.position}</span>
              </div>
              <div>
                <p className="font-bold text-white text-base">{player.name}</p>
                <p className="text-white/45 text-sm">{player.team} · {player.era}</p>
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
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl tracking-wide text-sm transition-all "
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
    <div className="min-h-screen flex flex-col ">
      <GameHeader title="Stat Line Guesser" era={era} />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">

        <div className="text-center mb-6">
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-widest mb-1">
            {stepsRevealed} of 5 clues revealed
          </p>
          <h1 className="text-2xl font-bold text-white">Who Am I?</h1>
          <p className="text-white/40 text-sm mt-1">
            {allRevealed ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
          </p>
        </div>

        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-3xl mb-6 shadow-lg"
          animate={{ rotate: [0, -4, 4, -2, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          ❓
        </motion.div>

        <div className="w-full bg-white/6 rounded-2xl border border-white/10 overflow-hidden mb-5 ">
          <div className="px-4 py-3 border-b border-white/8 bg-white/5 flex items-center justify-between">
            <p className="text-xs font-semibold text-white/45 uppercase tracking-wider">Career Averages</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xs transition-all duration-300 ${i < stepsRevealed ? "opacity-100" : "opacity-20"}`}>
                  {i < stepsRevealed ? "🟩" : "⬜"}
                </span>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/8">
            <AnimatePresence initial={false}>
              {REVEAL_STEPS.slice(0, stepsRevealed).map((step) => (
                <motion.div
                  key={step.key}
                  className="flex items-center justify-between px-4 py-3"
                  initial={{ opacity: 0, x: -14, backgroundColor: "rgba(20,184,166,0.15)" }}
                  animate={{ opacity: 1, x: 0, backgroundColor: "rgba(20,184,166,0)" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <span className="text-sm text-white/45 font-medium">{step.label}</span>
                  <motion.span
                    className="text-sm font-bold text-teal-300"
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
            {REVEAL_STEPS.slice(stepsRevealed).map((step) => (
              <div key={step.key} className="flex items-center justify-between px-4 py-3 opacity-25">
                <span className="text-sm text-white/40 font-medium">{step.label}</span>
                <span className="text-sm font-bold text-white/30">• • •</span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {wrongGuess && (
            <motion.p
              key={shakeKey}
              className="text-red-400 text-sm mb-3 font-medium bg-red-500/10 border border-red-400/25 rounded-xl px-3 py-2 w-full text-center"
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
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-white/12 disabled:text-white/40 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        <div className="flex gap-2 w-full">
          {!allRevealed && (
            <button
              onClick={() => setRevealStep((s) => Math.min(s + 1, 4))}
              className="flex-1 py-3 bg-white/6 hover:bg-white/10 text-white/80 border border-white/10 font-semibold rounded-xl transition-all active:scale-95 text-sm "
            >
              Reveal Clue 👀
            </button>
          )}
          <button
            onClick={() => setGameState("wrong")}
            className="py-3 px-4 bg-white/6 hover:bg-red-500/15 text-white/40 hover:text-red-500 border border-white/10 font-semibold rounded-xl transition-all text-sm "
          >
            Give Up
          </button>
        </div>

        <div className="flex items-center gap-1 mt-5">
          <span className="text-white/40 text-xs mr-1">Guess now:</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-base transition-all duration-300 ${i < (5 - revealStep) ? "opacity-100" : "opacity-20 grayscale"}`}>
              ⭐
            </span>
          ))}
        </div>
      </main>
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
    <div className="bg-white/5 border border-white/8 rounded-xl p-2 text-center">
      <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-white">{value}{suffix}</p>
    </div>
  );
}
