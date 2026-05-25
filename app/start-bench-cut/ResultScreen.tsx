"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Trio } from "@/lib/playerData";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

const ROLE_CONFIG = {
  start: { label: "STARTED", emoji: "⭐", bg: "bg-green-50",  border: "border-green-300", text: "text-green-700", desc: "Your franchise player. Built different." },
  bench: { label: "BENCHED", emoji: "🪑", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", desc: "Valuable piece, but not in the starting five." },
  cut:   { label: "CUT",     emoji: "✂️", bg: "bg-red-50",    border: "border-red-300",   text: "text-red-700",   desc: "Cleared some cap space." },
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
    <main className="flex-1 flex flex-col items-center px-4 py-10 max-w-md mx-auto w-full">
        <motion.div
          className="text-center mb-7"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-xs text-[#65a30d] font-semibold uppercase tracking-widest mb-1">{trio.category}</p>
          <h2 className="text-2xl font-bebas tracking-widest text-[#111827] mb-2">Your Picks</h2>
          <p className="text-gray-500 text-sm italic bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
            &ldquo;{comment}&rdquo;
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 w-full mb-8">
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
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 backdrop-blur-sm ${cfg.bg} ${cfg.border}`}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
              >
                <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-white text-lg shadow-md shrink-0" style={{ backgroundColor: player.teamColor }}>
                  <span className="leading-none">{player.jersey}</span>
                  <span className="text-[7px] font-semibold opacity-90">{player.position}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#111827] text-base leading-tight truncate">{player.name}</p>
                  <p className="text-gray-500 text-xs truncate">{player.team}</p>
                  <p className={`text-xs mt-1 font-medium ${cfg.text}`}>{cfg.desc}</p>
                </div>
                <div className={`text-right shrink-0 ${cfg.text}`}>
                  <div className="text-2xl">{cfg.emoji}</div>
                  <div className="text-[9px] font-bold tracking-widest mt-1 uppercase">{cfg.label}</div>
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
            className="flex-1 py-3.5 bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] font-bold text-sm rounded-2xl tracking-wide font-bebas"
            style={{ fontSize: "1rem", letterSpacing: "0.15em" }}
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
            className="px-5 py-3.5 bg-white text-zinc-600 border border-zinc-200 font-semibold text-sm rounded-2xl tracking-wide shadow-sm min-w-[80px]"
            whileHover={{ scale: 1.02, backgroundColor: "#f4f4f5" }}
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
