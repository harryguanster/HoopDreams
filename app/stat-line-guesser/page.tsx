"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { STAT_LINE_PLAYERS, type StatLinePlayer } from "@/lib/statLineData";
import { CURRENT_STAT_LINE_PLAYERS } from "@/lib/currentStatLineData";
import { ALL_PLAYER_NAMES, CURRENT_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";

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

  const [shuffled] = useState(() => shuffleArray(players));
  const [playerIndex, setPlayerIndex] = useState(0);
  const [revealStep, setRevealStep] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [wrongGuess, setWrongGuess] = useState("");

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
      <div className="min-h-screen flex flex-col bg-black">
        <Header era={era} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full animate-fade-in">
          <div className={`w-full rounded-3xl border-2 p-8 text-center bg-zinc-900 ${gameState === "correct" ? "border-teal-500/50" : "border-red-500/40"}`}>
            <div className="text-6xl mb-4">{gameState === "correct" ? "🎯" : "😬"}</div>
            <h2 className="text-2xl font-black text-white mb-1">
              {gameState === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {gameState === "correct" ? (
              <>
                <p className="text-zinc-400 mb-3">You got it after {stepsRevealed} stat{stepsRevealed !== 1 ? "s" : ""}!</p>
                <p className="text-3xl mb-6">{STARS[revealStep]}</p>
              </>
            ) : (
              <p className="text-zinc-400 mb-6">You guessed <span className="font-semibold text-zinc-300">&quot;{wrongGuess}&quot;</span> — the answer was:</p>
            )}

            <div className="flex items-center gap-4 bg-zinc-800 rounded-2xl p-4 mb-4 text-left">
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white text-xl shadow-md shrink-0" style={{ backgroundColor: player.teamColor }}>
                <span className="leading-none">{player.jersey}</span>
                <span className="text-[8px] font-bold opacity-80">{player.position}</span>
              </div>
              <div>
                <p className="font-black text-white text-lg">{player.name}</p>
                <p className="text-zinc-400 text-sm">{player.team} · {player.era}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              <StatBox label="PPG" value={player.stats.ppg} />
              <StatBox label="RPG" value={player.stats.rpg} />
              <StatBox label="APG" value={player.stats.apg} />
              <StatBox label="SPG" value={player.stats.spg} />
              <StatBox label="BPG" value={player.stats.bpg} />
              <StatBox label="FG%" value={player.stats.fgPct} suffix="%" />
              {player.stats.threePct !== null && <StatBox label="3P%" value={player.stats.threePct} suffix="%" />}
            </div>

            <button onClick={handleNext} className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl tracking-wide uppercase transition-all active:scale-95">
              Next Player →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header era={era} />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-6 animate-fade-in">
          <p className="text-xs text-teal-400 uppercase tracking-widest font-semibold mb-1">
            {stepsRevealed} of 5 stats revealed
          </p>
          <h1 className="text-2xl font-black text-white">Stat Line Guesser</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {allRevealed ? "Last chance — who is it?" : "Guess now or reveal the next stat"}
          </p>
        </div>

        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-4xl mb-6">
          ❓
        </div>

        <div className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Career Averages</p>
          </div>
          <div className="divide-y divide-zinc-800">
            {REVEAL_STEPS.slice(0, stepsRevealed).map((step, i) => (
              <div key={step.key} className="flex items-center justify-between px-4 py-3 animate-slide-down" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="text-sm text-zinc-400 font-medium">{step.label}</span>
                <span className="text-sm font-black text-white">
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
                <span className="text-sm text-zinc-500 font-medium">{step.label}</span>
                <span className="text-sm font-black text-zinc-600">• • •</span>
              </div>
            ))}
          </div>
        </div>

        {wrongGuess && (
          <p className="text-red-400 text-sm mb-3 font-medium animate-fade-in">
            ❌ &quot;{wrongGuess}&quot; — not correct. Next stat revealed!
          </p>
        )}

        <div className="w-full flex gap-2 mb-4">
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
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        <div className="flex gap-3 w-full">
          {!allRevealed && (
            <button onClick={() => setRevealStep((s) => Math.min(s + 1, 4))} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold rounded-xl transition-all active:scale-95 text-sm">
              Reveal Next Stat 👀
            </button>
          )}
          <button onClick={() => setGameState("wrong")} className="py-3 px-4 bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 font-bold rounded-xl transition-all text-sm">
            Give Up
          </button>
        </div>

        <p className="text-zinc-700 text-xs mt-6">
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
    <div className="bg-zinc-800 rounded-xl p-2 text-center">
      <p className="text-xs text-zinc-400 font-medium">{label}</p>
      <p className="text-base font-black text-white">{value}{suffix}</p>
    </div>
  );
}

function Header({ era }: { era: string }) {
  return (
    <header className="border-b border-zinc-900 bg-[#080808]/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      <a href="/home" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 transition-colors">
        <img src="/logo.png" alt="Courtside Central" className="h-12 w-auto" />
      </a>
      <div className="flex items-center gap-2">
        {era === "current" && (
          <span className="text-xs bg-teal-400/10 text-teal-400 border border-teal-400/30 px-2 py-0.5 rounded-full font-semibold">Current NBA</span>
        )}
        <span className="text-xs text-zinc-600 uppercase tracking-widest">Stat Line Guesser</span>
      </div>
    </header>
  );
}
