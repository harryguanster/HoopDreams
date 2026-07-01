"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Trio } from "@/lib/playerData";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

const ROLE_CONFIG = {
  start: { label: "STARTED", emoji: "⭐", bg: "#f4f0e6", border: "#84cc16",   text: "#84cc16",  desc: "Your franchise player. Built different." },
  bench: { label: "BENCHED", emoji: "🪑", bg: "#f4f0e6", border: "#f59e0b", text: "#f59e0b", desc: "Valuable piece, but not in the starting five." },
  cut:   { label: "CUT",     emoji: "✂️", bg: "#f4f0e6", border: "#ef4444",   text: "#ef4444",  desc: "Cleared some cap space." },
};

function getResultComment(assignments: Assignments, trio: Trio): string {
  const cutPlayer = trio.players.find((p) => assignments[p.id] === "cut");
  const startPlayer = trio.players.find((p) => assignments[p.id] === "start");
  const cutComment: Record<string, string> = {
    jordan: "You cut Michael Jordan?! Bold take.",
    lebron: "LeBron got cut?! The internet is coming for you.",
    kobe: "No more Mamba Mentality on your squad.",
    russell: "11 rings and still cut. Ruthless.",
    shaq: "No Shaq? Hope your center can score.",
    cp3: "No Point God. Hope your offense figures itself out.",
    kareem: "6 MVPs and you cut him? Wow.",
    wilt: "Averaged 50 points in a season and you cut him.",
  };
  const startComment: Record<string, string> = {
    jordan: "MJ gets the nod. Hard to argue with 6-0 in the Finals.",
    lebron: "The King leads the charge. 4 rings speak volumes.",
    kobe: "Mamba Mentality earns the start.",
    jokic: "The Joker running the show — classic chess move.",
    curry: "Greatest shooter ever gets the keys.",
    magic: "Showtime runs through Magic.",
  };
  if (cutPlayer && cutComment[cutPlayer.id]) return cutComment[cutPlayer.id];
  if (startPlayer && startComment[startPlayer.id]) return startComment[startPlayer.id];
  return `${startPlayer?.name ?? "Your pick"} leads the squad. Solid choice.`;
}

const cardVariants = {
  hidden: { opacity: 0, x: -24 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function ResultScreen({ trio, assignments, onPlayAgain }: {
  trio: Trio; assignments: Assignments; onPlayAgain: () => void;
}) {
  const comment = getResultComment(assignments, trio);
  const roleOrder: Role[] = ["start", "bench", "cut"];
  const [copied, setCopied] = useState(false);

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 max-w-3xl mx-auto w-full" style={{ background: "#f4f0e6" }}>
      <motion.div
        className="w-full border-2 border-[#111827] mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Dark header */}
        <div className="px-6 py-5 text-center" style={{ background: "#111827", borderBottom: "2px solid #111827" }}>
          <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">{trio.category}</p>
          <h2 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
            Your Picks
          </h2>
        </div>
        {/* Comment quote in cream panel */}
        <div className="px-6 py-4" style={{ background: "#f4f0e6" }}>
          <p className="font-mono text-xs text-gray-500 italic text-center">
            &ldquo;{comment}&rdquo;
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-0 w-full mb-8 border-2 border-[#111827]">
        {roleOrder.map((role, i) => {
          const player = trio.players.find((p) => assignments[p.id] === role);
          if (!player) return null;
          const cfg = ROLE_CONFIG[role];
          return (
            <motion.div
              key={role}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              className="flex items-center gap-5 p-5"
              style={{
                background: "#f4f0e6",
                borderBottom: i < 2 ? "2px solid #111827" : undefined,
                borderLeft: `4px solid ${cfg.border}`,
              }}
            >
              <PlayerHeadshot
                playerId={player.id}
                teamColor={player.teamColor}
                jersey={player.jersey}
                size={72}
              />
              <div className="flex-1 min-w-0">
                <p className="font-playfair font-black text-[#111827] text-xl leading-tight truncate">{player.name}</p>
                <p className="font-mono text-xs text-gray-400 truncate uppercase tracking-[0.1em] mt-0.5">{player.team}</p>
                <p className="font-mono text-xs mt-1" style={{ color: cfg.text }}>{cfg.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl">{cfg.emoji}</div>
                <div className="font-mono text-[10px] font-bold tracking-[0.15em] mt-1 uppercase" style={{ color: cfg.text }}>{cfg.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex gap-3 w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.38, ease: "easeOut" }}
      >
        <motion.button
          onClick={onPlayAgain}
          className="flex-1 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] transition-colors"
          style={{ background: "#84cc16", color: "#111827" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
        >
          Next Round →
        </motion.button>
        <motion.button
          onClick={() => {
            const lines = [
              `🏀 Courtside Central — ${trio.category}`,
              "",
              ...roleOrder.map((r) => {
                const p = trio.players.find((p) => assignments[p.id] === r);
                const cfg = ROLE_CONFIG[r];
                return `${cfg.emoji} ${cfg.label}: ${p?.name}`;
              }),
              "",
              "courtsidecentral.com",
            ];
            navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-5 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 border-[#111827] min-w-[80px] transition-colors"
          style={{ background: "#ffffff", color: "#111827" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={copied ? "copied" : "share"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {copied ? "✓ Copied!" : "Share"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </main>
  );
}
