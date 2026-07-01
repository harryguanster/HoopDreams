"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/playerData";
import PlayerHeadshot from "@/app/components/PlayerHeadshot";

type Role = "start" | "bench" | "cut" | null;

const ROLE_CONFIG = {
  start: { label: "START", bg: "#84cc16",  border: "#84cc16", text: "#111827", emoji: "⭐" },
  bench: { label: "BENCH", bg: "#f59e0b", border: "#f59e0b", text: "#111827", emoji: "🪑" },
  cut:   { label: "CUT",   bg: "#ef4444", border: "#ef4444", text: "#ffffff", emoji: "✂️" },
};

export default function PlayerCard({ player, role, isSelected, onClick }: {
  player: Player; role: Role; isSelected: boolean; onClick: () => void;
}) {
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const borderColor = isSelected
    ? "#84cc16"
    : "#111827";

  return (
    <motion.div
      onClick={onClick}
      className="relative rounded-none border-2 flex flex-col cursor-pointer select-none overflow-hidden"
      style={{ borderColor }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Role badge */}
      <AnimatePresence>
        {roleConfig && (
          <motion.div
            key={role}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center gap-1.5 py-1.5 font-mono font-bold text-[10px] uppercase tracking-[0.2em]"
            style={{ background: roleConfig.bg, color: roleConfig.text, borderBottom: "2px solid #111827" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
            <span>{roleConfig.emoji}</span>
            <span>{roleConfig.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark top section: headshot */}
      <div className="flex justify-center items-center pt-10 pb-4" style={{ background: "#111827", minHeight: 160 }}>
        <PlayerHeadshot
          playerId={player.id}
          teamColor={player.teamColor}
          jersey={player.jersey}
          size={120}
        />
      </div>

      {/* Cream bottom section: name + stats */}
      <div className="p-4 flex flex-col gap-3" style={{ background: "#f4f0e6", borderTop: "2px solid #111827" }}>
        <div className="text-center">
          <p className="font-playfair font-black text-[#111827] text-xl leading-tight">{player.name}</p>
          <p className="font-mono text-gray-400 text-xs mt-1 truncate uppercase tracking-[0.1em]">{player.team}</p>
        </div>

        <div className="grid grid-cols-3 gap-0 border-2 border-[#111827]">
          <StatCell label="PPG" value={player.stats.ppg} last={false} />
          <StatCell label="RPG" value={player.stats.rpg} last={false} />
          <StatCell label="APG" value={player.stats.apg} last={true} />
        </div>

        <div className="flex flex-wrap gap-1.5 justify-center">
          {player.accolades.slice(0, 2).map((a) => (
            <span key={a} className="font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 border border-[#111827] text-gray-500">
              {a}
            </span>
          ))}
        </div>

        <p className="text-center font-mono text-[9px] uppercase tracking-[0.25em] text-gray-400">{player.era}</p>
      </div>
    </motion.div>
  );
}

function StatCell({ label, value, last }: { label: string; value: number; last: boolean }) {
  return (
    <div
      className="flex flex-col items-center py-2"
      style={{ borderRight: last ? undefined : "2px solid #111827" }}
    >
      <span className="font-playfair font-black text-[#111827] text-lg leading-tight">{value}</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-gray-400">{label}</span>
    </div>
  );
}
