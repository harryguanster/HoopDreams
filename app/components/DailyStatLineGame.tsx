"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StatLinePlayer } from "@/lib/statLineData";

function normalize(s: string) {
  return s.toLowerCase().replace(/['.,-]/g, "").replace(/\s+/g, " ").trim();
}

function isMatch(input: string, player: StatLinePlayer): boolean {
  const n = normalize(input);
  if (!n) return false;
  const targets = [player.name, ...player.aliases].map(normalize);
  return targets.some(t => t === n || (t.includes(n) && n.length >= 4));
}

const STAT_ORDER: Array<{ key: keyof StatLinePlayer["stats"]; label: string; color: string }> = [
  { key: "ppg", label: "PPG", color: "#f97316" },
  { key: "rpg", label: "RPG", color: "#10b981" },
  { key: "apg", label: "APG", color: "#3b82f6" },
  { key: "spg", label: "SPG", color: "#a855f7" },
  { key: "bpg", label: "BPG", color: "#ef4444" },
];

const MAX_GUESSES = 5;

export default function DailyStatLineGame({
  player,
  onComplete,
  alreadyCompleted,
  won: initialWon,
}: {
  player: StatLinePlayer;
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

  const statGrid = (count: number) => (
    <div className="grid grid-cols-5 gap-2">
      {STAT_ORDER.map(({ key, label, color }, i) => {
        const revealed = i < count;
        return (
          <motion.div
            key={key}
            className="text-center rounded-lg p-3 border"
            style={{
              background: revealed ? `${color}10` : "rgba(255,255,255,0.03)",
              borderColor: revealed ? `${color}30` : "rgba(255,255,255,0.06)",
            }}
            initial={revealed && i === count - 1 ? { opacity: 0, scale: 0.8 } : {}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            {revealed ? (
              <>
                <p style={{ color, fontFamily: "var(--font-bebas)", fontSize: "1.5rem", lineHeight: 1 }}>
                  {player.stats[key] ?? "—"}
                </p>
                <p className="text-white/40 text-[9px] font-mono uppercase mt-1">{label}</p>
              </>
            ) : (
              <>
                <p className="text-white/15 font-bebas text-2xl" style={{ lineHeight: 1 }}>?</p>
                <p className="text-white/15 text-[9px] font-mono uppercase mt-1">{label}</p>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  if (alreadyCompleted) {
    return (
      <div className="space-y-3">
        {statGrid(MAX_GUESSES)}
        <div className={`rounded-xl p-4 border ${initialWon ? "bg-teal-500/10 border-teal-500/30" : "bg-red-500/10 border-red-500/30"}`}>
          <p className={`font-bebas text-xl tracking-widest ${initialWon ? "text-teal-300" : "text-red-300"}`}>
            {initialWon ? `✓ ${player.name}` : `✗ The answer was: ${player.name}`}
          </p>
          <p className="text-white/40 text-xs mt-1 font-mono">{player.team} · #{player.jersey} · {player.position}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statGrid(revealedCount)}

      {guesses.length > 0 && !done && (
        <div className="flex flex-wrap gap-1.5">
          {guesses.map((g, i) => (
            <span key={i} className="text-[11px] bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-1 font-mono"
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
            className={`rounded-xl p-4 border ${won ? "bg-teal-500/10 border-teal-500/30" : "bg-red-500/10 border-red-500/30"}`}
          >
            <p className={`font-bebas text-xl tracking-widest ${won ? "text-teal-300" : "text-red-300"}`}>
              {won ? `✓ ${player.name}` : `✗ The answer was: ${player.name}`}
            </p>
            <p className="text-white/40 text-xs mt-1 font-mono">{player.team} · #{player.jersey} · {player.position}</p>
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
            className="flex-1 bg-white/8 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400/60 transition-colors"
            autoFocus
          />
          <button
            onClick={handleGuess}
            className="px-5 py-3 font-bebas text-white text-sm tracking-widest shrink-0"
            style={{
              background: "linear-gradient(90deg, #2563eb, #3b82f6)",
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
