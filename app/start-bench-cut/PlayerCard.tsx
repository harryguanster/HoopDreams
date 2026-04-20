"use client";

import type { Player } from "@/lib/playerData";

type Role = "start" | "bench" | "cut" | null;

const ROLE_CONFIG = {
  start: {
    label: "START",
    bg: "bg-green-500/20",
    border: "border-green-500",
    text: "text-green-400",
    badge: "bg-green-500 text-white",
    emoji: "⭐",
  },
  bench: {
    label: "BENCH",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500",
    text: "text-yellow-400",
    badge: "bg-yellow-500 text-gray-900",
    emoji: "🪑",
  },
  cut: {
    label: "CUT",
    bg: "bg-red-500/20",
    border: "border-red-600",
    text: "text-red-400",
    badge: "bg-red-500 text-white",
    emoji: "✂️",
  },
};

export default function PlayerCard({
  player,
  role,
  isSelected,
  onClick,
}: {
  player: Player;
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}) {
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const borderClass = isSelected
    ? "border-orange-400 ring-2 ring-orange-400/40"
    : roleConfig
    ? roleConfig.border
    : "border-gray-700 hover:border-gray-600";

  const bgClass = roleConfig ? roleConfig.bg : isSelected ? "bg-orange-500/10" : "bg-gray-900";

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border-2 p-5 flex flex-col gap-3 cursor-pointer
        transition-all duration-200 select-none
        ${bgClass} ${borderClass}
        ${isSelected ? "card-selected scale-[1.02]" : "hover:scale-[1.01] active:scale-[0.99]"}
      `}
    >
      {/* Role Badge */}
      {roleConfig && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleConfig.badge} animate-scale-in`}
        >
          {roleConfig.emoji} {roleConfig.label}
        </div>
      )}

      {/* Jersey Avatar */}
      <div className="flex justify-center pt-2">
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-white text-2xl shadow-lg"
          style={{ backgroundColor: player.teamColor }}
        >
          <span className="leading-none">{player.jersey}</span>
          <span className="text-[9px] font-bold mt-0.5 opacity-80 tracking-widest">{player.position}</span>
        </div>
      </div>

      {/* Name & Team */}
      <div className="text-center">
        <p className="font-bold text-white text-base leading-tight">{player.name}</p>
        <p className="text-gray-400 text-xs mt-0.5 truncate">{player.team}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 border-t border-gray-800 pt-3">
        <StatPill label="PPG" value={player.stats.ppg} />
        <StatPill label="RPG" value={player.stats.rpg} />
        <StatPill label="APG" value={player.stats.apg} />
      </div>

      {/* Accolades */}
      <div className="flex flex-wrap gap-1 justify-center">
        {player.accolades.slice(0, 2).map((a) => (
          <span
            key={a}
            className="text-[10px] bg-gray-800 text-gray-400 rounded-full px-2 py-0.5 leading-tight"
          >
            {a}
          </span>
        ))}
      </div>

      {/* Era */}
      <p className="text-center text-gray-600 text-[10px] font-mono">{player.era}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white font-bold text-sm leading-tight">{value}</span>
      <span className="text-gray-500 text-[10px] font-medium">{label}</span>
    </div>
  );
}
