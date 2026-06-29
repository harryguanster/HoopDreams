"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/playerData";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

type Role = "start" | "bench" | "cut" | null;

const ROLE_CONFIG = {
  start: { label: "START", bg: "bg-green-50",  border: "border-green-300", text: "text-green-700", badge: "bg-green-500 text-white", emoji: "⭐" },
  bench: { label: "BENCH", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", badge: "bg-yellow-400 text-slate-900", emoji: "🪑" },
  cut:   { label: "CUT",   bg: "bg-red-50",    border: "border-red-300",   text: "text-red-700",   badge: "bg-red-500 text-white",      emoji: "✂️" },
};

export default function PlayerCard({ player, role, isSelected, onClick }: {
  player: Player; role: Role; isSelected: boolean; onClick: () => void;
}) {
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const borderClass = isSelected
    ? "border-[#65a30d] ring-2 ring-[#84cc16]/30"
    : roleConfig ? roleConfig.border
    : "border-gray-200 hover:border-[#84cc16]/50";

  const bgClass = roleConfig ? roleConfig.bg : isSelected ? "bg-[#f0fdf4]" : "bg-white";

  return (
    <motion.div
      onClick={onClick}
      className={`relative rounded-none border-2 p-6 flex flex-col gap-3 cursor-pointer select-none
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
        <PlayerHeadshot
          playerId={player.id}
          teamColor={player.teamColor}
          jersey={player.jersey}
          size={144}
        />
      </div>

      <div className="text-center">
        <p className="font-playfair font-black text-[#111827] text-xl leading-tight">{player.name}</p>
        <p className="text-gray-400 text-sm mt-1 truncate">{player.team}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        <StatPill label="PPG" value={player.stats.ppg} />
        <StatPill label="RPG" value={player.stats.rpg} />
        <StatPill label="APG" value={player.stats.apg} />
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center">
        {player.accolades.slice(0, 2).map((a) => (
          <span key={a} className="text-xs bg-gray-100 text-gray-500 rounded-full px-3 py-1 leading-tight border border-gray-200">
            {a}
          </span>
        ))}
      </div>

      <p className="text-center text-gray-400 text-xs font-mono uppercase tracking-[0.25em]">{player.era}</p>
    </motion.div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[#111827] font-bold text-lg leading-tight">{value}</span>
      <span className="text-gray-400 text-xs font-medium">{label}</span>
    </div>
  );
}
