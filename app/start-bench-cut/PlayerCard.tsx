"use client";

import type { Player } from "@/lib/playerData";

type Role = "start" | "bench" | "cut" | null;

const ROLE_CONFIG = {
  start: { label: "START", bg: "bg-green-50", border: "border-green-400", text: "text-green-700", badge: "bg-green-500 text-white", emoji: "⭐" },
  bench: { label: "BENCH", bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-700", badge: "bg-yellow-400 text-slate-900", emoji: "🪑" },
  cut:   { label: "CUT",   bg: "bg-red-50",    border: "border-red-400",   text: "text-red-700",   badge: "bg-red-500 text-white",      emoji: "✂️" },
};

export default function PlayerCard({ player, role, isSelected, onClick }: {
  player: Player; role: Role; isSelected: boolean; onClick: () => void;
}) {
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const borderClass = isSelected
    ? "border-teal-400 ring-2 ring-teal-300/50"
    : roleConfig ? roleConfig.border
    : "border-slate-200 hover:border-teal-300";

  const bgClass = roleConfig ? roleConfig.bg : isSelected ? "bg-teal-50" : "bg-white";

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200 select-none shadow-sm
        ${bgClass} ${borderClass}
        ${isSelected ? "card-selected scale-[1.02]" : "hover:scale-[1.01] active:scale-[0.99] hover:shadow-md"}`}
    >
      {roleConfig && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleConfig.badge} animate-scale-in`}>
          {roleConfig.emoji} {roleConfig.label}
        </div>
      )}

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
        <p className="font-bold text-slate-900 text-base leading-tight">{player.name}</p>
        <p className="text-slate-400 text-xs mt-0.5 truncate">{player.team}</p>
      </div>

      <div className="grid grid-cols-3 gap-1 border-t border-slate-100 pt-3">
        <StatPill label="PPG" value={player.stats.ppg} />
        <StatPill label="RPG" value={player.stats.rpg} />
        <StatPill label="APG" value={player.stats.apg} />
      </div>

      <div className="flex flex-wrap gap-1 justify-center">
        {player.accolades.slice(0, 2).map((a) => (
          <span key={a} className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 leading-tight">
            {a}
          </span>
        ))}
      </div>

      <p className="text-center text-slate-300 text-[10px] font-mono">{player.era}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-slate-900 font-bold text-sm leading-tight">{value}</span>
      <span className="text-slate-400 text-[10px] font-medium">{label}</span>
    </div>
  );
}
