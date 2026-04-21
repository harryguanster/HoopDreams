"use client";

import type { Trio } from "@/lib/playerData";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

const ROLE_CONFIG = {
  start: { label: "STARTED", emoji: "⭐", bg: "bg-green-50",  border: "border-green-300", text: "text-green-600", desc: "Your franchise player. Built different." },
  bench: { label: "BENCHED", emoji: "🪑", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-600", desc: "Valuable piece, but not in the starting five." },
  cut:   { label: "CUT",     emoji: "✂️", bg: "bg-red-50",    border: "border-red-300",   text: "text-red-600",   desc: "Cleared some cap space." },
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
    <div className="min-h-screen flex flex-col bg-teal-50">
      <header className="border-b border-teal-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-500 transition-colors">
          <span className="text-lg">🏀</span>
          <span className="font-black text-sm tracking-wide">COURTSIDE CENTRAL</span>
        </a>
        <span className="text-xs text-slate-400 uppercase tracking-widest">Start · Bench · Cut</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-10 max-w-2xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-2">{trio.category}</p>
          <h2 className="text-3xl font-black text-slate-900">Your Picks</h2>
          <p className="text-slate-500 text-sm mt-2 italic">"{comment}"</p>
        </div>

        <div className="flex flex-col gap-4 w-full mb-10">
          {roleOrder.map((role) => {
            const player = trio.players.find((p) => assignments[p.id] === role);
            if (!player) return null;
            const cfg = ROLE_CONFIG[role];
            return (
              <div key={role} className={`flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm ${cfg.bg} ${cfg.border} animate-scale-in`}>
                <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-white text-lg shadow-md shrink-0" style={{ backgroundColor: player.teamColor }}>
                  <span className="leading-none">{player.jersey}</span>
                  <span className="text-[8px] font-bold opacity-80">{player.position}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-base leading-tight truncate">{player.name}</p>
                  <p className="text-slate-400 text-xs truncate">{player.team}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{cfg.desc}</p>
                </div>
                <div className={`text-right shrink-0 ${cfg.text}`}>
                  <div className="text-2xl">{cfg.emoji}</div>
                  <div className="text-xs font-bold tracking-wider mt-0.5">{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={onPlayAgain} className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-md shadow-teal-200">
            Next Trio →
          </button>
          <button
            onClick={() => {
              const lines = [`🏀 Courtside Central — ${trio.category}`, "", ...roleOrder.map((r) => { const p = trio.players.find((p) => assignments[p.id] === r); const cfg = ROLE_CONFIG[r]; return `${cfg.emoji} ${cfg.label}: ${p?.name}`; }), "", "Play at courtsidecentral.com"];
              navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
            }}
            className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-sm"
          >
            Copy Results
          </button>
        </div>
      </main>
    </div>
  );
}
