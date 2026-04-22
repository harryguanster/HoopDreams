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

type GameState = "playing" | "correct" | "wrong";

const STARS = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐"];

// Stat reveals for current NBA players
const CURRENT_REVEAL_STEPS = [
  { label: "PPG This Season", key: "ppg" },
  { label: "Draft Year", key: "draftYear" },
  { label: "Draft Pick", key: "draftPick" },
  { label: "RPG / APG", key: "rpgapg" },
  { label: "Position", key: "position" },
];

function formatReveal(step: { key: string }, player: CurrentNBAPlayer): string {
  if (step.key === "ppg") return `${player.ppg} PPG`;
  if (step.key === "draftYear") return player.draftYear ? `${player.draftYear}` : "Undrafted";
  if (step.key === "draftPick") return player.draftPick ? `#${player.draftPick} overall` : "—";
  if (step.key === "rpgapg") return `${player.rpg} RPG / ${player.apg} APG`;
  if (step.key === "position") return player.position;
  return "";
}

function GuessWhoGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";

  const allTimePlayers = GUESS_WHO_PLAYERS;
  const currentPlayers = CURRENT_NBA_PLAYERS;
  const playerNames = era === "current" ? CURRENT_PLAYER_NAMES : ALL_PLAYER_NAMES;

  const [shuffledAllTime] = useState(() => shuffleArray(allTimePlayers));
  const [shuffledCurrent] = useState(() => shuffleArray(currentPlayers));
  const [playerIndex, setPlayerIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [wrongGuess, setWrongGuess] = useState("");

  const allTimePlayer: GuessWhoPlayer = shuffledAllTime[playerIndex % shuffledAllTime.length];
  const currentPlayer: CurrentNBAPlayer = shuffledCurrent[playerIndex % shuffledCurrent.length];
  const playerName = era === "current" ? currentPlayer.name : allTimePlayer.name;
  const playerTeam = era === "current" ? currentPlayer.team : allTimePlayer.team;
  const playerTeamColor = era === "current" ? currentPlayer.teamColor : allTimePlayer.teamColor;
  const playerJersey = era === "current" ? currentPlayer.jersey : allTimePlayer.jersey;
  const playerPosition = era === "current" ? currentPlayer.position : allTimePlayer.position;
  const playerAliases = era === "current" ? currentPlayer.aliases : allTimePlayer.aliases;

  const cluesRevealed = clueIndex + 1;
  const allCluesShown = clueIndex === 4;

  const checkGuess = useCallback(() => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) return;
    const correct = playerAliases.some((a) => a.toLowerCase() === trimmed);
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
  }, [guess, playerAliases, allCluesShown]);

  const handleNextPlayer = () => {
    setPlayerIndex((i) => i + 1);
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
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white text-xl shadow-md shrink-0" style={{ backgroundColor: playerTeamColor }}>
                <span className="leading-none">{playerJersey}</span>
                <span className="text-[8px] font-bold opacity-80">{playerPosition}</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">{playerName}</p>
                <p className="text-slate-500 text-sm">{playerTeam}</p>
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

        {era === "current" ? (
          <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Player Info</p>
            </div>
            <div className="divide-y divide-slate-100">
              {CURRENT_REVEAL_STEPS.slice(0, cluesRevealed).map((step, i) => (
                <div key={step.key} className="flex items-center justify-between px-4 py-3 animate-slide-down" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span className="text-sm text-slate-500 font-medium">{step.label}</span>
                  <span className="text-sm font-black text-slate-900">{formatReveal(step, currentPlayer)}</span>
                </div>
              ))}
              {CURRENT_REVEAL_STEPS.slice(cluesRevealed).map((step) => (
                <div key={step.key} className="flex items-center justify-between px-4 py-3 opacity-30">
                  <span className="text-sm text-slate-400 font-medium">{step.label}</span>
                  <span className="text-sm font-black text-slate-300">• • •</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3 mb-6">
            {allTimePlayer.clues.slice(0, cluesRevealed).map((clue, i) => (
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
        )}

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
