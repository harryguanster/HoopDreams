"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/app/components/GameHeader";
import { TEAM_ROSTERS, NBA_TEAMS } from "@/lib/challengeData";

const SLOTS = 6;
const TIME_LIMIT = 10 * 60;
const POSITIONS = ["PG", "SG", "SF", "PF", "C", "6th"];

const TEAM_NAMES = NBA_TEAMS.map(t => t.name);

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/['.]/g, "");
}

function findPlayerMatch(
  input: string,
  roster: string[],
  guessed: string[]
): string | "ambiguous" | null {
  const norm = normalize(input);
  if (norm.length < 2) return null;
  const remaining = roster.filter(p => !guessed.includes(p));

  // Exact full name
  const exact = remaining.find(p => normalize(p) === norm);
  if (exact) return exact;

  // Exact word match (any part of name)
  const wordMatches = remaining.filter(p =>
    normalize(p).split(" ").some(w => w === norm)
  );
  if (wordMatches.length === 1) return wordMatches[0];
  if (wordMatches.length > 1) return "ambiguous";

  // Prefix match (at least 3 chars)
  if (norm.length >= 3) {
    const prefixMatches = remaining.filter(p =>
      normalize(p).split(" ").some(w => w.startsWith(norm))
    );
    if (prefixMatches.length === 1) return prefixMatches[0];
    if (prefixMatches.length > 1) return "ambiguous";
  }

  return null;
}

export default function NamePlayersPage() {
  const [teamIdx, setTeamIdx] = useState(0);
  const [guessedPerTeam, setGuessedPerTeam] = useState<Record<string, string[]>>(
    () => Object.fromEntries(TEAM_NAMES.map(t => [t, []]))
  );
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (started && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { endGame(); return 0; } return t - 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, gameOver, endGame]);

  const teamName = TEAM_NAMES[teamIdx];
  const roster = TEAM_ROSTERS[teamName];
  const guessedHere = guessedPerTeam[teamName];
  const teamDone = guessedHere.length >= SLOTS;
  const totalGuessed = Object.values(guessedPerTeam).reduce((s, g) => s + Math.min(g.length, SLOTS), 0);
  const teamsCompleted = TEAM_NAMES.filter(t => guessedPerTeam[t].length >= SLOTS).length;

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 1500);
  }

  function tryGuess() {
    if (!input.trim()) return;
    const result = findPlayerMatch(input, roster, guessedHere);
    if (result === "ambiguous") {
      showFeedback("Be more specific (multiple matches)", false);
      return;
    }
    if (result) {
      setGuessedPerTeam(prev => ({
        ...prev,
        [teamName]: [...prev[teamName], result],
      }));
      showFeedback(`✓ ${result}`, true);
      setInput("");
      // auto-advance when team is complete
      if (guessedHere.length + 1 >= SLOTS && teamIdx < TEAM_NAMES.length - 1) {
        setTimeout(() => setTeamIdx(i => i + 1), 600);
      }
    } else {
      showFeedback("Not found — try their first or last name", false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!started) { setStarted(true); setTimeout(() => inputRef.current?.focus(), 50); return; }
      tryGuess();
    }
  }

  function skip() {
    if (teamIdx < TEAM_NAMES.length - 1) {
      setTeamIdx(i => i + 1);
      setInput("");
      inputRef.current?.focus();
    }
  }

  function prev() {
    if (teamIdx > 0) { setTeamIdx(i => i - 1); setInput(""); }
  }

  function restart() {
    setTeamIdx(0);
    setGuessedPerTeam(Object.fromEntries(TEAM_NAMES.map(t => [t, []])));
    setInput(""); setTimeLeft(TIME_LIMIT); setStarted(false); setGameOver(false);
  }

  const slots = Array.from({ length: SLOTS }, (_, i) => guessedHere[i] ?? null);

  return (
    <div className="min-h-screen">
      <GameHeader title="Name the Starting 5" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Top stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <div className={`text-2xl font-black tabular-nums ${timeLeft <= 60 && started && !gameOver ? "text-red-500" : "text-[#111827]"}`}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black tabular-nums" style={{ color: "#65a30d" }}>{totalGuessed}/180</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-700 tabular-nums">{teamsCompleted}/30</div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wide">Teams Done</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ background: "#84cc16", width: `${(totalGuessed / 180) * 100}%` }}
          />
        </div>

        {/* Team nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            disabled={teamIdx === 0}
            className="text-sm font-semibold text-gray-400 hover:text-[#111827] disabled:opacity-30 transition-colors px-2 py-1"
          >
            ← Prev
          </button>
          <div className="text-center">
            <div className={`text-xl font-black tracking-tight ${teamDone ? "text-teal-600" : "text-[#111827]"}`}>
              {teamName} {teamDone && "✓"}
            </div>
            <div className="text-[10px] text-gray-400">Team {teamIdx + 1} of 30</div>
          </div>
          <button
            onClick={skip}
            disabled={teamIdx === TEAM_NAMES.length - 1}
            className="text-sm font-semibold text-gray-400 hover:text-[#111827] disabled:opacity-30 transition-colors px-2 py-1"
          >
            Next →
          </button>
        </div>

        {/* Slots */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {slots.map((player, i) => (
            <div
              key={i}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all
                ${player ? "text-[#111827]" : "bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400"}`}
              style={player ? { background: "#84cc16" } : {}}
            >
              <span className="text-[10px] font-bold opacity-60 w-6 shrink-0">{POSITIONS[i]}</span>
              <span className="truncate">{player ?? "—"}</span>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-center text-sm font-semibold mb-3 ${feedback.ok ? "text-teal-600" : "text-red-500"}`}>
            {feedback.msg}
          </p>
        )}

        {/* Input */}
        {!gameOver && (
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => { if (!started) setStarted(true); setInput(e.target.value); }}
              onKeyDown={handleKey}
              placeholder={
                teamDone
                  ? "Team complete! Navigate to next →"
                  : started
                    ? "Type a player's name…"
                    : "Press Enter or click Start"
              }
              disabled={gameOver || teamDone}
              className="flex-1 bg-white border-2 border-gray-200 focus:border-[#84cc16] rounded-xl px-4 py-3 text-base font-medium outline-none transition-colors disabled:opacity-50 text-[#111827] placeholder-gray-400"
              autoComplete="off"
              spellCheck={false}
            />
            {!started ? (
              <button
                onClick={() => { setStarted(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold px-5 py-3 rounded-xl transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={tryGuess}
                disabled={teamDone}
                className="bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold px-5 py-3 rounded-xl transition-colors disabled:opacity-40"
              >
                Enter
              </button>
            )}
          </div>
        )}

        {started && !gameOver && (
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{guessedHere.length}/{SLOTS} for this team</span>
            <button onClick={skip} disabled={teamIdx === TEAM_NAMES.length - 1} className="text-gray-400 hover:text-gray-600 font-semibold disabled:opacity-30">
              Skip team →
            </button>
          </div>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="mt-4 text-center py-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
            <div className="text-4xl mb-2">{teamsCompleted === 30 ? "🏆" : "⏱️"}</div>
            <h2 className="text-xl font-bebas tracking-widest text-[#111827] mb-1">Time&apos;s up!</h2>
            <p className="text-sm text-gray-500 mb-1">{totalGuessed} / 180 players named</p>
            <p className="text-sm text-gray-500 mb-5">{teamsCompleted} / 30 teams completed</p>
            <button onClick={restart} className="bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold px-6 py-2.5 rounded-xl transition-colors">
              Play Again
            </button>
            {/* Per-team breakdown */}
            <div className="mt-6 grid grid-cols-2 gap-1.5 text-left max-h-64 overflow-y-auto">
              {TEAM_NAMES.map(t => (
                <div key={t} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${guessedPerTeam[t].length >= SLOTS ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-gray-50 text-gray-400"}`}>
                  <span className="font-medium truncate pr-2">{t.replace(/^(Los Angeles|New York|New Orleans|San Antonio|Oklahoma City|Golden State|Portland Trail|Sacramento|Golden State) /, m => m.slice(0, 2) + ".")}</span>
                  <span className="font-bold tabular-nums shrink-0">{Math.min(guessedPerTeam[t].length, SLOTS)}/6</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!started && !gameOver && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Type first name, last name, or full name · Navigate between teams freely · Skip anytime
          </p>
        )}
      </main>
    </div>
  );
}
