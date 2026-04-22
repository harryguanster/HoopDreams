"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GUESS_WHO_PLAYERS, type GuessWhoPlayer } from "@/lib/guessWhoData";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";
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

// ── Wordle-style current NBA game ────────────────────────────────────────────

type CellColor = "green" | "yellow" | "gray";

function compareStat(guess: number, answer: number, tolerance: number): CellColor {
  if (Math.round(guess) === Math.round(answer)) return "green";
  if (Math.abs(guess - answer) <= tolerance) return "yellow";
  return "gray";
}

function comparePosition(guess: string, answer: string): CellColor {
  if (guess === answer) return "green";
  const group = (p: string) => {
    if (["PG", "SG"].includes(p)) return "G";
    if (["SF", "PF"].includes(p)) return "F";
    return "C";
  };
  return group(guess) === group(answer) ? "yellow" : "gray";
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

const CELL_BG: Record<CellColor, string> = {
  green: "bg-green-500 text-white border-green-500",
  yellow: "bg-yellow-400 text-white border-yellow-400",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
};

function StatCell({ value, color, label }: { value: string; color: CellColor; label: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border text-center py-1.5 px-0.5 ${CELL_BG[color]}`}>
      <span className="text-[8px] font-semibold opacity-70 uppercase tracking-wide leading-none mb-0.5">{label}</span>
      <span className="text-[11px] font-black leading-tight">{value}</span>
    </div>
  );
}

function GuessRow({ guess, answer }: { guess: CurrentNBAPlayer; answer: CurrentNBAPlayer }) {
  const isCorrect = guess.id === answer.id;
  return (
    <div className={`w-full rounded-xl p-2.5 border ${isCorrect ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-[10px] shrink-0" style={{ backgroundColor: guess.teamColor }}>
          {guess.jersey}
        </div>
        <p className="text-sm font-bold text-slate-800 truncate">{guess.name}</p>
        {isCorrect && <span className="ml-auto text-green-600 text-xs font-bold shrink-0">✓ Correct!</span>}
      </div>
      <div className="grid grid-cols-9 gap-0.5">
        <StatCell label="PPG" value={`${guess.ppg}`} color={compareStat(guess.ppg, answer.ppg, 4)} />
        <StatCell label="RPG" value={`${guess.rpg}`} color={compareStat(guess.rpg, answer.rpg, 2)} />
        <StatCell label="APG" value={`${guess.apg}`} color={compareStat(guess.apg, answer.apg, 2)} />
        <StatCell label="SPG" value={`${guess.spg}`} color={compareStat(guess.spg, answer.spg, 0.5)} />
        <StatCell label="BPG" value={`${guess.bpg}`} color={compareStat(guess.bpg, answer.bpg, 0.5)} />
        <StatCell label="AGE" value={`${guess.age}`} color={compareAge(guess.age, answer.age)} />
        <StatCell label="POS" value={guess.position} color={comparePosition(guess.position, answer.position)} />
        <StatCell label="DRAFT YR" value={guess.draftYear ? `'${String(guess.draftYear).slice(2)}` : "UD"} color={compareDraftYear(guess.draftYear, answer.draftYear)} />
        <StatCell label="PICK" value={guess.draftPick ? `#${guess.draftPick}` : "UD"} color={compareDraftPick(guess.draftPick, answer.draftPick)} />
      </div>
    </div>
  );
}

const MAX_GUESSES = 10;

function CurrentNBAWordleGame() {
  const [shuffled] = useState(() => shuffleArray(CURRENT_NBA_PLAYERS));
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

    const guessedPlayer = CURRENT_NBA_PLAYERS.find(
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
  }, [guess, guesses, answer]);

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
        <Header era="current" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full animate-fade-in">
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
                <span className="text-[8px] font-bold opacity-80">{answer.position}</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{answer.name}</p>
                <p className="text-slate-500 text-sm">{answer.team}</p>
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
      <Header era="current" />
      <main className="flex-1 flex flex-col items-center px-4 py-6 max-w-lg mx-auto w-full">
        <div className="text-center mb-5 animate-fade-in">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-1">
            {guesses.length === 0 ? "Start guessing" : `${guesses.length} / ${MAX_GUESSES} guesses used`}
          </p>
          <h1 className="text-2xl font-black text-slate-900">Who Am I?</h1>
          <p className="text-slate-400 text-sm mt-1">Guess a player — green = match, yellow = close</p>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-[10px] text-slate-500 font-semibold mb-4">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded inline-block" /> Match</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded inline-block" /> Close</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 rounded inline-block" /> Off</span>
        </div>

        {/* Input */}
        <div className="w-full flex gap-2 mb-4">
          <PlayerAutocomplete
            players={CURRENT_PLAYER_NAMES}
            value={guess}
            onChange={(v) => { setGuess(v); setError(""); }}
            onSubmit={checkGuess}
            autoFocus
          />
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
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
          <div className="w-full rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-300">
            <p className="text-3xl mb-2">❓</p>
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

// ── All-time clue-based game ──────────────────────────────────────────────────

type GameState = "playing" | "correct" | "wrong";
const STARS = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"];

function AllTimeGuessWhoGame() {
  const [shuffled] = useState(() => shuffleArray(GUESS_WHO_PLAYERS));
  const [playerIndex, setPlayerIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [wrongGuess, setWrongGuess] = useState("");

  const player: GuessWhoPlayer = shuffled[playerIndex];
  const cluesRevealed = clueIndex + 1;
  const allCluesShown = clueIndex === 4;

  const checkGuess = useCallback(() => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;
    const correct = player.aliases.some((a) => a.toLowerCase() === trimmed);
    if (correct) {
      setGameState("correct");
    } else {
      setWrongGuess(guess.trim());
      if (allCluesShown) {
        setGameState("wrong");
      } else {
        setClueIndex((i) => Math.min(i + 1, 4));
        setGuess("");
      }
    }
  }, [guess, player, allCluesShown]);

  const handleNextPlayer = () => {
    setPlayerIndex((i) => (i + 1) % shuffled.length);
    setClueIndex(0);
    setGuess("");
    setGameState("playing");
    setWrongGuess("");
  };

  const score = STARS[clueIndex];

  if (gameState === "correct" || gameState === "wrong") {
    return (
      <div className="min-h-screen flex flex-col bg-teal-50">
        <Header era="alltime" />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto w-full animate-fade-in">
          <div className={`w-full rounded-3xl border-2 p-8 text-center shadow-lg ${gameState === "correct" ? "bg-white border-teal-300" : "bg-white border-red-200"}`}>
            <div className="text-6xl mb-4">{gameState === "correct" ? "🎉" : "😬"}</div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              {gameState === "correct" ? "Correct!" : "Not quite!"}
            </h2>
            {gameState === "correct" ? (
              <>
                <p className="text-slate-500 mb-3">You got it in {cluesRevealed} clue{cluesRevealed !== 1 ? "s" : ""}!</p>
                <p className="text-3xl mb-6">{score}</p>
              </>
            ) : (
              <p className="text-slate-500 mb-6">You guessed <span className="font-semibold text-slate-700">&quot;{wrongGuess}&quot;</span> but the answer was:</p>
            )}
            <div className="flex items-center gap-4 bg-teal-50 rounded-2xl p-4 mb-6 text-left">
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white text-xl shadow-md shrink-0" style={{ backgroundColor: player.teamColor }}>
                <span className="leading-none">{player.jersey}</span>
                <span className="text-[8px] font-bold opacity-80">{player.position}</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{player.name}</p>
                <p className="text-slate-500 text-sm">{player.team}</p>
              </div>
            </div>
            <button onClick={handleNextPlayer} className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-md shadow-teal-200">
              Next Player →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <Header era="alltime" />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        <div className="text-center mb-6 animate-fade-in">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-1">
            Clue {cluesRevealed} of 5
          </p>
          <h1 className="text-2xl font-black text-slate-900">Guess Who?</h1>
          <p className="text-slate-400 text-sm mt-1">
            {allCluesShown ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
          </p>
        </div>

        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl mb-6 shadow-inner">
          🏀
        </div>

        <div className="w-full flex flex-col gap-3 mb-6">
          {player.clues.slice(0, cluesRevealed).map((clue, i) => (
            <div
              key={i}
              className="bg-white border border-teal-200 rounded-2xl px-4 py-3 shadow-sm animate-slide-down"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex gap-3 items-start">
                <span className="text-teal-500 font-black text-sm shrink-0 mt-0.5">#{i + 1}</span>
                <p className="text-slate-700 text-sm leading-relaxed">{clue}</p>
              </div>
            </div>
          ))}
        </div>

        {wrongGuess && (
          <p className="text-red-500 text-sm mb-3 font-medium animate-fade-in">
            ❌ &quot;{wrongGuess}&quot; — not correct. Next clue revealed!
          </p>
        )}

        <div className="w-full flex gap-2 mb-4">
          <PlayerAutocomplete
            players={ALL_PLAYER_NAMES}
            value={guess}
            onChange={setGuess}
            onSubmit={checkGuess}
            autoFocus
          />
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm shrink-0"
          >
            Guess
          </button>
        </div>

        <div className="flex gap-3 w-full">
          {!allCluesShown && (
            <button
              onClick={() => setClueIndex((i) => Math.min(i + 1, 4))}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold rounded-xl transition-all active:scale-95 text-sm"
            >
              Reveal Clue #{clueIndex + 2} 👀
            </button>
          )}
          <button
            onClick={() => setGameState("wrong")}
            className="py-3 px-4 bg-white hover:bg-red-50 text-slate-400 hover:text-red-400 border border-slate-200 font-bold rounded-xl transition-all text-sm"
          >
            Give Up
          </button>
        </div>

        <p className="text-slate-300 text-xs mt-6">
          {allCluesShown ? "⭐ — 1 star remaining" : `Current score if correct: ${STARS[clueIndex]}`}
        </p>
      </main>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

function GuessWhoGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";
  return era === "current" ? <CurrentNBAWordleGame /> : <AllTimeGuessWhoGame />;
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
        {era === "current" && (
          <span className="text-xs bg-teal-100 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold">Current NBA</span>
        )}
        <span className="text-xs text-slate-400 uppercase tracking-widest">Guess Who</span>
      </div>
    </header>
  );
}
