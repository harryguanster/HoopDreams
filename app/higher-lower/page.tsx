"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import { HL_CATEGORIES, type HLCategory, type HLPlayer } from "@/lib/higherLowerData";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatValue(value: number, format: "decimal1" | "integer"): string {
  if (format === "integer") return value.toLocaleString();
  return value.toFixed(1);
}

function getBestKey(categoryId: string) {
  return `courtside_hl_best_${categoryId}`;
}

function loadBest(categoryId: string): number {
  if (typeof window === "undefined") return 0;
  try { return parseInt(localStorage.getItem(getBestKey(categoryId)) ?? "0", 10) || 0; }
  catch { return 0; }
}

function saveBest(categoryId: string, streak: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(getBestKey(categoryId), String(streak)); } catch { /* ignore */ }
}

type Phase = "idle" | "guessing" | "revealed" | "wrong";

export default function HigherLowerPage() {
  const [catIdx, setCatIdx] = useState(0);
  const [deck, setDeck] = useState<HLPlayer[]>([]);
  const [deckIdx, setDeckIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastGuess, setLastGuess] = useState<"higher" | "lower" | null>(null);
  const [mounted, setMounted] = useState(false);

  const category = HL_CATEGORIES[catIdx];

  const initGame = useCallback((cat: HLCategory) => {
    const shuffled = shuffle(cat.players);
    setDeck(shuffled);
    setDeckIdx(0);
    setPhase("guessing");
    setLastGuess(null);
  }, []);

  useEffect(() => {
    setMounted(true);
    setBest(loadBest(HL_CATEGORIES[catIdx].id));
    initGame(HL_CATEGORIES[catIdx]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchCategory(idx: number) {
    setCatIdx(idx);
    const cat = HL_CATEGORIES[idx];
    setBest(loadBest(cat.id));
    setStreak(0);
    initGame(cat);
  }

  const current = deck[deckIdx];
  const challenger = deck[deckIdx + 1];

  function guess(direction: "higher" | "lower") {
    if (phase !== "guessing" || !current || !challenger) return;
    setLastGuess(direction);

    const isHigher = challenger.value > current.value;
    const isLower = challenger.value < current.value;
    const isTie = challenger.value === current.value;

    const correct = isTie || (direction === "higher" && isHigher) || (direction === "lower" && isLower);
    setPhase("revealed");

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > best) {
        setBest(newStreak);
        saveBest(category.id, newStreak);
      }
    } else {
      setTimeout(() => setPhase("wrong"), 900);
    }
  }

  function next() {
    if (phase !== "revealed") return;
    const nextIdx = deckIdx + 1;
    // Check if we'd run out of cards
    if (nextIdx + 1 >= deck.length) {
      // Reshuffle keeping challenger as new current
      const remaining = shuffle(category.players.filter(p => p.name !== deck[nextIdx]?.name));
      setDeck([deck[nextIdx], ...remaining]);
      setDeckIdx(0);
    } else {
      setDeckIdx(nextIdx);
    }
    setPhase("guessing");
    setLastGuess(null);
  }

  function restart() {
    setStreak(0);
    initGame(category);
  }

  const isCorrect = phase === "revealed" && challenger && current
    ? (challenger.value === current.value) ||
      (lastGuess === "higher" && challenger.value > current.value) ||
      (lastGuess === "lower" && challenger.value < current.value)
    : null;

  const isTie = phase === "revealed" && challenger && current && challenger.value === current.value;

  if (!mounted || !current || !challenger) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/25 text-xs font-mono uppercase tracking-widest">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GameHeader title="Higher or Lower" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Category tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {HL_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => switchCategory(i)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
              style={{
                background: i === catIdx ? "#0d9488" : "rgba(255,255,255,0.06)",
                color: i === catIdx ? "#fff" : "rgba(255,255,255,0.45)",
                border: i === catIdx ? "1.5px solid #14b8a6" : "1.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Streak display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-3xl font-black text-teal-400 tabular-nums">{streak}</div>
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-wide">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-white/50 font-mono uppercase tracking-widest">{category.description}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white/50 tabular-nums">{best}</div>
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-wide">Best Streak</div>
          </div>
        </div>

        {/* Player cards */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Current player */}
          <div
            className="rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1.5px solid rgba(20,184,166,0.3)",
              minHeight: 160,
            }}
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-teal-400 mb-1">Current</p>
              <p
                className="font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.05em" }}
              >
                {current.name}
              </p>
              <p className="text-xs text-white/40">{current.hint}</p>
            </div>
            <div>
              <p className="text-3xl font-black text-teal-300 tabular-nums">
                {formatValue(current.value, category.format)}
              </p>
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-wide mt-0.5">
                {category.unit}
              </p>
            </div>
          </div>

          {/* Challenger */}
          <div
            className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
            style={{
              background:
                phase === "revealed"
                  ? isCorrect
                    ? "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(255,255,255,0.04) 100%)"
                    : "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(255,255,255,0.04) 100%)"
                  : "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(255,255,255,0.04) 100%)",
              border:
                phase === "revealed"
                  ? isCorrect
                    ? "1.5px solid rgba(34,197,94,0.4)"
                    : "1.5px solid rgba(239,68,68,0.4)"
                  : "1.5px solid rgba(168,85,247,0.3)",
              minHeight: 160,
            }}
          >
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest mb-1"
                style={{ color: phase === "revealed" ? (isCorrect ? "#4ade80" : "#f87171") : "#c4b5fd" }}>
                Challenger
              </p>
              <p
                className="font-bold text-white leading-tight mb-3"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.05em" }}
              >
                {challenger.name}
              </p>
              <p className="text-xs text-white/40">{challenger.hint}</p>
            </div>

            <AnimatePresence mode="wait">
              {phase === "guessing" ? (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="text-3xl font-black tabular-nums text-purple-400">???</p>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wide mt-0.5">
                    {category.unit}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="revealed"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                >
                  <p
                    className="text-3xl font-black tabular-nums"
                    style={{ color: isCorrect ? "#4ade80" : "#f87171" }}
                  >
                    {formatValue(challenger.value, category.format)}
                  </p>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wide mt-0.5">
                    {category.unit}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === "revealed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-3 right-3 text-lg font-black"
                style={{ color: isTie ? "#fbbf24" : isCorrect ? "#4ade80" : "#f87171" }}
              >
                {isTie ? "=" : isCorrect ? "✓" : "✗"}
              </motion.div>
            )}
          </div>
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {phase === "revealed" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm font-bold mb-4"
              style={{ color: isTie ? "#fbbf24" : isCorrect ? "#4ade80" : "#f87171" }}
            >
              {isTie
                ? "It's a tie — both correct!"
                : isCorrect
                  ? `Correct! Streak: ${streak}`
                  : `Wrong — ${challenger.name} has ${formatValue(challenger.value, category.format)} ${category.unit}`}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Buttons */}
        {phase === "guessing" && (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => guess("lower")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-4 rounded-2xl text-white font-bold text-lg flex flex-col items-center gap-1"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", border: "2px solid rgba(59,130,246,0.4)" }}
            >
              <span className="text-2xl">↓</span>
              <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", letterSpacing: "0.1em" }}>Lower</span>
            </motion.button>
            <motion.button
              onClick={() => guess("higher")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="py-4 rounded-2xl text-white font-bold text-lg flex flex-col items-center gap-1"
              style={{ background: "linear-gradient(135deg, #b45309, #d97706)", border: "2px solid rgba(245,158,11,0.4)" }}
            >
              <span className="text-2xl">↑</span>
              <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", letterSpacing: "0.1em" }}>Higher</span>
            </motion.button>
          </div>
        )}

        {phase === "revealed" && isCorrect && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={next}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all"
            style={{
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
              border: "2px solid rgba(20,184,166,0.4)",
              fontFamily: "var(--font-bebas)",
              fontSize: "1.3rem",
              letterSpacing: "0.12em",
            }}
          >
            Next →
          </motion.button>
        )}

        {phase === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl"
          >
            <p className="text-3xl mb-2">💔</p>
            <h2 className="text-xl font-bold text-white mb-1">Streak Broken</h2>
            <p className="text-sm text-white/50 mb-1">Final streak: {streak}</p>
            <p className="text-sm text-white/50 mb-5">Best: {best}</p>
            <button
              onClick={restart}
              className="bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {phase === "guessing" && (
          <p className="text-center text-xs text-white/30 mt-5">
            Does {challenger.name} have a higher or lower {category.label} than {current.name}?
          </p>
        )}
      </main>
    </div>
  );
}
