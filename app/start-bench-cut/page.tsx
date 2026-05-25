"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TRIOS, type Trio } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import PlayerCard from "./PlayerCard";
import ResultScreen from "./ResultScreen";
import GameHeader from "@/app/components/GameHeader";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };
type Era = "alltime" | "current";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function EraTab({ era, setEra }: { era: Era; setEra: (e: Era) => void }) {
  return (
    <div className="sticky top-[52px] z-30 backdrop-blur-md border-b overflow-hidden" style={{ background: "rgba(244,240,230,0.95)", borderColor: "rgba(0,0,0,0.09)" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 py-2.5">
        {(["alltime", "current"] as const).map(e => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className="relative px-5 py-2 text-sm font-bold transition-all duration-200 font-bebas tracking-widest"
            style={era === e ? {
              background: e === "current"
                ? "linear-gradient(90deg, #0ea5e9, #0284c7)"
                : "linear-gradient(90deg, #84cc16, #65a30d)",
              color: "#111827",
              clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)",
            } : { color: "#6b7280" }}
          >
            {e === "alltime" ? "ALL-TIME LEGENDS" : "CURRENT 2025–26"}
          </button>
        ))}
      </div>
    </div>
  );
}

// Inner game — fully remounts when era changes via key prop
function StartBenchCutCore({ era }: { era: Era }) {
  const trios = era === "current" ? CURRENT_TRIOS : TRIOS;
  const [shuffledTrios] = useState(() => shuffleArray([...Array(trios.length).keys()]));
  const [roundIndex, setRoundIndex] = useState(0);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const trio: Trio = trios[shuffledTrios[roundIndex % shuffledTrios.length]];
  const assignedRoles = Object.values(assignments) as Role[];
  const takenRoles = new Set(assignedRoles);

  const handlePlayerClick = useCallback((playerId: string) => {
    if (submitted) return;
    setSelectedPlayer(prev => prev === playerId ? null : playerId);
  }, [submitted]);

  const handleRoleClick = useCallback((role: Role) => {
    if (!selectedPlayer || submitted) return;
    setAssignments(prev => {
      const next = { ...prev };
      const existingHolder = Object.entries(next).find(([pid, r]) => r === role && pid !== selectedPlayer);
      if (existingHolder) delete next[existingHolder[0]];
      if (next[selectedPlayer] === role) delete next[selectedPlayer];
      else next[selectedPlayer] = role;
      return next;
    });
    setSelectedPlayer(null);
  }, [selectedPlayer, submitted]);

  const handleSubmit = () => {
    if (Object.keys(assignments).length === 3) setSubmitted(true);
  };

  const handleNextRound = () => {
    setRoundIndex(r => (r + 1) % trios.length);
    setAssignments({});
    setSelectedPlayer(null);
    setSubmitted(false);
  };

  const allAssigned = Object.keys(assignments).length === 3;

  if (submitted) {
    return <ResultScreen trio={trio} assignments={assignments} onPlayAgain={handleNextRound} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-6">
        <p className="text-xs text-[#65a30d] font-semibold uppercase tracking-widest mb-1">
          Round {roundIndex + 1} of {trios.length}
        </p>
        <h1 className="text-2xl font-bebas tracking-widest text-[#111827]">{trio.category}</h1>
        <p className="text-gray-500 text-sm mt-1">{trio.description}</p>
      </div>

      <div className="mb-5 text-center">
        {selectedPlayer ? (
          <p className="text-[#65a30d] text-sm font-semibold">
            Assign a role for{" "}
            <span className="text-[#111827] font-bold">
              {trio.players.find(p => p.id === selectedPlayer)?.name.split(" ")[0]}
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">Tap a player, then assign their role</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-6">
        {trio.players.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            role={assignments[player.id] ?? null}
            isSelected={selectedPlayer === player.id}
            onClick={() => handlePlayerClick(player.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
        <RoleButton role="start" label="START" emoji="⭐" color="green" taken={takenRoles.has("start")} active={!!selectedPlayer} onClick={() => handleRoleClick("start")} />
        <RoleButton role="bench" label="BENCH" emoji="🪑" color="yellow" taken={takenRoles.has("bench")} active={!!selectedPlayer} onClick={() => handleRoleClick("bench")} />
        <RoleButton role="cut" label="CUT" emoji="✂️" color="red" taken={takenRoles.has("cut")} active={!!selectedPlayer} onClick={() => handleRoleClick("cut")} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAssigned}
        className={`px-10 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200
          ${allAssigned
            ? "bg-[#84cc16] hover:bg-[#65a30d] text-[#111827] active:scale-95"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {allAssigned ? "Submit My Picks →" : `Assign ${3 - Object.keys(assignments).length} more`}
      </button>
    </main>
  );
}

function StartBenchCutGame() {
  const searchParams = useSearchParams();
  const [era, setEra] = useState<Era>(
    searchParams.get("era") === "current" ? "current" : "alltime"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <GameHeader title="Start · Bench · Cut" era={era} />
      <EraTab era={era} setEra={setEra} />
      <StartBenchCutCore key={era} era={era} />
    </div>
  );
}

export default function StartBenchCutPage() {
  return (
    <Suspense>
      <StartBenchCutGame />
    </Suspense>
  );
}

function RoleButton({ label, emoji, color, taken, active, onClick }: {
  role: Role; label: string; emoji: string; color: "green" | "yellow" | "red";
  taken: boolean; active: boolean; onClick: () => void;
}) {
  const colorMap = {
    green:  { base: "border-green-200 bg-green-50 text-green-300",   active: "border-green-400 bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer",   taken: "border-green-400 bg-green-100 text-green-700" },
    yellow: { base: "border-yellow-200 bg-yellow-50 text-yellow-300", active: "border-yellow-400 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer", taken: "border-yellow-400 bg-yellow-100 text-yellow-700" },
    red:    { base: "border-red-200 bg-red-50 text-red-300",          active: "border-red-400 bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer",           taken: "border-red-400 bg-red-100 text-red-700" },
  };
  const classes = taken ? colorMap[color].taken : active ? colorMap[color].active : colorMap[color].base;
  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active}
      className={`flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 font-bold text-xs tracking-widest transition-all duration-150 select-none ${classes} ${active && !taken ? "active:scale-95" : ""}`}
    >
      <span className="text-2xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
