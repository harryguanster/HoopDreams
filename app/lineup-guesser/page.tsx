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

function PlayerCard({ player }: { player: LineupPlayer }) {
  const pos = POSITION_COORDS[player.position];
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {/* Jersey SVG */}
      <div className="w-14 drop-">
        <svg viewBox="0 0 80 96" xmlns="http://www.w3.org/2000/svg">
          {/* Jersey body: V-neck collar, angled shoulders, straight body */}
          <path
            d="M 27 3 Q 40 20 53 3 L 78 20 L 66 32 L 66 93 L 14 93 L 14 32 L 2 20 Z"
            fill="#0f766e"
          />
          {/* White trim outline */}
          <path
            d="M 27 3 Q 40 20 53 3 L 78 20 L 66 32 L 66 93 L 14 93 L 14 32 L 2 20 Z"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          />
          {/* Jersey number */}
          <text
            x="40"
            y="70"
            textAnchor="middle"
            fontSize="32"
            fontWeight="900"
            fill="white"
            fontFamily="Arial Black, Arial, sans-serif"
            letterSpacing="-1"
          >
            {player.number}
          </text>
        </svg>
      </div>
      {/* Stats pill below jersey */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-center shadow-md -mt-1">
        <div className="text-[7px] font-bold text-teal-700 uppercase tracking-wide leading-none mb-0.5">
          {player.position}
        </div>
        <div className="text-[7px] font-semibold text-gray-800 leading-tight whitespace-nowrap">
          {player.ppg} · {player.apg} · {player.rpg}
        </div>
        <div className="text-[5.5px] text-gray-500 leading-none">PPG · APG · RPG</div>
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

export default function LineupGuesserPage() {
  const [order, setOrder] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [score, setScore] = useState({ correct: 0, total: 0 });

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
  }

  if (!team || order.length === 0) return null;

  return (
    <div className="min-h-screen">
      <GameHeader title="Lineup Guesser" />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header row */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Season</p>
            <p className="text-3xl font-black text-[#111827] leading-none">{team.season}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Score</p>
            <p className="text-3xl font-black text-[#65a30d] leading-none">
              {score.correct}<span className="text-white/40 font-light">/</span>{score.total}
            </p>
          </div>
        </div>

        {/* Court */}
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl mb-6"
          style={{ aspectRatio: "500 / 420" }}
        >
          <HalfCourtSVG />
          {team.players.map((p) => (
            <PlayerCard key={p.name + p.position} player={p} />
          ))}
        </div>

        {/* Guess form */}
        {status === "playing" && (
          <div>
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Which NBA team is this?"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#111827] placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#84cc16] text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors text-sm"
              >
                Guess
              </button>
            </form>

            {guesses.length > 0 && (
              <div className="space-y-1 mb-2">
                {guesses.map((g, i) => (
                  <div key={i} className="text-sm text-red-500 font-medium">
                    <span className="mr-1">✕</span>{g}
                  </div>
                ))}
                <p className="text-xs text-gray-500">
                  {MAX_GUESSES - guesses.length} guess{MAX_GUESSES - guesses.length !== 1 ? "es" : ""} remaining
                </p>
              </div>
            )}

            {guesses.length >= 1 && (
              <button
                onClick={() => {
                  setStatus("lost");
                  setScore((s) => ({ ...s, total: s.total + 1 }));
                }}
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700 transition-colors"
              >
                Give up
              </button>
            )}
          </div>
        )}

        {/* Won */}
        {status === "won" && (
          <div className="text-center py-6 bg-teal-50 rounded-2xl border border-teal-200">
            <p className="text-3xl font-black text-teal-600 mb-1">Correct!</p>
            <p className="text-gray-700 font-medium mb-4">
              {team.season} {team.answer}
            </p>
            <button
              onClick={handleNext}
              className="px-7 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors"
            >
              Next Team
            </button>
          </div>
        )}

        {/* Lost */}
        {status === "lost" && (
          <div className="text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-base font-semibold text-gray-500 mb-1">The answer was</p>
            <p className="text-2xl font-black text-[#111827] mb-4">
              {team.season} {team.answer}
            </p>
            <button
              onClick={handleNext}
              className="px-7 py-3 bg-gray-200 text-[#111827] font-bold rounded-xl hover:bg-[#84cc16] transition-colors"
            >
              Next Team
            </button>
          </div>
        )}

        <p className="text-[11px] text-gray-400 text-center mt-8">
          Stats are regular season averages for that season
        </p>
      </main>
    </div>
  );
}
