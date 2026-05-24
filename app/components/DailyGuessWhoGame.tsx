"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GuessWhoPlayer } from "@/lib/guessWhoData";

function normalize(s: string) {
  return s.toLowerCase().replace(/['.,-]/g, "").replace(/\s+/g, " ").trim();
}

function isMatch(input: string, player: GuessWhoPlayer): boolean {
  const n = normalize(input);
  if (!n) return false;
  const targets = [player.name, ...player.aliases].map(normalize);
  return targets.some(t => t === n || (t.includes(n) && n.length >= 4));
}

const MAX_GUESSES = 5;

export default function DailyGuessWhoGame({
  player,
  onComplete,
  alreadyCompleted,
  won: initialWon,
}: {
  player: GuessWhoPlayer;
  onComplete: (won: boolean) => void;
  alreadyCompleted?: boolean;
  won?: boolean | null;
}) {
  const [revealedCount, setRevealedCount] = useState(1);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleGuess() {
    const val = inputVal.trim();
    if (!val) return;
    setInputVal("");

    if (isMatch(val, player)) {
      setDone(true);
      setWon(true);
      setGuesses(prev => [...prev, val]);
      onComplete(true);
      return;
    }

    const newGuesses = [...guesses, val];
    setGuesses(newGuesses);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (newGuesses.length >= MAX_GUESSES) {
      setDone(true);
      onComplete(false);
    } else {
      setRevealedCount(c => Math.min(c + 1, MAX_GUESSES));
    }
  }

  if (alreadyCompleted) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {player.clues.map((clue, i) => (
            <div key={i} className="flex gap-3 bg-white/70 border border-stone-200 rounded-lg p-3">
              <span className="text-amber-600 font-mono text-xs font-bold w-5 shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-gray-700 text-sm leading-relaxed">{clue}</p>
            </div>
          ))}
        </div>
        <div className={`rounded-xl p-4 border ${initialWon ? "bg-lime-50 border-lime-300" : "bg-red-50 border-red-200"}`}>
          <p className={`font-bebas text-xl tracking-widest ${initialWon ? "text-lime-700" : "text-red-600"}`}>
            {initialWon ? `✓ ${player.name}` : `✗ The answer was: ${player.name}`}
          </p>
          <p className="text-gray-500 text-xs mt-1 font-mono">{player.team} · #{player.jersey} · {player.position}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {player.clues.slice(0, revealedCount).map((clue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 bg-white/70 border border-stone-200 rounded-lg p-3"
          >
            <span className="text-amber-600 font-mono text-xs font-bold w-5 shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-gray-800 text-sm leading-relaxed">{clue}</p>
          </motion.div>
        ))}
        {Array.from({ length: MAX_GUESSES - revealedCount }).map((_, i) => (
          <div key={`hidden-${i}`} className="flex gap-3 bg-stone-100 border border-stone-200 rounded-lg p-3 opacity-50">
            <span className="text-gray-400 font-mono text-xs font-bold w-5 shrink-0 mt-0.5">{revealedCount + i + 1}</span>
            <p className="text-gray-400 text-sm">— next clue unlocks after a wrong guess —</p>
          </div>
        ))}
      </div>

      {guesses.length > 0 && !done && (
        <div className="flex flex-wrap gap-1.5">
          {guesses.map((g, i) => (
            <span key={i} className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 font-mono"
              style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)" }}>
              ✗ {g}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 border ${won ? "bg-lime-50 border-lime-300" : "bg-red-50 border-red-200"}`}
          >
            <p className={`font-bebas text-xl tracking-widest ${won ? "text-lime-700" : "text-red-600"}`}>
              {won ? `✓ ${player.name}` : `✗ The answer was: ${player.name}`}
            </p>
            <p className="text-gray-500 text-xs mt-1 font-mono">{player.team} · #{player.jersey} · {player.position}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <motion.div
          animate={shake ? { x: [-8, 8, -5, 5, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleGuess(); }}
            placeholder={`Guess ${guesses.length + 1} of ${MAX_GUESSES}…`}
            className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-violet-400 transition-colors"
            autoFocus
          />
          <button
            onClick={handleGuess}
            className="px-5 py-3 font-bebas text-white text-sm tracking-widest shrink-0"
            style={{
              background: "linear-gradient(90deg, #7c3aed, #a855f7)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)",
            }}
          >
            Guess
          </button>
        </motion.div>
      )}
    </div>
  );
}
