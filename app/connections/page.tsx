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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

        {/* Top row: lives + progress */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">Lives Left</p>
            <div className="flex gap-1.5">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full transition-all duration-300"
                  style={{ background: i < livesLeft ? "#a855f7" : "rgba(0,0,0,0.12)" }}
                />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono uppercase tracking-widest text-gray-400 mb-1">
              {getTodayStr()} · Puzzle #{puzzle.id + 1}
            </p>
            <p className="text-sm font-bold text-gray-500">
              {solvedColors.length} / {puzzle.categories.length} solved
            </p>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="text-center text-sm font-bold mb-3"
              style={{ color: feedback.ok ? "#4ade80" : "#f87171" }}
            >
              {feedback.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solved category banners */}
        <div className="flex flex-col gap-2 mb-3">
          {sortedSolved.map(cat => (
            <motion.div
              key={cat.color}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full rounded-xl px-4 py-3 text-center"
              style={{
                background: COLOR_HEX[cat.color].bg,
                color: COLOR_HEX[cat.color].text,
              }}
            >
              <p className="font-bold text-sm uppercase tracking-wide leading-tight">{cat.title}</p>
              <p className="text-xs opacity-75 mt-0.5">{cat.members.join(" · ")}</p>
            </motion.div>
          ))}

          {/* Revealed unsolved categories (game over) */}
          {unsolvedCategories.map(cat => (
            <motion.div
              key={cat.color}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full rounded-xl px-4 py-3 text-center opacity-60"
              style={{
                background: COLOR_HEX[cat.color].bg,
                color: COLOR_HEX[cat.color].text,
              }}
            >
              <p className="font-bold text-sm uppercase tracking-wide leading-tight">{cat.title}</p>
              <p className="text-xs opacity-75 mt-0.5">{cat.members.join(" · ")}</p>
            </motion.div>
          ))}
        </div>

        {/* Tile grid */}
        {!revealedAll && (
          <div className={`grid grid-cols-4 gap-2 mb-4 ${shake ? "shake" : ""}`}>
            <AnimatePresence>
              {visibleTiles.map(name => {
                const isSel = selected.includes(name);
                return (
                  <motion.button
                    key={name}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => toggleSelect(name)}
                    className="relative rounded-xl py-4 px-1 text-center text-xs sm:text-sm font-bold transition-colors duration-150 leading-tight"
                    style={{
                      background: isSel ? "#84cc16" : "white",
                      border: isSel ? "2px solid #65a30d" : "2px solid rgba(0,0,0,0.1)",
                      color: isSel ? "#111827" : "#111827",
                      minHeight: 64,
                    }}
                  >
                    {name}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Buttons */}
        {!gameOver && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-500 hover:text-[#111827] hover:border-gray-400 transition-colors disabled:opacity-30"
            >
              Deselect All
            </button>
            <button
              onClick={submit}
              disabled={selected.length !== 4}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-30"
              style={{
                background: selected.length === 4 ? "#a855f7" : "rgba(168,85,247,0.15)",
                color: "#fff",
                border: "2px solid rgba(168,85,247,0.4)",
              }}
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
            className="mt-4 text-center py-6 bg-white border border-gray-200 rounded-2xl shadow-sm"
          >
            <div className="text-4xl mb-3">{won ? "🏆" : "💔"}</div>
            <h2 className="text-xl font-bebas tracking-widest text-[#111827] mb-1">
              {won ? "Genius!" : "Better luck tomorrow"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {won
                ? `Solved in ${MAX_LIVES - livesLeft} mistake${MAX_LIVES - livesLeft === 1 ? "" : "s"}`
                : `${solvedColors.length} / ${puzzle.categories.length} categories solved`}
            </p>
            <button
              onClick={restart}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        {!gameOver && solvedColors.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Select 4 players that share a connection · Yellow = easiest · Purple = hardest
          </p>
        )}
      </main>
    </div>
  );
}
