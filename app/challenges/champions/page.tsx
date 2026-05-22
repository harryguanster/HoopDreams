"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/app/components/GameHeader";
import { CHAMPIONS, UNIQUE_CHAMPIONS, matchChampion } from "@/lib/championsData";

const TOTAL = CHAMPIONS.length;
const TIME_LIMIT = 6 * 60;

const TEAM_COLORS: Record<string, string> = {
  "Chicago Bulls":         "#ce1141",
  "Los Angeles Lakers":    "#552583",
  "San Antonio Spurs":     "#c4ced4",
  "Golden State Warriors": "#1d428a",
  "Miami Heat":            "#98002e",
  "Boston Celtics":        "#007a33",
  "Detroit Pistons":       "#c8102e",
  "Houston Rockets":       "#ce1141",
  "Dallas Mavericks":      "#0053bc",
  "Cleveland Cavaliers":   "#860038",
  "Toronto Raptors":       "#ce1141",
  "Milwaukee Bucks":       "#00471b",
  "Denver Nuggets":        "#0e2240",
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ChampionsPage() {
  const [guessedTeams, setGuessedTeams] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const guessedCount = CHAMPIONS.filter(c => guessedTeams.has(c.team)).length;
  const remaining = TOTAL - guessedCount;
  const pct = (guessedCount / TOTAL) * 100;

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
    if (guessedCount === TOTAL && started) endGame();
  }, [guessedCount, started, endGame]);

  function tryGuess() {
    const team = matchChampion(input);
    if (team && !guessedTeams.has(team)) {
      setGuessedTeams(prev => new Set([...prev, team]));
      setFlash(team);
      setTimeout(() => setFlash(null), 1200);
      setInput("");
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!started) { start(); return; }
      tryGuess();
    }
  }

  function start() {
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function restart() {
    setGuessedTeams(new Set());
    setInput("");
    setTimeLeft(TIME_LIMIT);
    setStarted(false);
    setGameOver(false);
    setFlash(null);
  }

  const teamsGuessed = UNIQUE_CHAMPIONS.filter(t => guessedTeams.has(t));

  return (
    <div className="min-h-screen">
      <GameHeader title="NBA Champions by Year" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className={`text-3xl font-black tabular-nums ${timeLeft <= 30 && started && !gameOver ? "text-red-500" : "text-white"}`}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-teal-400 tabular-nums">{guessedCount}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Years Filled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white/40 tabular-nums">{remaining}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Remaining</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/8 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        {/* Input */}
        {!gameOver && (
          <div className="mb-4 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => { if (!started) start(); setInput(e.target.value); }}
              onKeyDown={handleKey}
              placeholder={started ? "Type a team name (e.g. Bulls, Lakers, Spurs)…" : "Click here or press Enter to start"}
              disabled={gameOver}
              className={`flex-1 bg-white/6 border-2 rounded-xl px-4 py-3 text-base font-medium outline-none transition-all
                ${shake ? "border-red-400 animate-pulse" : "border-white/10 focus:border-teal-500"}
                ${gameOver ? "opacity-50" : ""}
              `}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => { if (!started) start(); else tryGuess(); }}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-5 py-3 rounded-xl transition-colors"
            >
              {started ? "Enter" : "Start"}
            </button>
          </div>
        )}

        {/* Flash message */}
        {flash && !gameOver && (
          <p className="text-center text-sm text-teal-400 font-semibold mb-3 animate-pulse">
            ✓ {flash} — all {CHAMPIONS.filter(c => c.team === flash).length} year{CHAMPIONS.filter(c => c.team === flash).length !== 1 ? "s" : ""} filled!
          </p>
        )}

        {!flash && started && !gameOver && teamsGuessed.length > 0 && (
          <p className="text-center text-xs text-white/30 mb-3 font-mono">
            Teams found: {teamsGuessed.length} / {UNIQUE_CHAMPIONS.length}
          </p>
        )}

        {/* Game over */}
        {gameOver && (
          <div className={`text-center py-6 mb-6 rounded-2xl ${guessedCount === TOTAL ? "bg-teal-500/12 border border-teal-400/30" : "bg-white/5 border border-white/10"}`}>
            <div className="text-4xl mb-2">{guessedCount === TOTAL ? "🏆" : "⏱️"}</div>
            <h2 className="text-xl font-bold text-white mb-1">
              {guessedCount === TOTAL ? "You got them all!" : `You got ${guessedCount} / ${TOTAL}`}
            </h2>
            <p className="text-sm text-white/45 mb-4">
              {guessedCount === TOTAL
                ? `Finished with ${fmt(timeLeft)} remaining!`
                : `${remaining} year${remaining !== 1 ? "s" : ""} left unfilled`}
            </p>
            <button
              onClick={restart}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Year grid */}
        <div className="grid grid-cols-5 gap-2">
          {CHAMPIONS.map(({ year, team, shortName }) => {
            const solved = guessedTeams.has(team);
            const color = TEAM_COLORS[team] ?? "#14b8a6";
            return (
              <div
                key={year}
                className="rounded-xl overflow-hidden border transition-all duration-300"
                style={{
                  borderColor: solved ? `${color}60` : "rgba(255,255,255,0.06)",
                  background: solved ? `${color}22` : "rgba(255,255,255,0.04)",
                }}
              >
                <div
                  className="text-center text-[10px] font-black tracking-widest py-1"
                  style={{ background: solved ? `${color}50` : "rgba(255,255,255,0.05)", color: solved ? "#fff" : "rgba(255,255,255,0.3)" }}
                >
                  {year}
                </div>
                <div
                  className="text-center py-2 px-1 text-[10px] font-bold leading-tight select-none"
                  style={{ color: solved ? "#fff" : "transparent", minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {solved || gameOver
                    ? (gameOver && !guessedTeams.has(team)
                      ? <span style={{ color: "rgba(255,255,255,0.35)" }}>{shortName}</span>
                      : shortName)
                    : "???"}
                </div>
              </div>
            );
          })}
        </div>

        {!started && !gameOver && (
          <p className="text-center text-xs text-white/35 mt-6">
            Type a team nickname or city — one guess fills all the years that team won
          </p>
        )}
      </main>
    </div>
  );
}
