"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import GameHeader from "@/app/components/GameHeader";
import { DRAFT_CLASSES } from "@/lib/draftClassData";

const SLOTS = 5;
const TIME_LIMIT = 12 * 60;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/['.]/g, "").replace(/\s+jr\s*$|\s+sr\s*$/, "").trim();
}

function findPlayerMatch(
  input: string,
  players: string[],
  guessed: string[]
): string | "ambiguous" | null {
  const norm = normalize(input);
  if (norm.length < 2) return null;
  const remaining = players.filter(p => !guessed.includes(p));

  const exact = remaining.find(p => normalize(p) === norm);
  if (exact) return exact;

  const wordMatches = remaining.filter(p =>
    normalize(p).split(" ").some(w => w === norm)
  );
  if (wordMatches.length === 1) return wordMatches[0];
  if (wordMatches.length > 1) return "ambiguous";

  if (norm.length >= 3) {
    const prefixMatches = remaining.filter(p =>
      normalize(p).split(" ").some(w => w.startsWith(norm))
    );
    if (prefixMatches.length === 1) return prefixMatches[0];
    if (prefixMatches.length > 1) return "ambiguous";
  }

  return null;
}

export default function DraftClassPage() {
  const [classIdx, setClassIdx] = useState(0);
  const [guessedPerYear, setGuessedPerYear] = useState<Record<number, string[]>>(
    () => Object.fromEntries(DRAFT_CLASSES.map(d => [d.year, []]))
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

  const draftClass = DRAFT_CLASSES[classIdx];
  const guessedHere = guessedPerYear[draftClass.year];
  const classDone = guessedHere.length >= SLOTS;
  const totalGuessed = Object.values(guessedPerYear).reduce((s, g) => s + Math.min(g.length, SLOTS), 0);
  const classesCompleted = DRAFT_CLASSES.filter(d => guessedPerYear[d.year].length >= SLOTS).length;
  const totalPossible = DRAFT_CLASSES.length * SLOTS;

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 1500);
  }

  function tryGuess() {
    if (!input.trim()) return;
    if (normalize(input) === normalize(draftClass.hint)) {
      showFeedback("That's the hint — doesn't count as a guess!", false);
      return;
    }
    const result = findPlayerMatch(input, draftClass.players, guessedHere);
    if (result === "ambiguous") {
      showFeedback("Be more specific (multiple matches)", false);
      return;
    }
    if (result) {
      setGuessedPerYear(prev => ({
        ...prev,
        [draftClass.year]: [...prev[draftClass.year], result],
      }));
      showFeedback(`✓ ${result}`, true);
      setInput("");
      if (guessedHere.length + 1 >= SLOTS && classIdx < DRAFT_CLASSES.length - 1) {
        setTimeout(() => setClassIdx(i => i + 1), 600);
      }
    } else {
      showFeedback("Not from this class — try another name", false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (!started) { setStarted(true); setTimeout(() => inputRef.current?.focus(), 50); return; }
      tryGuess();
    }
  }

  function skip() {
    if (classIdx < DRAFT_CLASSES.length - 1) {
      setClassIdx(i => i + 1);
      setInput("");
      inputRef.current?.focus();
    }
  }

  function prev() {
    if (classIdx > 0) { setClassIdx(i => i - 1); setInput(""); }
  }

  function restart() {
    setClassIdx(0);
    setGuessedPerYear(Object.fromEntries(DRAFT_CLASSES.map(d => [d.year, []])));
    setInput(""); setTimeLeft(TIME_LIMIT); setStarted(false); setGameOver(false); setFeedback(null);
  }

  const slots = Array.from({ length: SLOTS }, (_, i) => guessedHere[i] ?? null);

  return (
    <div className="min-h-screen">
      <GameHeader title="Draft Class Challenge" />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Top stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <div className={`text-2xl font-black tabular-nums ${timeLeft <= 60 && started && !gameOver ? "text-red-500" : "text-white"}`}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide">Time Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-teal-400 tabular-nums">{totalGuessed}/{totalPossible}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-white/80 tabular-nums">{classesCompleted}/{DRAFT_CLASSES.length}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wide">Classes Done</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/8 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${(totalGuessed / totalPossible) * 100}%` }}
          />
        </div>

        {/* Year nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            disabled={classIdx === 0}
            className="text-sm font-semibold text-white/45 hover:text-white disabled:opacity-30 transition-colors px-2 py-1"
          >
            ← Prev
          </button>
          <div className="text-center">
            <div className={`text-4xl font-black tabular-nums tracking-tight ${classDone ? "text-teal-400" : "text-white"}`}>
              {draftClass.year} {classDone && "✓"}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">NBA Draft Class</div>
          </div>
          <button
            onClick={skip}
            disabled={classIdx === DRAFT_CLASSES.length - 1}
            className="text-sm font-semibold text-white/45 hover:text-white disabled:opacity-30 transition-colors px-2 py-1"
          >
            Next →
          </button>
        </div>

        {/* Hint */}
        <div className="bg-amber-500/10 border border-amber-400/25 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest shrink-0">Hint</span>
          <span className="text-white font-semibold">{draftClass.hint}</span>
          <span className="text-white/30 text-xs ml-auto shrink-0">doesn&apos;t count</span>
        </div>

        {/* Slots */}
        <div className="space-y-2 mb-5">
          {slots.map((player, i) => (
            <div
              key={i}
              className={`rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-3 transition-all duration-300
                ${player ? "bg-teal-500 text-white" : "bg-white/6 border-2 border-dashed border-white/10 text-white/30"}`}
            >
              <span className="text-[11px] font-bold opacity-60 w-4 shrink-0">{i + 1}</span>
              <span className="truncate">{player ?? "—"}</span>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-center text-sm font-semibold mb-3 ${feedback.ok ? "text-teal-400" : "text-red-500"}`}>
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
                classDone
                  ? "Class complete! Navigate to next →"
                  : started
                    ? "Type a player from this draft class…"
                    : "Press Enter or click Start"
              }
              disabled={gameOver || classDone}
              className="flex-1 bg-white/6 border-2 border-white/10 focus:border-teal-500 rounded-xl px-4 py-3 text-base font-medium outline-none transition-colors disabled:opacity-50"
              autoComplete="off"
              spellCheck={false}
            />
            {!started ? (
              <button
                onClick={() => { setStarted(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-5 py-3 rounded-xl transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={tryGuess}
                disabled={classDone}
                className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-5 py-3 rounded-xl transition-colors disabled:opacity-40"
              >
                Enter
              </button>
            )}
          </div>
        )}

        {started && !gameOver && (
          <div className="flex justify-between items-center text-xs text-white/40">
            <span>{guessedHere.length}/{SLOTS} for this class</span>
            <button onClick={skip} disabled={classIdx === DRAFT_CLASSES.length - 1} className="text-white/45 hover:text-white/80 font-semibold disabled:opacity-30">
              Skip class →
            </button>
          </div>
        )}

        {/* Game over */}
        {gameOver && (
          <div className="mt-4 text-center py-6 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-4xl mb-2">{classesCompleted === DRAFT_CLASSES.length ? "🏆" : "⏱️"}</div>
            <h2 className="text-xl font-bold text-white mb-1">
              {classesCompleted === DRAFT_CLASSES.length ? "Perfect score!" : "Time's up!"}
            </h2>
            <p className="text-sm text-white/45 mb-1">{totalGuessed} / {totalPossible} players named</p>
            <p className="text-sm text-white/45 mb-5">{classesCompleted} / {DRAFT_CLASSES.length} classes completed</p>
            <button onClick={restart} className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
              Play Again
            </button>
            <div className="mt-6 grid grid-cols-2 gap-1.5 text-left max-h-64 overflow-y-auto px-2">
              {DRAFT_CLASSES.map(dc => (
                <div key={dc.year} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${guessedPerYear[dc.year].length >= SLOTS ? "bg-teal-500/20 text-teal-300 border border-teal-400/20" : "bg-white/5 text-white/40"}`}>
                  <span className="font-medium">{dc.year} Draft</span>
                  <span className="font-bold tabular-nums shrink-0">{Math.min(guessedPerYear[dc.year].length, SLOTS)}/5</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!started && !gameOver && (
          <p className="text-center text-xs text-white/40 mt-4">
            Name 5 players from each class · The hint player doesn&apos;t count · Navigate freely · 2010–2025
          </p>
        )}
      </main>
    </div>
  );
}
