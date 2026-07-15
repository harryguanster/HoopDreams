"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import { LINEUPS, POSITION_COORDS, type LineupTeam, type LineupPlayer } from "@/lib/lineupData";

// ─── Types ────────────────────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";
type Phase = "pick" | "play" | "won" | "lost";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sort players by PPG desc; easy=top star, medium=3rd, hard=lowest scorer
function getMysteryIdx(lineup: LineupTeam, diff: Difficulty): number {
  const ranked = [...lineup.players]
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => b.ppg - a.ppg);
  if (diff === "easy") return ranked[0].i;
  if (diff === "medium") return ranked[2].i;
  return ranked[ranked.length - 1].i;
}

function getClues(p: LineupPlayer): string[] {
  return [
    `Plays ${p.position}`,
    `Wore jersey #${p.number}`,
    `Averaged ${p.ppg} PPG this season`,
    `${p.rpg} RPG · ${p.apg} APG`,
    `Name: "${p.name[0]}${p.name.length > 1 ? "·".repeat(p.name.length - 1) : ""}"`,
  ];
}

function isCorrect(guess: string, player: LineupPlayer): boolean {
  const g = guess.toLowerCase().trim();
  const n = player.name.toLowerCase();
  if (g.length < 2) return false;
  return n.includes(g) || g.includes(n);
}

const MAX_GUESSES = 3;
const DIFF_CONFIG = {
  easy:   { label: "Easy",   color: "#84cc16", bg: "#84cc16", textColor: "#111827", sub: "The franchise star is missing" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#f59e0b", textColor: "#111827", sub: "A key contributor is missing" },
  hard:   { label: "Hard",   color: "#ef4444", bg: "#111827", textColor: "#ffffff", sub: "A role player is missing" },
} as const;

// ─── Court SVG ────────────────────────────────────────────────────────────────
function HalfCourtSVG() {
  return (
    <svg viewBox="0 0 500 420" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="500" height="420" fill="#c89648" />
      {Array.from({ length: 22 }, (_, i) => i * 20).map((y) => (
        <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#b88438" strokeWidth="0.6" opacity="0.5" />
      ))}
      <rect x="10" y="10" width="480" height="400" fill="none" stroke="white" strokeWidth="3" />
      <rect x="170" y="258" width="160" height="152" fill="rgba(180,110,30,0.35)" stroke="white" strokeWidth="2.5" />
      <line x1="170" y1="258" x2="330" y2="258" stroke="white" strokeWidth="2.5" />
      <path d="M 190 258 A 60 60 0 0 1 310 258" fill="none" stroke="white" strokeWidth="2" />
      <path d="M 190 258 A 60 60 0 0 0 310 258" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      <line x1="46" y1="410" x2="46" y2="258" stroke="white" strokeWidth="2.5" />
      <line x1="454" y1="410" x2="454" y2="258" stroke="white" strokeWidth="2.5" />
      <path d="M 46 258 A 237.5 237.5 0 0 0 454 258" fill="none" stroke="white" strokeWidth="2.5" />
      <path d="M 220 410 A 30 30 0 0 1 280 410" fill="none" stroke="white" strokeWidth="2" />
      <line x1="218" y1="402" x2="282" y2="402" stroke="white" strokeWidth="3.5" />
      <circle cx="250" cy="384" r="11" fill="none" stroke="white" strokeWidth="2.5" />
      <path d="M 182 10 A 68 68 0 0 0 318 10" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 5" />
    </svg>
  );
}

// ─── Player chips on court ────────────────────────────────────────────────────
function KnownChip({ player }: { player: LineupPlayer }) {
  const pos = POSITION_COORDS[player.position];
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
        style={{ background: "#111827" }}
      >
        <span className="font-playfair font-black text-white text-xs">#{player.number}</span>
      </div>
      <div
        className="mt-1 px-2 py-0.5 text-center rounded"
        style={{ background: "rgba(255,255,255,0.9)" }}
      >
        <p className="font-mono font-bold text-[#111827] leading-none" style={{ fontSize: "9px" }}>{player.name}</p>
        <p className="font-mono text-[#84cc16] font-bold leading-none" style={{ fontSize: "7px" }}>{player.ppg} PPG</p>
      </div>
    </div>
  );
}

function MysteryChip({ position, revealed, revealedName }: { position: string; revealed: boolean; revealedName?: string }) {
  const pos = POSITION_COORDS[position];
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <motion.div
        animate={!revealed ? { scale: [1, 1.08, 1], opacity: [1, 0.8, 1] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg"
        style={{
          background: revealed ? "#84cc16" : "#111827",
          borderColor: revealed ? "#84cc16" : "#ef4444",
          borderWidth: 3,
        }}
      >
        <span
          className="font-playfair font-black"
          style={{ color: revealed ? "#111827" : "#ef4444", fontSize: "1.4rem" }}
        >
          {revealed ? "✓" : "?"}
        </span>
      </motion.div>
      <div
        className="mt-1 px-2 py-0.5 text-center rounded"
        style={{ background: revealed ? "#84cc16" : "rgba(17,24,39,0.9)" }}
      >
        <p
          className="font-mono font-bold leading-none"
          style={{ fontSize: "9px", color: revealed ? "#111827" : "#ef4444" }}
        >
          {revealed ? revealedName : "?????"}
        </p>
        <p className="font-mono font-bold leading-none" style={{ fontSize: "7px", color: revealed ? "#111827" : "#6b7280" }}>
          {position}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LineupThiefPage() {
  const [phase, setPhase] = useState<Phase>("pick");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [order, setOrder] = useState<number[]>([]);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [cluesShown, setCluesShown] = useState(0);
  const [score, setScore] = useState({ wins: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrder(shuffle(LINEUPS.map((_, i) => i)));
  }, []);

  const lineup = order.length > 0 ? LINEUPS[order[puzzleIdx % order.length]] : null;
  const mysteryIdx = lineup ? getMysteryIdx(lineup, difficulty) : 0;
  const mysteryPlayer = lineup?.players[mysteryIdx];
  const clues = mysteryPlayer ? getClues(mysteryPlayer) : [];

  function startGame(diff: Difficulty) {
    setDifficulty(diff);
    setPhase("play");
    setGuesses([]);
    setInput("");
    setCluesShown(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleGuess(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !mysteryPlayer || phase !== "play") return;
    const raw = input.trim();
    setInput("");

    if (isCorrect(raw, mysteryPlayer)) {
      setScore(s => ({ wins: s.wins + 1, total: s.total + 1 }));
      setPhase("won");
      setCluesShown(5); // reveal all on win
    } else {
      const next = [...guesses, raw];
      setGuesses(next);
      if (next.length >= MAX_GUESSES) {
        setScore(s => ({ ...s, total: s.total + 1 }));
        setPhase("lost");
        setCluesShown(5);
      }
    }
  }

  function handleNext() {
    setPuzzleIdx(i => i + 1);
    setGuesses([]);
    setInput("");
    setCluesShown(0);
    setPhase("play");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleChangeDiff() {
    setPhase("pick");
    setGuesses([]);
    setInput("");
    setCluesShown(0);
  }

  if (!lineup || !mysteryPlayer) return null;

  const diff = DIFF_CONFIG[difficulty];
  const guessesLeft = MAX_GUESSES - guesses.length;
  const isPlaying = phase === "play";

  // ── DIFFICULTY PICKER ───────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
        <GameHeader title="Lineup Thief" />
        <main className="max-w-4xl mx-auto px-6 sm:px-10 py-12 pb-20">

          <div className="border-2 border-[#111827] mb-8" style={{ background: "#111827" }}>
            <div className="px-8 py-8 text-center" style={{ borderBottom: "2px solid #84cc16" }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#84cc16] mb-3">New Game</p>
              <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}>
                Choose Your<br />Difficulty.
              </h2>
            </div>
            <div className="px-8 py-6" style={{ background: "#f4f0e6" }}>
              <p className="font-mono text-sm text-gray-500 text-center mb-6">
                One player from a famous lineup is stolen. Name them using clues.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-[#111827]">
                {(["easy", "medium", "hard"] as Difficulty[]).map((d, i) => {
                  const cfg = DIFF_CONFIG[d];
                  return (
                    <motion.button
                      key={d}
                      onClick={() => startGame(d)}
                      whileHover={{ opacity: 0.88 }}
                      whileTap={{ scale: 0.97 }}
                      className="p-8 text-left"
                      style={{
                        background: cfg.bg,
                        color: cfg.textColor,
                        borderRight: i < 2 ? "2px solid #111827" : undefined,
                      }}
                    >
                      <span
                        className="inline-block font-mono text-[9px] uppercase tracking-[0.3em] font-bold px-2 py-0.5 border mb-4"
                        style={{ borderColor: cfg.textColor, color: cfg.textColor, opacity: 0.6 }}
                      >
                        {cfg.label}
                      </span>
                      <p
                        className="font-playfair font-black italic leading-tight mb-2"
                        style={{ fontSize: "1.8rem", letterSpacing: "-0.02em", color: cfg.textColor }}
                      >
                        {d === "easy" ? "The Star" : d === "medium" ? "The Role" : "The Ghost"}
                      </p>
                      <p className="font-mono text-xs leading-relaxed" style={{ color: cfg.textColor, opacity: 0.6 }}>
                        {cfg.sub}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {score.total > 0 && (
            <p className="font-mono text-xs text-center text-gray-400 uppercase tracking-widest">
              Session: {score.wins}/{score.total} correct
            </p>
          )}
        </main>
      </div>
    );
  }

  // ── GAME ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#f4f0e6" }}>
      <GameHeader title="Lineup Thief" />
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 pb-20">

        {/* Header bar */}
        <div className="border-2 border-[#111827] mb-4" style={{ background: "#111827" }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-0.5">{lineup.season}</p>
              <p className="font-playfair font-black text-white" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
                Who&apos;s missing?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-0.5">Score</p>
                <p className="font-playfair font-black" style={{ fontSize: "1.4rem", color: "#84cc16", lineHeight: 1 }}>
                  {score.wins}/{score.total}
                </p>
              </div>
              <span
                className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest font-bold border"
                style={{ borderColor: diff.color, color: diff.color }}
              >
                {diff.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border-2 border-[#111827]">

          {/* Court (3/5) */}
          <div className="lg:col-span-3" style={{ borderRight: "2px solid #111827" }}>
            <div className="relative w-full" style={{ aspectRatio: "500/420" }}>
              <HalfCourtSVG />
              {lineup.players.map((p, i) => {
                if (i === mysteryIdx) {
                  return (
                    <MysteryChip
                      key={p.position}
                      position={p.position}
                      revealed={phase === "won" || phase === "lost"}
                      revealedName={p.name}
                    />
                  );
                }
                return <KnownChip key={p.name} player={p} />;
              })}
            </div>
          </div>

          {/* Right panel (2/5) */}
          <div className="lg:col-span-2 flex flex-col" style={{ background: "#f4f0e6" }}>

            {/* Clues section */}
            <div style={{ borderBottom: "2px solid #111827" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#84cc16]">
                  Clues ({cluesShown}/{clues.length})
                </p>
                {isPlaying && cluesShown < clues.length && (
                  <button
                    onClick={() => setCluesShown(n => Math.min(n + 1, clues.length))}
                    className="font-mono text-[9px] uppercase tracking-widest font-bold px-3 py-1 border transition-colors"
                    style={{ borderColor: "#84cc16", color: "#84cc16" }}
                  >
                    + Reveal
                  </button>
                )}
              </div>
              <div className="px-4 py-3 space-y-2" style={{ minHeight: 130 }}>
                {cluesShown === 0 && (
                  <p className="font-mono text-xs text-gray-400 italic">No clues yet — take a guess or reveal one.</p>
                )}
                <AnimatePresence>
                  {clues.slice(0, cluesShown).map((clue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2"
                    >
                      <span className="font-mono text-[9px] font-bold mt-0.5" style={{ color: "#84cc16" }}>{i + 1}.</span>
                      <p className="font-mono text-xs text-[#111827] font-bold">{clue}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Guess area */}
            <div className="flex-1 px-4 py-4">
              {isPlaying ? (
                <>
                  <form onSubmit={handleGuess} className="flex border-2 border-[#111827] mb-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Player's last name…"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="flex-1 px-4 py-3 bg-white font-mono text-sm text-[#111827] placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="px-5 py-3 font-mono font-bold text-xs uppercase tracking-widest border-l-2 border-[#111827] transition-colors"
                      style={{ background: "#84cc16", color: "#111827" }}
                    >
                      Guess
                    </button>
                  </form>

                  {/* Guess feedback */}
                  <div className="space-y-1 mb-3">
                    {guesses.map((g, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-red-400 font-bold text-xs">✕</span>
                        <span className="font-mono text-xs text-red-400">{g}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Lives */}
                  <div className="flex gap-1.5 mb-3">
                    {Array.from({ length: MAX_GUESSES }).map((_, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 border-2"
                        style={{
                          background: i < MAX_GUESSES - guessesLeft ? "#ef4444" : "#84cc16",
                          borderColor: "#111827",
                        }}
                      />
                    ))}
                    <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400 ml-1 self-center">
                      {guessesLeft} left
                    </span>
                  </div>

                  <button
                    onClick={handleChangeDiff}
                    className="font-mono text-[9px] uppercase tracking-widest text-gray-400 underline"
                  >
                    Change difficulty
                  </button>
                </>
              ) : (
                /* Win / Loss result */
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  <div
                    className="border-2 border-[#111827] mb-4 p-4"
                    style={{ background: phase === "won" ? "#84cc16" : "#111827" }}
                  >
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.3em] mb-1"
                      style={{ color: phase === "won" ? "#111827" : "#84cc16" }}
                    >
                      {phase === "won" ? "Correct!" : "Nice try"}
                    </p>
                    <p
                      className="font-playfair font-black italic leading-tight"
                      style={{
                        fontSize: "1.6rem",
                        letterSpacing: "-0.02em",
                        color: phase === "won" ? "#111827" : "white",
                      }}
                    >
                      {mysteryPlayer.name}
                    </p>
                    <p
                      className="font-mono text-xs mt-1"
                      style={{ color: phase === "won" ? "#111827" : "#9ca3af" }}
                    >
                      {mysteryPlayer.position} · #{mysteryPlayer.number} · {mysteryPlayer.ppg} PPG
                    </p>
                    {phase === "won" && (
                      <p className="font-mono text-[9px] mt-1" style={{ color: "#111827", opacity: 0.6 }}>
                        {cluesShown === 0 ? "Cold! No clues needed." :
                          cluesShown <= 2 ? `Only ${cluesShown} clue${cluesShown > 1 ? "s" : ""}.` :
                          `Used ${cluesShown} clues.`}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <motion.button
                      onClick={handleNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-sm border-2 border-[#111827]"
                      style={{ background: "#84cc16", color: "#111827" }}
                    >
                      Next Lineup →
                    </motion.button>
                    <motion.button
                      onClick={handleChangeDiff}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-sm border-2 border-[#111827]"
                      style={{ background: "transparent", color: "#111827" }}
                    >
                      Change Difficulty
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 text-center mt-4">
          {difficulty === "easy" ? "The franchise star is missing" :
           difficulty === "medium" ? "A key role player is missing" :
           "The quietest player is missing — toughest to name"}
        </p>
      </main>
    </div>
  );
}
