"use client";

import type { Trio } from "@/lib/playerData";
import GameHeader from "@/app/components/GameHeader";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

const ROLE_CONFIG = {
  start: { label: "STARTED", emoji: "⭐", bg: "bg-green-50",  border: "border-green-200", text: "text-green-700", desc: "Your franchise player. Built different." },
  bench: { label: "BENCHED", emoji: "🪑", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", desc: "Valuable piece, but not in the starting five." },
  cut:   { label: "CUT",     emoji: "✂️", bg: "bg-red-50",    border: "border-red-200",   text: "text-red-600",   desc: "Cleared some cap space." },
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

export default function ResultScreen({ trio, assignments, onPlayAgain }: {
  trio: Trio; assignments: Assignments; onPlayAgain: () => void;
}) {
  const comment = getResultComment(assignments, trio);
  const roleOrder: Role[] = ["start", "bench", "cut"];

  return (
    <div className="min-h-screen flex flex-col court-bg">
      <GameHeader title="Start · Bench · Cut" />

      <main className="flex-1 flex flex-col items-center px-4 py-10 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <p className="text-xs text-teal-600 font-semibold uppercase tracking-widest mb-1">{trio.category}</p>
          <h2 className="text-2xl font-bold text-zinc-900">Your Picks</h2>
          <p className="text-zinc-400 text-sm mt-2 italic">"{comment}"</p>
        </div>

        <div className="flex flex-col gap-3 w-full mb-8">
          {roleOrder.map((role) => {
            const player = trio.players.find((p) => assignments[p.id] === role);
            if (!player) return null;
            const cfg = ROLE_CONFIG[role];
            return (
              <div key={role} className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm ${cfg.bg} ${cfg.border}`}>
                <div className="w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold text-white text-base shadow-sm shrink-0" style={{ backgroundColor: player.teamColor }}>
                  <span className="leading-none">{player.jersey}</span>
                  <span className="text-[7px] font-semibold opacity-90">{player.position}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 text-sm leading-tight truncate">{player.name}</p>
                  <p className="text-zinc-400 text-xs truncate">{player.team}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">{cfg.desc}</p>
                </div>
                <div className={`text-right shrink-0 ${cfg.text}`}>
                  <div className="text-xl">{cfg.emoji}</div>
                  <div className="text-[10px] font-bold tracking-wider mt-0.5">{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 w-full">
          <button onClick={onPlayAgain} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-700 text-white font-bold text-sm rounded-xl tracking-wide transition-all active:scale-95 shadow-sm">
            Next Round →
          </button>
          <button
            onClick={() => {
              const lines = [`🏀 Courtside Central — ${trio.category}`, "", ...roleOrder.map((r) => { const p = trio.players.find((p) => assignments[p.id] === r); const cfg = ROLE_CONFIG[r]; return `${cfg.emoji} ${cfg.label}: ${p?.name}`; }), "", "courtsidecentral.com"];
              navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
            }}
            className="px-5 py-3 bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-200 font-semibold text-sm rounded-xl tracking-wide transition-all active:scale-95 shadow-sm"
          >
            Share
          </button>
        </div>
      </main>
    </div>
  );
}
