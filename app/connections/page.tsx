"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import {
  CONNECTIONS_PUZZLES,
  type ConnectionCategory,
  type ConnectionColor,
  type ConnectionPuzzle,
} from "@/lib/connectionsData";
import { getDailyIndex, getTodayStr } from "@/lib/dailyUtils";

const MAX_LIVES = 4;
const STORAGE_KEY = "courtside_connections_v1";

type SavedState = {
  date: string;
  puzzleId: number;
  solvedColors: ConnectionColor[];
  livesLeft: number;
  gameOver: boolean;
};

const COLOR_HEX: Record<ConnectionColor, { bg: string; text: string; border: string }> = {
  yellow: { bg: "#f59e0b", text: "#000", border: "#d97706" },
  green:  { bg: "#22c55e", text: "#fff", border: "#16a34a" },
  blue:   { bg: "#3b82f6", text: "#fff", border: "#2563eb" },
  purple: { bg: "#a855f7", text: "#fff", border: "#9333ea" },
};

const COLOR_ORDER: ConnectionColor[] = ["yellow", "green", "blue", "purple"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPuzzle(): ConnectionPuzzle {
  return CONNECTIONS_PUZZLES[getDailyIndex(CONNECTIONS_PUZZLES.length)];
}

export default function ConnectionsPage() {
  const [puzzle, setPuzzle] = useState<ConnectionPuzzle | null>(null);
  const [tiles, setTiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [solvedColors, setSolvedColors] = useState<ConnectionColor[]>([]);
  const [livesLeft, setLivesLeft] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [revealedAll, setRevealedAll] = useState(false);

  useEffect(() => {
    const p = getPuzzle();
    setPuzzle(p);

    const allNames = p.categories.flatMap(c => c.members);

    // Load saved state
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: SavedState = JSON.parse(raw);
        if (saved.date === getTodayStr() && saved.puzzleId === p.id) {
          setSolvedColors(saved.solvedColors);
          setLivesLeft(saved.livesLeft);
          setGameOver(saved.gameOver);
          if (saved.gameOver) setRevealedAll(true);

          // Keep unsolved tiles in grid
          const solvedSet = new Set(
            p.categories.filter(c => saved.solvedColors.includes(c.color)).flatMap(c => c.members)
          );
          const remaining = allNames.filter(n => !solvedSet.has(n));
          setTiles(shuffle(remaining));
          return;
        }
      }
    } catch { /* ignore */ }

    setTiles(shuffle(allNames));
  }, []);

  function save(sc: ConnectionColor[], ll: number, go: boolean) {
    if (!puzzle) return;
    const state: SavedState = {
      date: getTodayStr(), puzzleId: puzzle.id,
      solvedColors: sc, livesLeft: ll, gameOver: go,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }

  function categoryOf(name: string): ConnectionCategory | undefined {
    return puzzle?.categories.find(c => c.members.includes(name));
  }

  function toggleSelect(name: string) {
    if (gameOver || solvedColors.includes(categoryOf(name)?.color ?? "yellow")) return;
    setSelected(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length >= 4) return prev;
      return [...prev, name];
    });
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  function showFeedback(msg: string, ok: boolean) {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 1800);
  }

  function submit() {
    if (selected.length !== 4 || !puzzle) return;

    // Check if all 4 belong to the same category
    const firstCat = categoryOf(selected[0]);
    const allSame = firstCat && selected.every(n => categoryOf(n)?.color === firstCat.color);

    if (allSame && firstCat) {
      const newSolved = [...solvedColors, firstCat.color];
      const newLives = livesLeft;
      const won = newSolved.length === puzzle.categories.length;
      const go = won;

      setSolvedColors(newSolved);
      setTiles(prev => prev.filter(n => !firstCat.members.includes(n)));
      setSelected([]);
      showFeedback(`${firstCat.title}`, true);
      if (go) {
        setGameOver(true);
        setRevealedAll(true);
      }
      save(newSolved, newLives, go);
    } else {
      // Wrong guess — check if one away
      if (puzzle && firstCat) {
        const counts = new Map<string, number>();
        selected.forEach(n => {
          const c = categoryOf(n)?.color ?? "";
          counts.set(c, (counts.get(c) ?? 0) + 1);
        });
        const maxCount = Math.max(...counts.values());
        if (maxCount === 3) {
          showFeedback("One away!", false);
        } else {
          showFeedback("Not quite — try again", false);
        }
      }
      triggerShake();
      const newLives = livesLeft - 1;
      setLivesLeft(newLives);
      setSelected([]);
      if (newLives <= 0) {
        setGameOver(true);
        setRevealedAll(true);
        save(solvedColors, 0, true);
      } else {
        save(solvedColors, newLives, false);
      }
    }
  }

  function restart() {
    if (!puzzle) return;
    const allNames = puzzle.categories.flatMap(c => c.members);
    setTiles(shuffle(allNames));
    setSelected([]);
    setSolvedColors([]);
    setLivesLeft(MAX_LIVES);
    setGameOver(false);
    setRevealedAll(false);
    setFeedback(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  const visibleTiles = revealedAll
    ? []
    : tiles.filter(n => !solvedColors.includes(categoryOf(n)?.color ?? "yellow"));

  // Sort solved categories in color order
  const sortedSolved = COLOR_ORDER.filter(c => solvedColors.includes(c)).map(c =>
    puzzle?.categories.find(cat => cat.color === c)!
  );

  // Unsolved categories for reveal-all
  const unsolvedCategories = revealedAll
    ? COLOR_ORDER.filter(c => !solvedColors.includes(c)).map(c =>
        puzzle?.categories.find(cat => cat.color === c)!
      ).filter(Boolean)
    : [];

  const won = puzzle ? solvedColors.length === puzzle.categories.length : false;

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f0e6" }}>
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          15%{transform:translateX(-10px)}
          30%{transform:translateX(10px)}
          45%{transform:translateX(-8px)}
          60%{transform:translateX(8px)}
          75%{transform:translateX(-4px)}
          90%{transform:translateX(4px)}
        }
        .shake { animation: shake 0.55s ease; }
      `}</style>

      <GameHeader title="NBA Connections" />

      <main className="max-w-5xl mx-auto px-6 py-10 pb-20">

        {/* Header: title + meta */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-[#84cc16] mb-3">Daily Puzzle</p>
            <h1 className="font-playfair font-black italic text-[#111827]" style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", letterSpacing: "-0.02em", lineHeight: 0.9 }}>
              NBA<br />Connections
            </h1>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold uppercase tracking-[0.2em] text-[10px] text-gray-400 mb-2">
              {getTodayStr()} · Puzzle #{puzzle.id + 1}
            </p>
            <p className="font-mono font-bold text-[#111827] text-sm">
              {solvedColors.length} / {puzzle.categories.length} solved
            </p>
          </div>
        </div>

        {/* Lives */}
        <div className="mb-6">
          <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] text-gray-400 mb-2">Lives Left</p>
          <div className="flex gap-2">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 border-2 transition-all duration-300"
                style={{
                  borderColor: "#111827",
                  background: i < livesLeft ? "#84cc16" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ borderTop: "2px solid #111827", marginBottom: "24px" }} />

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center font-mono font-bold text-sm mb-4 uppercase tracking-[0.1em]"
              style={{ color: feedback.ok ? "#84cc16" : "#ef4444" }}
            >
              {feedback.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solved category banners */}
        {(sortedSolved.length > 0 || unsolvedCategories.length > 0) && (
          <div className="flex flex-col mb-4" style={{ border: "2px solid #111827" }}>
            {sortedSolved.map((cat, i) => (
              <motion.div
                key={cat.color}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="px-6 py-4 text-center"
                style={{
                  background: COLOR_HEX[cat.color].bg,
                  color: COLOR_HEX[cat.color].text,
                  borderBottom: i < sortedSolved.length - 1 || unsolvedCategories.length > 0 ? "2px solid #111827" : undefined,
                }}
              >
                <p className="font-mono font-bold text-sm uppercase tracking-[0.2em] leading-tight">{cat.title}</p>
                <p className="font-mono text-xs opacity-75 mt-1">{cat.members.join(" · ")}</p>
              </motion.div>
            ))}
            {unsolvedCategories.map((cat, i) => (
              <motion.div
                key={cat.color}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="px-6 py-4 text-center opacity-50"
                style={{
                  background: COLOR_HEX[cat.color].bg,
                  color: COLOR_HEX[cat.color].text,
                  borderBottom: i < unsolvedCategories.length - 1 ? "2px solid #111827" : undefined,
                }}
              >
                <p className="font-mono font-bold text-sm uppercase tracking-[0.2em] leading-tight">{cat.title}</p>
                <p className="font-mono text-xs opacity-75 mt-1">{cat.members.join(" · ")}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tile grid */}
        {!revealedAll && (
          <div className={`grid grid-cols-4 gap-2.5 mb-6 ${shake ? "shake" : ""}`}>
            <AnimatePresence>
              {visibleTiles.map(name => {
                const isSel = selected.includes(name);
                return (
                  <motion.button
                    key={name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => toggleSelect(name)}
                    className="py-7 px-3 text-center font-mono font-bold text-sm transition-colors duration-150 leading-tight border-2"
                    style={{
                      background: isSel ? "#84cc16" : "white",
                      borderColor: isSel ? "#65a30d" : "#111827",
                      color: "#111827",
                    }}
                  >
                    {name}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Action buttons */}
        {!gameOver && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="flex-1 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] bg-white text-[#111827] hover:bg-gray-100 transition-colors disabled:opacity-30"
            >
              Deselect All
            </button>
            <button
              onClick={submit}
              disabled={selected.length !== 4}
              className="flex-1 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 transition-colors disabled:opacity-30"
              style={selected.length === 4
                ? { background: "#111827", borderColor: "#111827", color: "#84cc16" }
                : { background: "#f4f0e6", borderColor: "#d1d5db", color: "#9ca3af" }}
            >
              Submit ({selected.length}/4)
            </button>
          </div>
        )}

        {/* Game over panel */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="mt-4 border-2 border-[#111827] overflow-hidden"
          >
            <div className="px-8 py-6 text-center" style={{ background: won ? "#84cc16" : "#111827" }}>
              <p className="font-mono font-bold uppercase tracking-[0.35em] text-[10px] mb-3" style={{ color: won ? "#111827" : "#84cc16" }}>
                {won ? "Well Done" : "Game Over"}
              </p>
              <h2 className="font-playfair font-black italic" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em", lineHeight: 0.9, color: won ? "#111827" : "#ffffff" }}>
                {won ? "Genius!" : "Better Luck\nTomorrow"}
              </h2>
            </div>
            <div className="px-8 py-6 text-center" style={{ background: won ? "#f4f0e6" : "#f4f0e6" }}>
              <p className="font-mono text-sm text-gray-500 mb-6">
                {won
                  ? `Solved with ${MAX_LIVES - livesLeft} mistake${MAX_LIVES - livesLeft === 1 ? "" : "s"}`
                  : `${solvedColors.length} / ${puzzle.categories.length} categories solved`}
              </p>
              <button
                onClick={restart}
                className="px-12 py-4 font-mono font-bold uppercase tracking-[0.2em] text-sm border-2 border-[#111827] bg-[#111827] text-[#84cc16] hover:bg-[#1f2937] transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        {!gameOver && solvedColors.length === 0 && (
          <p className="text-center font-mono text-xs text-gray-400 mt-2">
            Select 4 players that share a connection · Yellow = easiest · Purple = hardest
          </p>
        )}
      </main>
    </div>
  );
}
