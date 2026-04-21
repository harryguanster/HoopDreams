"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GUESS_WHO_PLAYERS, type GuessWhoPlayer } from "@/lib/guessWhoData";
import { CURRENT_GUESS_WHO_PLAYERS } from "@/lib/currentGuessWhoData";
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

function GuessWhoGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";
  const players = era === "current" ? CURRENT_GUESS_WHO_PLAYERS : GUESS_WHO_PLAYERS;
  const playerNames = era === "current" ? CURRENT_PLAYER_NAMES : ALL_PLAYER_NAMES;

  const [shuffled] = useState(() => shuffleArray(players));
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

  const handleRevealClue = () => {
    if (clueIndex < 4) setClueIndex((i) => i + 1);
  };

  const score = STARS[clueIndex];

  if (gameState === "correct" || gameState === "wrong") {
    return (
      <div className="min-h-screen flex flex-col bg-teal-50">
        <Header era={era} />
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
      <Header era={era} />
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
            players={playerNames}
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
              onClick={handleRevealClue}
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
