"use client";

import { useState, useEffect } from "react";
import GameHeader from "@/app/components/GameHeader";
import { LINEUPS, POSITION_COORDS, LineupPlayer } from "@/lib/lineupData";

const MAX_GUESSES = 3;

function HalfCourtSVG() {
  return (
    <svg
      viewBox="0 0 500 420"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hardwood background */}
      <rect width="500" height="420" fill="#c89648" />
      {/* Wood grain */}
      {Array.from({ length: 22 }, (_, i) => i * 20).map((y) => (
        <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#b88438" strokeWidth="0.6" opacity="0.5" />
      ))}
      {/* Court boundary */}
      <rect x="10" y="10" width="480" height="400" fill="none" stroke="white" strokeWidth="3" />
      {/* Paint/Key */}
      <rect x="170" y="258" width="160" height="152" fill="rgba(180,110,30,0.35)" stroke="white" strokeWidth="2.5" />
      {/* Free throw line */}
      <line x1="170" y1="258" x2="330" y2="258" stroke="white" strokeWidth="2.5" />
      {/* Free throw circle — solid lower half (toward basket) */}
      <path d="M 190 258 A 60 60 0 0 1 310 258" fill="none" stroke="white" strokeWidth="2" />
      {/* Free throw circle — dashed upper half */}
      <path d="M 190 258 A 60 60 0 0 0 310 258" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
      {/* Three-point corner lines */}
      <line x1="46" y1="410" x2="46" y2="258" stroke="white" strokeWidth="2.5" />
      <line x1="454" y1="410" x2="454" y2="258" stroke="white" strokeWidth="2.5" />
      {/* Three-point arc */}
      <path d="M 46 258 A 237.5 237.5 0 0 0 454 258" fill="none" stroke="white" strokeWidth="2.5" />
      {/* Restricted area */}
      <path d="M 220 410 A 30 30 0 0 1 280 410" fill="none" stroke="white" strokeWidth="2" />
      {/* Backboard */}
      <line x1="218" y1="402" x2="282" y2="402" stroke="white" strokeWidth="3.5" />
      {/* Basket (hoop) */}
      <circle cx="250" cy="384" r="11" fill="none" stroke="white" strokeWidth="2.5" />
      {/* Center circle top half (half-court) */}
      <path d="M 182 10 A 68 68 0 0 0 318 10" fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 5" />
    </svg>
  );
}

function PlayerCard({ player, revealed }: { player: LineupPlayer; revealed: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pos = POSITION_COORDS[player.position];
  const showHeadshot = revealed && !!player.nbaId && !imgFailed;

  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {showHeadshot ? (
        <div
          className="rounded-full overflow-hidden border-2 border-white shadow-lg"
          style={{ width: 72, height: 72, background: "#1a1a2e" }}
        >
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/260x190/${player.nbaId}.png`}
            alt=""
            className="w-full h-full object-cover object-top"
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <div style={{ width: 64 }}>
          <svg viewBox="0 0 80 96" xmlns="http://www.w3.org/2000/svg">
            <path d="M 27 3 Q 40 20 53 3 L 78 20 L 66 32 L 66 93 L 14 93 L 14 32 L 2 20 Z" fill="#111827" />
            <path d="M 27 3 Q 40 20 53 3 L 78 20 L 66 32 L 66 93 L 14 93 L 14 32 L 2 20 Z" fill="none" stroke="white" strokeWidth="2.5" />
            <text x="40" y="70" textAnchor="middle" fontSize="32" fontWeight="900" fill="white" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="-1">
              {player.number}
            </text>
          </svg>
        </div>
      )}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 text-center shadow-md mt-1">
        <div className="text-[8px] font-bold uppercase tracking-wide leading-none mb-0.5" style={{ color: "#65a30d" }}>
          {player.position}
        </div>
        <div className="text-[8px] font-semibold text-gray-800 leading-tight whitespace-nowrap">
          {player.ppg} · {player.apg} · {player.rpg}
        </div>
        <div className="text-[6px] text-gray-500 leading-none">PPG · APG · RPG</div>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MAX_HINTS = 3;

export default function LineupGuesserPage() {
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setOrder(shuffle(LINEUPS.map((_, i) => i)));
  }, []);

  const team = order.length > 0 ? LINEUPS[order[idx % order.length]] : null;

  function checkGuess(raw: string) {
    if (!team) return;
    const g = raw.toLowerCase().trim();
    const correct = team.aliases.some(
      (a) => g === a || g.includes(a) || a.includes(g)
    );
    if (correct) {
      setStatus("won");
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    } else {
      const next = [...guesses, raw];
      setGuesses(next);
      if (next.length >= MAX_GUESSES) {
        setStatus("lost");
        setScore((s) => ({ ...s, total: s.total + 1 }));
      }
    }
  }

  function handleHint() {
    if (!team || revealedIndices.size >= MAX_HINTS) return;
    const unrevealed = team.players
      .map((_, i) => i)
      .filter((i) => !revealedIndices.has(i));
    if (unrevealed.length === 0) return;
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    setRevealedIndices((prev) => new Set([...prev, pick]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || status !== "playing") return;
    checkGuess(input.trim());
    setInput("");
  }

  function handleNext() {
    setIdx((i) => i + 1);
    setGuesses([]);
    setInput("");
    setStatus("playing");
    setRevealedIndices(new Set());
  }

  if (!team || order.length === 0) return null;

  const hintsLeft = MAX_HINTS - revealedIndices.size;

  return (
    <div className="min-h-screen">
      <GameHeader title="Lineup Guesser" />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Outer bordered container */}
        <div className="border-2 border-[#111827] mb-6">
          {/* Dark header */}
          <div className="flex items-center justify-between px-8 py-5" style={{ background: "#111827" }}>
            <div>
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-1">Season</p>
              <p className="font-playfair font-black italic text-white leading-none" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em" }}>{team.season}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-1">Score</p>
              <p className="font-playfair font-black leading-none" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#84cc16", letterSpacing: "-0.02em" }}>
                {score.correct}<span className="text-gray-500 font-light">/</span>{score.total}
              </p>
            </div>
          </div>

          {/* Court */}
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "500 / 420", borderTop: "2px solid #111827" }}
          >
          <HalfCourtSVG />
          {team.players.map((p, i) => (
            <PlayerCard key={p.name + p.position} player={p} revealed={revealedIndices.has(i)} />
          ))}
          </div>{/* close court div */}

          {/* Cream bottom: hint + guess controls */}
          <div className="px-6 py-5" style={{ background: "#f4f0e6", borderTop: "2px solid #111827" }}>

            {/* Guess form */}
            {status === "playing" && (
              <div>
                <form onSubmit={handleSubmit} className="flex gap-0 mb-4 border-2 border-[#111827]">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Which NBA team is this?"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="flex-1 px-5 py-4 bg-white text-[#111827] placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-base"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-[#84cc16] text-[#111827] font-mono font-bold border-l-2 border-[#111827] hover:bg-[#65a30d] transition-colors text-sm uppercase tracking-[0.1em]"
                  >
                    Guess
                  </button>
                </form>

                {guesses.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {guesses.map((g, i) => (
                      <div key={i} className="font-mono text-xs text-[#ef4444]">
                        ✕ {g}
                      </div>
                    ))}
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.1em]">
                      {MAX_GUESSES - guesses.length} guess{MAX_GUESSES - guesses.length !== 1 ? "es" : ""} remaining
                    </p>
                  </div>
                )}

                {guesses.length >= 1 && (
                  <button
                    onClick={() => { setStatus("lost"); setScore((s) => ({ ...s, total: s.total + 1 })); }}
                    className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.1em] underline hover:text-gray-700 transition-colors"
                  >
                    Give up
                  </button>
                )}

                {/* Hint button inside cream panel */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleHint}
                    disabled={hintsLeft === 0}
                    className="flex items-center gap-2 px-4 py-2 border-2 font-mono font-bold text-xs uppercase tracking-[0.1em] transition-colors"
                    style={hintsLeft > 0
                      ? { borderColor: "#111827", color: "#111827", background: "#84cc16" }
                      : { borderColor: "#d1d5db", color: "#9ca3af", background: "white", cursor: "not-allowed" }}
                  >
                    👁 Hint ({hintsLeft} left)
                  </button>
                </div>
              </div>
            )}

            {/* Won */}
            {status === "won" && (
              <div className="border-2 border-[#111827] p-8" style={{ background: "#111827" }}>
                <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">Correct!</p>
                <p className="font-playfair font-black italic text-white mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {team.season}
                </p>
                <p className="font-mono text-gray-400 text-sm mb-6">{team.answer}</p>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#84cc16] text-[#111827] font-mono font-bold border-2 border-[#84cc16] hover:bg-[#65a30d] transition-colors text-sm uppercase tracking-[0.1em]"
                >
                  Next Team →
                </button>
              </div>
            )}

            {/* Lost */}
            {status === "lost" && (
              <div className="border-2 border-[#111827] p-8" style={{ background: "#f4f0e6" }}>
                <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-gray-400 mb-2">The answer was</p>
                <p className="font-playfair font-black italic text-[#111827] mb-1" style={{ fontSize: "2.5rem", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  {team.season}
                </p>
                <p className="font-mono text-gray-500 text-sm mb-6">{team.answer}</p>
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#111827] text-[#84cc16] font-mono font-bold border-2 border-[#111827] hover:bg-gray-800 transition-colors text-sm uppercase tracking-[0.1em]"
                >
                  Next Team →
                </button>
              </div>
            )}
          </div>{/* close cream bottom */}
        </div>{/* close outer bordered container */}

        <p className="font-mono text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest">
          Stats are regular season averages for that season
        </p>
      </main>
    </div>
  );
}
