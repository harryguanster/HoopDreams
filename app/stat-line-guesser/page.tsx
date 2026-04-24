"use client";

import { useState, useEffect, Suspense } from "react";
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

  useEffect(() => {
    setShuffled(shuffleArray(players));
    setMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era]);

  if (!mounted || shuffled.length === 0) {
    return <div className="min-h-screen bg-[#f9f8f6]"><GameHeader title="Stat Line Guesser" era={era} /></div>;
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
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f8f6]">
        <GameHeader title="Stat Line Guesser" era={era} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto w-full">
          <div className={`w-full rounded-2xl border-2 p-7 text-center bg-white shadow-sm ${gameState === "correct" ? "border-teal-200" : "border-red-200"}`}>
            <div className="text-5xl mb-3">{gameState === "correct" ? "🎯" : "😬"}</div>
            <h2 className="text-xl font-bold text-zinc-900 mb-1">
              {gameState === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {gameState === "correct" ? (
              <>
                <p className="text-zinc-500 text-sm mb-2">You got it after {stepsRevealed} stat{stepsRevealed !== 1 ? "s" : ""}!</p>
                <p className="text-2xl mb-5">{STARS[revealStep]}</p>
              </>
            ) : (
              <p className="text-zinc-500 text-sm mb-5">You guessed <span className="font-semibold text-zinc-700">&quot;{wrongGuess}&quot;</span> — the answer was:</p>
            )}

            <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-4 mb-4 text-left border border-zinc-100">
              <div className="w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-white text-base shrink-0" style={{ backgroundColor: player.teamColor }}>
                <span className="leading-none">{player.jersey}</span>
                <span className="text-[8px] font-semibold opacity-90">{player.position}</span>
              </div>
              <div>
                <p className="font-bold text-zinc-900">{player.name}</p>
                <p className="text-zinc-500 text-sm">{player.team} · {player.era}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              <StatBox label="PPG" value={player.stats.ppg} />
              <StatBox label="RPG" value={player.stats.rpg} />
              <StatBox label="APG" value={player.stats.apg} />
              <StatBox label="SPG" value={player.stats.spg} />
              <StatBox label="BPG" value={player.stats.bpg} />
              <StatBox label="FG%" value={player.stats.fgPct} suffix="%" />
              {player.stats.threePct !== null && <StatBox label="3P%" value={player.stats.threePct} suffix="%" />}
            </div>

            <button onClick={handleNext} className="w-full py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-xl tracking-wide text-sm transition-all active:scale-95">
              Next Player →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f8f6]">
      <GameHeader title="Stat Line Guesser" era={era} />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-md mx-auto w-full">

        <div className="text-center mb-6">
          <p className="text-xs text-teal-600 font-semibold uppercase tracking-widest mb-1">
            {stepsRevealed} of 5 clues revealed
          </p>
          <h1 className="text-2xl font-bold text-zinc-900">Who Am I?</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {allRevealed ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
          </p>
        </div>

        <div className="w-20 h-20 rounded-full bg-zinc-200 flex items-center justify-center text-3xl mb-6">
          ❓
        </div>

        <div className="w-full bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-5 shadow-sm">
          <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Career Averages</p>
          </div>
          <div className="divide-y divide-zinc-100">
            {REVEAL_STEPS.slice(0, stepsRevealed).map((step, i) => (
              <div key={step.key} className="flex items-center justify-between px-4 py-3" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="text-sm text-zinc-500 font-medium">{step.label}</span>
                <span className="text-sm font-bold text-zinc-900">
                  {step.key === "ppg" && `${player.stats.ppg}`}
                  {step.key === "rpg" && `${player.stats.rpg}`}
                  {step.key === "apg" && `${player.stats.apg}`}
                  {step.key === "meta" && `${player.position} · ${player.era}`}
                  {step.key === "team" && player.team}
                </span>
              </div>
            ))}
            {REVEAL_STEPS.slice(stepsRevealed).map((step) => (
              <div key={step.key} className="flex items-center justify-between px-4 py-3 opacity-30">
                <span className="text-sm text-zinc-400 font-medium">{step.label}</span>
                <span className="text-sm font-bold text-zinc-300">• • •</span>
              </div>
            ))}
          </div>
        </div>

        {wrongGuess && (
          <p className="text-red-500 text-sm mb-3 font-medium">
            ❌ &quot;{wrongGuess}&quot; — not quite. Next clue revealed!
          </p>
        )}

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
            className="px-5 py-3 bg-zinc-900 hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        <div className="flex gap-2 w-full">
          {!allRevealed && (
            <button
              onClick={() => setRevealStep((s) => Math.min(s + 1, 4))}
              className="flex-1 py-3 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 font-semibold rounded-xl transition-all active:scale-95 text-sm shadow-sm"
            >
              Reveal Clue 👀
            </button>
          )}
          <button
            onClick={() => setGameState("wrong")}
            className="py-3 px-4 bg-white hover:bg-red-50 text-zinc-400 hover:text-red-500 border border-zinc-200 font-semibold rounded-xl transition-all text-sm shadow-sm"
          >
            Give Up
          </button>
        </div>

        <p className="text-zinc-400 text-xs mt-5">
          {allRevealed ? "⭐ — 1 star remaining" : `Correct now: ${STARS[revealStep]}`}
        </p>
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
    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2 text-center">
      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-zinc-900">{value}{suffix}</p>
    </div>
  );
}
