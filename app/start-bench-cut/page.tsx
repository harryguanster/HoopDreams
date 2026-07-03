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
    <div className="sticky top-[52px] z-30" style={{ background: "#f4f0e6", borderBottom: "2px solid #111827" }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-0 py-0">
        {(["alltime", "current"] as const).map((e, i) => (
          <button
            key={e}
            onClick={() => setEra(e)}
            className="px-6 py-3 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-colors"
            style={{
              borderRight: i === 0 ? "2px solid #111827" : undefined,
              background: era === e ? "#111827" : "#f4f0e6",
              color: era === e ? "#84cc16" : "#111827",
            }}
          >
            {e === "alltime" ? "All-Time Legends" : "Current 2025–26"}
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
    <main className="flex-1 flex flex-col items-center px-6 py-10 max-w-7xl mx-auto w-full">
      {/* Round / Category header */}
      <div className="w-full border-2 border-[#111827] mb-8">
        <div className="px-6 py-5" style={{ background: "#111827" }}>
          <p className="font-mono font-bold uppercase tracking-[0.25em] text-[10px] text-[#84cc16] mb-2">
            Round {roundIndex + 1} of {trios.length}
          </p>
          <h1 className="font-playfair font-black italic text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
            {trio.category}
          </h1>
        </div>
        <div className="px-6 py-3" style={{ background: "#f4f0e6", borderTop: "2px solid #111827" }}>
          <p className="font-mono text-xs text-gray-400">{trio.description}</p>
        </div>
      </div>

      <div className="mb-6 text-center">
        {selectedPlayer ? (
          <p className="font-mono text-sm text-[#84cc16] font-bold uppercase tracking-[0.1em]">
            Assign a role for{" "}
            <span className="text-[#111827]">
              {trio.players.find(p => p.id === selectedPlayer)?.name.split(" ")[0]}
            </span>
          </p>
        ) : (
          <p className="font-mono text-xs text-gray-400 uppercase tracking-[0.15em]">Tap a player, then assign their role</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-8">
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

      <div className="grid grid-cols-3 gap-0 w-full max-w-2xl mb-8 border-2 border-[#111827]">
        <RoleButton role="start" label="START" emoji="⭐" color="green" taken={takenRoles.has("start")} active={!!selectedPlayer} onClick={() => handleRoleClick("start")} />
        <RoleButton role="bench" label="BENCH" emoji="🪑" color="yellow" taken={takenRoles.has("bench")} active={!!selectedPlayer} onClick={() => handleRoleClick("bench")} />
        <RoleButton role="cut" label="CUT" emoji="✂️" color="red" taken={takenRoles.has("cut")} active={!!selectedPlayer} onClick={() => handleRoleClick("cut")} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAssigned}
        className="px-14 py-4 font-mono font-bold text-sm uppercase tracking-[0.1em] border-2 transition-colors"
        style={allAssigned
          ? { background: "#84cc16", borderColor: "#111827", color: "#111827" }
          : { background: "#f4f0e6", borderColor: "#d1d5db", color: "#d1d5db", cursor: "not-allowed" }}
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
    <div className="min-h-screen flex flex-col" style={{ background: "#f4f0e6" }}>
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
    green:  {
      base:   { background: "#f4f0e6", color: "#d1d5db" },
      active: { background: "#f4f0e6", color: "#111827" },
      taken:  { background: "#84cc16", color: "#111827" },
    },
    yellow: {
      base:   { background: "#f4f0e6", color: "#d1d5db" },
      active: { background: "#f4f0e6", color: "#111827" },
      taken:  { background: "#f59e0b", color: "#111827" },
    },
    red: {
      base:   { background: "#f4f0e6", color: "#d1d5db" },
      active: { background: "#f4f0e6", color: "#111827" },
      taken:  { background: "#ef4444", color: "#ffffff" },
    },
  };
  const styleObj = taken ? colorMap[color].taken : active ? colorMap[color].active : colorMap[color].base;

  return (
    <button
      onClick={active ? onClick : undefined}
      disabled={!active && !taken}
      className="flex flex-col items-center justify-center gap-2 py-6 font-mono font-bold text-sm uppercase tracking-[0.1em] transition-all duration-150 select-none"
      style={{
        ...styleObj,
        borderRight: color !== "red" ? "2px solid #111827" : undefined,
        cursor: active ? "pointer" : "default",
      }}
    >
      <span className="text-3xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
