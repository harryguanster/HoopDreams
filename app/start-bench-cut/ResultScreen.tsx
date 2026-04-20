"use client";

import type { Trio } from "@/lib/playerData";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

const ROLE_CONFIG = {
  start: {
    label: "STARTED",
    emoji: "⭐",
    bg: "bg-green-900/40",
    border: "border-green-600",
    text: "text-green-400",
    desc: "Your franchise player. Built different.",
  },
  bench: {
    label: "BENCHED",
    emoji: "🪑",
    bg: "bg-yellow-900/40",
    border: "border-yellow-600",
    text: "text-yellow-400",
    desc: "Valuable piece, but not in the starting five.",
  },
  cut: {
    label: "CUT",
    emoji: "✂️",
    bg: "bg-red-900/40",
    border: "border-red-700",
    text: "text-red-400",
    desc: "Cleared some cap space.",
  },
};

function getResultComment(assignments: Assignments, trio: Trio): string {
  const startPlayer = trio.players.find((p) => assignments[p.id] === "start");
  const cutPlayer = trio.players.find((p) => assignments[p.id] === "cut");

  if (!startPlayer || !cutPlayer) return "Bold choices. The debates continue.";

  const controversial: Record<string, string> = {
    jordan: "MJ above everyone? Hard to argue.",
    lebron: "The King gets the nod. 4 rings speak volumes.",
    kobe: "Mamba mentality earns the start.",
    kareem: "6 MVPs. The GOAT pick.",
    wilt: "100 points in a game. Hard to cut.",
    jokic: "The Joker leading the charge — classic chess move.",
    giannis: "The Greek Freak starting — bully ball incoming.",
    curry: "Greatest shooter ever gets the keys.",
    magic: "Showtime runs through Magic.",
    bird: "The hick from French Lick delivers again.",
  };

  const cutComment: Record<string, string> = {
    jordan: "You cut Michael Jordan?! Bold.",
    lebron: "LeBron on the bench/cut? Twitter is coming for you.",
    kobe: "No more Mamba Mentality on your squad.",
    russell: "11 rings and still cut. Ruthless.",
    shaq: "No Shaq? Hope your center can score.",
    cp3: "No Point God. Hope your offense figures itself out.",
  };

  if (cutComment[cutPlayer.id]) return cutComment[cutPlayer.id];
  if (controversial[startPlayer.id]) return controversial[startPlayer.id];
  return `${startPlayer.name} leads your squad. Solid choice.`;
}

export default function ResultScreen({
  trio,
  assignments,
  onPlayAgain,
}: {
  trio: Trio;
  assignments: Assignments;
  onPlayAgain: () => void;
}) {
  const comment = getResultComment(assignments, trio);
  const roleOrder: Role[] = ["start", "bench", "cut"];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors">
          <span className="text-lg">🏀</span>
          <span className="font-bold text-sm tracking-wide">NBA TRIVIA</span>
        </a>
        <span className="text-xs text-gray-500 uppercase tracking-widest">Start · Bench · Cut</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-10 max-w-2xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-8">
          <p className="text-xs text-orange-400 uppercase tracking-widest font-semibold mb-2">
            Your results — {trio.category}
          </p>
          <h2 className="text-3xl font-black text-white">Your Picks</h2>
          <p className="text-gray-400 text-sm mt-2 italic">"{comment}"</p>
        </div>

        <div className="flex flex-col gap-4 w-full mb-10">
          {roleOrder.map((role) => {
            const player = trio.players.find((p) => assignments[p.id] === role);
            if (!player) return null;
            const cfg = ROLE_CONFIG[role];

            return (
              <div
                key={role}
                className={`flex items-center gap-4 rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border} animate-scale-in`}
              >
                {/* Jersey */}
                <div
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-white text-lg shadow-md shrink-0"
                  style={{ backgroundColor: player.teamColor }}
                >
                  <span className="leading-none">{player.jersey}</span>
                  <span className="text-[8px] font-bold opacity-80">{player.position}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base leading-tight truncate">{player.name}</p>
                  <p className="text-gray-400 text-xs truncate">{player.team}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{cfg.desc}</p>
                </div>

                {/* Badge */}
                <div className={`text-right shrink-0 ${cfg.text}`}>
                  <div className="text-2xl">{cfg.emoji}</div>
                  <div className="text-xs font-bold tracking-wider mt-0.5">{cfg.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-xl tracking-wide uppercase transition-all active:scale-95 shadow-lg shadow-orange-500/25"
          >
            Next Trio →
          </button>
          <button
            onClick={() => {
              const lines = [
                `🏀 NBA Trivia — ${trio.category}`,
                "",
                ...roleOrder.map((r) => {
                  const p = trio.players.find((p) => assignments[p.id] === r);
                  const cfg = ROLE_CONFIG[r];
                  return `${cfg.emoji} ${cfg.label}: ${p?.name}`;
                }),
                "",
                "Play at nba-trivia.app",
              ];
              navigator.clipboard.writeText(lines.join("\n")).catch(() => {});
            }}
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-sm rounded-xl tracking-wide uppercase transition-all active:scale-95"
          >
            Copy Results
          </button>
        </div>
      </main>
    </div>
  );
}
