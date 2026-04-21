"use client";

import { useState, useRef, useCallback } from "react";
import { GUESS_WHO_PLAYERS, type GuessWhoPlayer } from "@/lib/guessWhoData";

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

export default function GuessWhoPage() {
  const [shuffled] = useState(() => shuffleArray(GUESS_WHO_PLAYERS));
  const [playerIndex, setPlayerIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0); // 0 = first clue shown
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [wrongGuess, setWrongGuess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const player: GuessWhoPlayer = shuffled[playerIndex];
  const cluesRevealed = clueIndex + 1; // how many clues are showing
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
        // Reveal next clue as penalty
        setClueIndex((i) => Math.min(i + 1, 4));
        setGuess("");
        inputRef.current?.focus();
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

  const score = STARS[clueIndex]; // stars based on which clue they got it on

  if (gameState === "correct" || gameState === "wrong") {
    return (
      <div className="min-h-screen flex flex-col bg-teal-50">
        <Header />
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
              <p className="text-slate-500 mb-6">You guessed <span className="font-semibold text-slate-700">"{wrongGuess}"</span> but the answer was:</p>
            )}

            {/* Player reveal */}
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
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-6 animate-fade-in">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-1">
            Clue {cluesRevealed} of 5
          </p>
          <h1 className="text-2xl font-black text-slate-900">Guess Who?</h1>
          <p className="text-slate-400 text-sm mt-1">
            {allCluesShown ? "Last chance — who is it?" : "Guess now or reveal the next clue"}
          </p>
        </div>

        {/* Mystery player avatar */}
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-4xl mb-6 shadow-inner">
          🏀
        </div>

        {/* Clues */}
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

        {/* Wrong guess feedback */}
        {wrongGuess && (
          <p className="text-red-500 text-sm mb-3 font-medium animate-fade-in">
            ❌ "{wrongGuess}" — not correct. Next clue revealed!
          </p>
        )}

        {/* Guess input */}
        <div className="w-full flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkGuess()}
            placeholder="Type player name..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors text-sm"
            autoFocus
          />
          <button
            onClick={checkGuess}
            disabled={!guess.trim()}
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
          >
            Guess
          </button>
        </div>

        {/* Reveal / Skip */}
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

        {/* Stars preview */}
        <p className="text-slate-300 text-xs mt-6">
          {allCluesShown ? "⭐ — 1 star remaining" : `Current score if correct: ${STARS[clueIndex]}`}
        </p>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-teal-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <a href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 transition-colors">
        <span className="text-lg">🏀</span>
        <span className="font-black text-sm tracking-wide">COURTSIDE CENTRAL</span>
      </a>
      <span className="text-xs text-slate-400 uppercase tracking-widest">Guess Who</span>
    </header>
  );
}
