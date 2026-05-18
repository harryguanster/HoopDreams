"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/playerData";

type Role = "start" | "bench" | "cut" | null;

const ROLE_CONFIG = {
  start: { label: "START", bg: "bg-green-500/15", border: "border-green-400/50", text: "text-green-300", badge: "bg-green-500 text-white", emoji: "⭐" },
  bench: { label: "BENCH", bg: "bg-yellow-500/15", border: "border-yellow-400/50", text: "text-yellow-300", badge: "bg-yellow-400 text-slate-900", emoji: "🪑" },
  cut:   { label: "CUT",   bg: "bg-red-500/15",    border: "border-red-400/50",   text: "text-red-300",   badge: "bg-red-500 text-white",      emoji: "✂️" },
};

export default function PlayerCard({ player, role, isSelected, onClick }: {
  player: Player; role: Role; isSelected: boolean; onClick: () => void;
}) {
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const borderClass = isSelected
    ? "border-teal-400 ring-2 ring-teal-400/30"
    : roleConfig ? roleConfig.border
    : "border-white/15 hover:border-teal-400/40";

  const bgClass = roleConfig ? roleConfig.bg : isSelected ? "bg-teal-500/10" : "bg-white/5";

  return (
    <motion.div
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-5 flex flex-col gap-3 cursor-pointer select-none backdrop-blur-sm
        ${bgClass} ${borderClass}`}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <AnimatePresence>
        {roleConfig && (
          <motion.div
            key={role}
            className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleConfig.badge}`}
            initial={{ opacity: 0, scale: 0.6, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -4 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            {roleConfig.emoji} {roleConfig.label}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center pt-2">
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-white text-2xl shadow-md"
          style={{ backgroundColor: player.teamColor }}
        >
          <span className="leading-none">{player.jersey}</span>
          <span className="text-[9px] font-bold mt-0.5 opacity-80 tracking-widest">{player.position}</span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-bold text-white text-base leading-tight">{player.name}</p>
        <p className="text-white/40 text-xs mt-0.5 truncate">{player.team}</p>
      </div>

      <div className="grid grid-cols-3 gap-1 border-t border-white/10 pt-3">
        <StatPill label="PPG" value={player.stats.ppg} />
        <StatPill label="RPG" value={player.stats.rpg} />
        <StatPill label="APG" value={player.stats.apg} />
      </div>

      <div className="flex flex-wrap gap-1 justify-center">
        {player.accolades.slice(0, 2).map((a) => (
          <span key={a} className="text-[10px] bg-white/8 text-white/50 rounded-full px-2 py-0.5 leading-tight border border-white/10">
            {a}
          </span>
        ))}
      </div>

      <p className="text-center text-white/25 text-[10px] font-mono">{player.era}</p>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white font-bold text-sm leading-tight">{value}</span>
      <span className="text-white/40 text-[10px] font-medium">{label}</span>
    </div>
  );
}
