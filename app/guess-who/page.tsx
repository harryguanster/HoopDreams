"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";
import { ALL_TIME_GW_PLAYERS } from "@/lib/allTimePlayersGW";
import { CURRENT_PLAYER_NAMES, ALL_TIME_GW_PLAYER_NAMES } from "@/lib/allPlayers";
import PlayerAutocomplete from "@/app/components/PlayerAutocomplete";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Wordle helpers ────────────────────────────────────────────────────────────

type CellColor = "green" | "yellow" | "gray";

function compareStat(guess: number, answer: number, tolerance: number): CellColor {
  if (Math.round(guess) === Math.round(answer)) return "green";
  if (Math.abs(guess - answer) <= tolerance) return "yellow";
  return "gray";
}

function compareDraftYear(guess: number | null, answer: number | null): CellColor {
  if (guess === answer) return "green";
  if (guess === null || answer === null) return "gray";
  return Math.abs(guess - answer) <= 3 ? "yellow" : "gray";
}

function compareDraftPick(guess: number | null, answer: number | null): CellColor {
  if (guess === answer) return "green";
  if (guess === null || answer === null) return "gray";
  return Math.abs(guess - answer) <= 3 ? "yellow" : "gray";
}

function compareAge(guess: number, answer: number): CellColor {
  if (guess === answer) return "green";
  return Math.abs(guess - answer) <= 2 ? "yellow" : "gray";
}

function compareHeight(guess: number, answer: number): CellColor {
  if (guess === answer) return "green";
  return Math.abs(guess - answer) <= 1 ? "yellow" : "gray";
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

const CELL_BG: Record<CellColor, string> = {
  green: "bg-green-500 text-white border-green-500",
  yellow: "bg-yellow-400 text-white border-yellow-400",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
};

function StatCell({ value, color, label }: { value: string; color: CellColor; label: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border text-center py-2 px-0.5 ${CELL_BG[color]}`}>
      <span className="text-[9px] font-semibold opacity-70 uppercase tracking-wide leading-none mb-0.5">{label}</span>
      <span className="text-xs font-black leading-tight">{value}</span>
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: CurrentNBAPlayer; answer: CurrentNBAPlayer }) {
  const isCorrect = guess.id === answer.id;
  return (
    <div className={`w-full rounded-xl p-3 border ${isCorrect ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-[10px] shrink-0" style={{ backgroundColor: guess.teamColor }}>
          {guess.jersey}
        </div>
        <p className="text-sm font-bold text-slate-800 truncate">{guess.name}</p>
        {isCorrect && <span className="ml-auto text-green-600 text-xs font-bold shrink-0">✓ Correct!</span>}
      </div>
      <div className="grid grid-cols-8 gap-1">
        <StatCell label="PPG" value={`${guess.ppg}`} color={compareStat(guess.ppg, answer.ppg, 4)} />
        <StatCell label="RPG" value={`${guess.rpg}`} color={compareStat(guess.rpg, answer.rpg, 2)} />
        <StatCell label="APG" value={`${guess.apg}`} color={compareStat(guess.apg, answer.apg, 2)} />
        <StatCell label="SPG" value={`${guess.spg}`} color={compareStat(guess.spg, answer.spg, 0.5)} />
        <StatCell label="BPG" value={`${guess.bpg}`} color={compareStat(guess.bpg, answer.bpg, 0.5)} />
        <StatCell label="AGE" value={`${guess.age}`} color={compareAge(guess.age, answer.age)} />
        <StatCell label="HT" value={formatHeight(guess.height)} color={compareHeight(guess.height, answer.height)} />
        <StatCell label="DRAFT" value={guess.draftYear ? `'${String(guess.draftYear).slice(2)}` : "UD"} color={compareDraftYear(guess.draftYear, answer.draftYear)} />
      </div>
    </div>
  );
}

const MAX_GUESSES = 10;

// ── Shared Wordle game component ──────────────────────────────────────────────

function WordleGame({ players, playerNames, era }: {
  players: CurrentNBAPlayer[];
  playerNames: string[];
  era: string;
}) {
  const [shuffled] = useState(() => shuffleArray(players));
  const [answerIndex, setAnswerIndex] = useState(0);
  const [guesses, setGuesses] = useState<CurrentNBAPlayer[]>([]);
  const [guess, setGuess] = useState("");
  const [won, setWon] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState("");

  const answer = shuffled[answerIndex % shuffled.length];

  const checkGuess = useCallback(() => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;

    const guessedPlayer = players.find(
      (p) => p.name.toLowerCase() === trimmed || p.aliases.some((a) => a.toLowerCase() === trimmed)
    );

    if (!guessedPlayer) {
      setError("Player not found — try another name.");
      return;
    }

    if (guesses.some((g) => g.id === guessedPlayer.id)) {
      setError("Already guessed that player!");
      return;
    }

    setError("");
    const next = [guessedPlayer, ...guesses];
    setGuesses(next);
    setGuess("");

    if (guessedPlayer.id === answer.id) {
      setWon(true);
    } else if (next.length >= MAX_GUESSES) {
      setGaveUp(true);
    }
  }, [guess, guesses, answer, players]);

  const handleNext = () => {
    setAnswerIndex((i) => i + 1);
    setGuesses([]);
    setGuess("");
    setWon(false);
    setGaveUp(false);
    setError("");
  };

  if (won || gaveUp) {
    return (
      <div className="min-h-screen flex flex-col bg-teal-50">
        <Header era={era} />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-2xl mx-auto w-full animate-fade-in">
          <div className={`w-full rounded-3xl border-2 p-8 text-center shadow-lg bg-white ${won ? "border-teal-300" : "border-red-200"}`}>
            <div className="text-6xl mb-4">{won ? "🎉" : "😬"}</div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{won ? "Correct!" : "Not quite!"}</h2>
            {won
              ? <p className="text-slate-500 mb-4">Got it in {guesses.length} guess{guesses.length !== 1 ? "es" : ""}!</p>
              : <p className="text-slate-500 mb-4">{guesses.length >= MAX_GUESSES ? "Out of guesses! The answer was:" : "The answer was:"}</p>
            }
            <div className="flex items-center gap-4 bg-teal-50 rounded-2xl p-4 mb-6 text-left">
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white text-xl shadow-md shrink-0" style={{ backgroundColor: answer.teamColor }}>
                <span className="leading-none">{answer.jersey}</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{answer.name}</p>
                <p className="text-slate-500 text-sm">{answer.team} · {formatHeight(answer.height)}</p>
                <p className="text-slate-400 text-xs mt-0.5">{answer.ppg} PPG · {answer.rpg} RPG · {answer.apg} APG</p>
              </div>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-md shadow-teal-200">
              Next Player →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Header era={era} />
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-5 animate-fade-in">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-1">
            {guesses.length === 0 ? "Start guessing" : `${guesses.length} / ${MAX_GUESSES} guesses used`}
          </p>
          <h1 className="text-3xl font-black text-slate-900">Who Am I?</h1>
          <p className="text-slate-400 text-sm mt-1">Guess a player — green = match, yellow = close</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-[11px] text-slate-500 font-semibold mb-5">
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-green-500 rounded inline-block" /> Match</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-yellow-400 rounded inline-block" /> Close</span>
          <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 bg-slate-200 rounded inline-block" /> Off</span>
        </div>

        {/* Input */}
        <div className="w-full flex gap-2 mb-4">
          <PlayerAutocomplete
            players={playerNames}
            value={guess}
            onChange={(v) => { setGuess(v); setError(""); }}
            onSubmit={checkGuess}
            autoFocus
          />
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-3 font-medium animate-fade-in">{error}</p>
        )}

        {/* Guess history */}
        {guesses.length > 0 && (
          <div className="w-full flex flex-col gap-2 mb-4">
            {guesses.map((g, i) => (
              <GuessRow key={i} guess={g} answer={answer} />
            ))}
          </div>
        )}

        {guesses.length === 0 && (
          <div className="w-full rounded-xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-300">
            <p className="text-4xl mb-2">❓</p>
            <p className="text-sm font-medium">Your guesses will appear here</p>
          </div>
        )}

        <button
          onClick={() => setGaveUp(true)}
          className="mt-4 py-2 px-4 bg-white hover:bg-red-50 text-slate-400 hover:text-red-400 border border-slate-200 font-bold rounded-xl transition-all text-sm"
        >
          Give Up
        </button>
      </main>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

function GuessWhoGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";

  if (era === "current") {
    return <WordleGame players={CURRENT_NBA_PLAYERS} playerNames={CURRENT_PLAYER_NAMES} era="current" />;
  }
  return <WordleGame players={ALL_TIME_GW_PLAYERS} playerNames={ALL_TIME_GW_PLAYER_NAMES} era="alltime" />;
}

export default function GuessWhoPage() {
  return (
    <Suspense>
      <GuessWhoGame />
    </Suspense>
  );
}

function Header({ era }: { era: string }) {
  return (
    <header className="border-b border-teal-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <a href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 transition-colors">
        <span className="text-lg">🏀</span>
        <span className="font-black text-sm tracking-wide">COURTSIDE CENTRAL</span>
      </a>
      <div className="flex items-center gap-2">
        {era === "current"
          ? <span className="text-xs bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">Current NBA</span>
          : <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full font-semibold">All-Time</span>
        }
        <span className="text-xs text-slate-400 uppercase tracking-widest">Guess Who</span>
      </div>
    </header>
  );
}
