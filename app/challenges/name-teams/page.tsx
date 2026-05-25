"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/app/components/GameHeader";
import { NBA_TEAMS, NBA_CONFERENCES } from "@/lib/challengeData";

const TOTAL = 30;
const TIME_LIMIT = 5 * 60; // 5 minutes in seconds

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function matchTeam(input: string): string | null {
  const norm = input.toLowerCase().trim();
  if (norm.length < 2) return null;
  for (const team of NBA_TEAMS) {
    if (
      team.name.toLowerCase() === norm ||
      team.aliases.includes(norm)
    ) {
      return team.name;
    }
  }
  return null;
}

export default function NameTeamsPage() {
  const [guessed, setGuessed] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [lastGuess, setLastGuess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (started && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { endGame(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, gameOver, endGame]);

  useEffect(() => {
    if (guessed.length === TOTAL) endGame();
  }, [guessed, endGame]);

  function tryGuess() {
    const match = matchTeam(input);
    if (match && !guessed.includes(match)) {
      setGuessed(g => [...g, match]);
      setLastGuess(match);
      setInput("");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!started) { setStarted(true); inputRef.current?.focus(); return; }
      tryGuess();
    }
  }

  function start() {
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function restart() {
    setGuessed([]);
    setInput("");
    setTimeLeft(TIME_LIMIT);
    setStarted(false);
    setGameOver(false);
    setLastGuess(null);
  }

  const remaining = TOTAL - guessed.length;
  const pct = (guessed.length / TOTAL) * 100;

  return (
    <div className="min-h-screen">
      <GameHeader title="Name All NBA Teams" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className={`text-3xl font-black tabular-nums ${timeLeft <= 30 && started && !gameOver ? "text-red-500" : "text-[#111827]"}`}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black tabular-nums" style={{ color: "#65a30d" }}>{guessed.length}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Guessed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-gray-400 tabular-nums">{remaining}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Remaining</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: "#84cc16" }}
          />
        </div>

        {/* Input */}
        {!gameOver && (
          <div className="mb-6 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => { if (!started) start(); setInput(e.target.value); }}
              onKeyDown={handleKey}
              placeholder={started ? "Type a team name…" : "Click here or press Enter to start"}
              disabled={gameOver}
              className={`flex-1 bg-white border-2 rounded-xl px-4 py-3 text-base font-medium outline-none transition-all text-[#111827] placeholder-gray-400
                ${shake ? "border-red-400 animate-pulse" : "border-gray-200 focus:border-[#84cc16]"}
                ${gameOver ? "opacity-50" : ""}
              `}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => { if (!started) start(); else tryGuess(); }}
              className="bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold px-5 py-3 rounded-xl transition-colors"
            >
              {started ? "Enter" : "Start"}
            </button>
          </div>
        )}

        {lastGuess && !gameOver && (
          <p className="text-center text-sm font-semibold mb-4 animate-pulse" style={{ color: "#65a30d" }}>
            ✓ {lastGuess}
          </p>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="text-center py-6 mb-6 rounded-2xl" style={guessed.length === TOTAL ? { background: "rgba(132,204,22,0.08)", border: "1.5px solid rgba(132,204,22,0.35)" } : { background: "white", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div className="text-4xl mb-2">{guessed.length === TOTAL ? "🏆" : "⏱️"}</div>
            <h2 className="text-xl font-bebas tracking-widest text-[#111827] mb-1">
              {guessed.length === TOTAL ? "You got them all!" : `You got ${guessed.length} / ${TOTAL}`}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {guessed.length === TOTAL
                ? `Finished with ${fmt(timeLeft)} remaining!`
                : `${remaining} team${remaining !== 1 ? "s" : ""} remaining`}
            </p>
            <button
              onClick={restart}
              className="bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Teams by conference + division */}
        <div className="space-y-5">
          {NBA_CONFERENCES.map(conf => (
            <div key={conf.name}>
              {/* Conference header */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${conf.name.startsWith("Eastern") ? "text-sky-700 bg-sky-50 border-sky-200" : "text-orange-700 bg-orange-50 border-orange-200"}`}>
                  {conf.name}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Divisions side-by-side */}
              <div className="grid grid-cols-3 gap-3">
                {conf.divisions.map(div => (
                  <div key={div.name}>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 text-center">
                      {div.name}
                    </p>
                    <div className="space-y-1">
                      {div.teams.map(teamName => {
                        const done = guessed.includes(teamName);
                        return (
                          <div
                            key={teamName}
                            className={`rounded-lg px-2 py-1.5 text-xs font-semibold text-center transition-all duration-300
                              ${done
                                ? "text-[#111827]"
                                : gameOver
                                  ? "bg-gray-100 text-gray-500 border border-gray-200"
                                  : "bg-white text-transparent border border-dashed border-gray-300 select-none"
                              }`}
                            style={done ? { background: "#84cc16" } : {}}
                          >
                            {done || gameOver ? teamName : "?"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!started && !gameOver && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Type a city name, nickname, or abbreviation (e.g. "Lakers", "GSW", "OKC")
          </p>
        )}
      </main>
    </div>
  );
}
