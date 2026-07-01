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
    if (nextIdx + 1 >= deck.length) {
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f0e6" }}>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Higher or Lower" />

      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-10 pb-20">

        {/* Category tabs */}
        <div className="border-2 border-[#111827] mb-6 overflow-x-auto">
          <div className="flex">
            {HL_CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => switchCategory(i)}
                className="shrink-0 px-5 py-3 font-mono font-bold text-xs uppercase tracking-[0.1em] transition-colors"
                style={{
                  background: i === catIdx ? "#111827" : "#f4f0e6",
                  color: i === catIdx ? "#84cc16" : "#111827",
                  borderRight: i < HL_CATEGORIES.length - 1 ? "2px solid #111827" : undefined,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Streak banner */}
        <div className="border-2 border-[#111827] mb-8" style={{ background: "#111827" }}>
          <div className="flex items-center justify-between px-8 py-5">
            <div>
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-1">Current Streak</p>
              <div className="font-playfair font-black tabular-nums" style={{ fontSize: "3rem", color: "#84cc16", lineHeight: 1 }}>{streak}</div>
            </div>
            <div className="text-center">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">{category.description}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-1">Best Streak</p>
              <div className="font-playfair font-black tabular-nums" style={{ fontSize: "3rem", color: "#6b7280", lineHeight: 1 }}>{best}</div>
            </div>
          </div>
        </div>

        {/* Player cards */}
        <div className="grid grid-cols-2 gap-0 border-2 border-[#111827] mb-6">
          {/* Current player */}
          <div style={{ borderRight: "2px solid #111827" }}>
            {/* Dark top: name */}
            <div className="px-6 py-5" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">Current</p>
              <p className="font-playfair font-black text-white leading-tight" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "-0.02em" }}>
                {current.name}
              </p>
              <p className="font-mono text-xs text-gray-400 mt-1">{current.hint}</p>
            </div>
            {/* Cream bottom: stat value */}
            <div className="px-6 py-5" style={{ background: "#f4f0e6" }}>
              <p className="font-playfair font-black tabular-nums" style={{ fontSize: "3.5rem", color: "#84cc16", lineHeight: 1 }}>
                {formatValue(current.value, category.format)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                {category.unit}
              </p>
            </div>
          </div>

          {/* Challenger */}
          <div>
            {/* Dark top: name */}
            <div className="px-6 py-5 relative" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] mb-2"
                style={{ color: phase === "revealed" ? (isCorrect ? "#84cc16" : "#ef4444") : "#a78bfa" }}>
                Challenger
              </p>
              <p className="font-playfair font-black text-white leading-tight" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", letterSpacing: "-0.02em" }}>
                {challenger.name}
              </p>
              <p className="font-mono text-xs text-gray-400 mt-1">{challenger.hint}</p>

              {phase === "revealed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-4 right-4 font-playfair font-black text-3xl"
                  style={{ color: isTie ? "#f59e0b" : isCorrect ? "#84cc16" : "#ef4444" }}
                >
                  {isTie ? "=" : isCorrect ? "✓" : "✗"}
                </motion.div>
              )}
            </div>
            {/* Cream bottom: stat value */}
            <div className="px-6 py-5" style={{ background: "#f4f0e6" }}>
              <AnimatePresence mode="wait">
                {phase === "guessing" ? (
                  <motion.div
                    key="hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="font-playfair font-black tabular-nums" style={{ fontSize: "3.5rem", color: "#8b5cf6", lineHeight: 1 }}>???</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-1">
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
                      className="font-playfair font-black tabular-nums"
                      style={{ fontSize: "3.5rem", lineHeight: 1, color: isCorrect ? "#84cc16" : "#ef4444" }}
                    >
                      {formatValue(challenger.value, category.format)}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-1">
                      {category.unit}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        <AnimatePresence>
          {phase === "revealed" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-mono font-bold text-sm mb-4 uppercase tracking-[0.1em]"
              style={{ color: isTie ? "#f59e0b" : isCorrect ? "#84cc16" : "#ef4444" }}
            >
              {isTie
                ? "It's a tie — both correct!"
                : isCorrect
                  ? `Correct! Streak: ${streak}`
                  : `Wrong — ${challenger.name} has ${formatValue(challenger.value, category.format)} ${category.unit}`}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Guess buttons */}
        {phase === "guessing" && (
          <div className="grid grid-cols-2 gap-0 border-2 border-[#111827]">
            <motion.button
              onClick={() => guess("lower")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="py-6 font-mono font-bold text-lg flex flex-col items-center gap-1 uppercase tracking-[0.1em]"
              style={{ background: "#111827", color: "white", borderRight: "2px solid #111827" }}
            >
              <span className="text-2xl">↓</span>
              <span>Lower</span>
            </motion.button>
            <motion.button
              onClick={() => guess("higher")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="py-6 font-mono font-bold text-lg flex flex-col items-center gap-1 uppercase tracking-[0.1em]"
              style={{ background: "#84cc16", color: "#111827" }}
            >
              <span className="text-2xl">↑</span>
              <span>Higher</span>
            </motion.button>
          </div>
        )}

        {phase === "revealed" && isCorrect && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={next}
            className="w-full py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] transition-colors"
            style={{
              background: "#84cc16",
              color: "#111827",
            }}
          >
            Next →
          </motion.button>
        )}

        {phase === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-[#111827]"
            style={{ background: "#111827" }}
          >
            {/* Dark header */}
            <div className="px-6 py-5 text-center" style={{ borderBottom: "2px solid #84cc16" }}>
              <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-2">Defeat</p>
              <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}>
                Streak<br />Broken.
              </h2>
            </div>
            {/* Cream content */}
            <div className="px-6 py-5 text-center" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-xs text-gray-500 mb-1 uppercase tracking-[0.1em]">Final streak: <span className="font-bold text-[#111827]">{streak}</span></p>
              <p className="font-mono text-xs text-gray-500 mb-5 uppercase tracking-[0.1em]">Best: <span className="font-bold text-[#111827]">{best}</span></p>
              <button
                onClick={restart}
                className="px-10 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] transition-colors"
                style={{ background: "#84cc16", color: "#111827" }}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {phase === "guessing" && (
          <p className="text-center font-mono text-xs text-gray-400 mt-5">
            Does {challenger.name} have a higher or lower {category.label} than {current.name}?
          </p>
        )}
      </main>
    </div>
  );
}
