"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TRIOS, type Trio } from "@/lib/playerData";
import { CURRENT_TRIOS } from "@/lib/currentPlayerData";
import PlayerCard from "./PlayerCard";
import ResultScreen from "./ResultScreen";
import GameHeader from "@/app/components/GameHeader";

type Role = "start" | "bench" | "cut";
type Assignments = { [playerId: string]: Role };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StartBenchCutGame() {
  const searchParams = useSearchParams();
  const era = searchParams.get("era") === "current" ? "current" : "alltime";
  const trios = era === "current" ? CURRENT_TRIOS : TRIOS;

  const [shuffledTrios, setShuffledTrios] = useState(() => [...Array(trios.length).keys()]);
  const [roundIndex, setRoundIndex] = useState(0);
  useEffect(() => { setShuffledTrios(shuffleArray([...Array(trios.length).keys()])); }, [era]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const trio: Trio = trios[shuffledTrios[roundIndex]];
  const assignedRoles = Object.values(assignments) as Role[];
  const takenRoles = new Set(assignedRoles);

  const handlePlayerClick = useCallback((playerId: string) => {
    if (submitted) return;
    setSelectedPlayer((prev) => (prev === playerId ? null : playerId));
  }, [submitted]);

  const handleRoleClick = useCallback((role: Role) => {
    if (!selectedPlayer || submitted) return;
    setAssignments((prev) => {
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
    setRoundIndex((roundIndex + 1) % trios.length);
    setAssignments({});
    setSelectedPlayer(null);
    setSubmitted(false);
  };

  const allAssigned = Object.keys(assignments).length === 3;

  if (submitted) {
    return <ResultScreen trio={trio} assignments={assignments} onPlayAgain={handleNextRound} />;
  }

  return (
    <div className="min-h-screen flex flex-col court-bg">
      <GameHeader title="Start · Bench · Cut" era={era} />

      <main className="flex-1 flex flex-col items-center px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-6">
          <p className="text-xs text-teal-200 font-semibold uppercase tracking-widest mb-1">
            Round {roundIndex + 1} of {trios.length}
          </p>
          <h1 className="text-2xl font-bold text-white">{trio.category}</h1>
          <p className="text-teal-100 text-sm mt-1">{trio.description}</p>
        </div>

        <div className="mb-5 text-center">
          {selectedPlayer ? (
            <p className="text-teal-100 text-sm font-semibold">
              Assign a role for{" "}
              <span className="text-white font-bold">
                {trio.players.find((p) => p.id === selectedPlayer)?.name.split(" ")[0]}
              </span>
            </p>
          ) : (
            <p className="text-teal-100 text-sm">Tap a player, then assign their role</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-6">
          {trio.players.map((player) => (
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
              ? "bg-zinc-900 hover:bg-zinc-700 text-white active:scale-95 shadow-sm"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
            }`}
        >
          {allAssigned ? "Submit My Picks →" : `Assign ${3 - Object.keys(assignments).length} more`}
        </button>
      </main>
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

type Role2 = "start" | "bench" | "cut";

function RoleButton({ label, emoji, color, taken, active, onClick }: {
  role: Role2; label: string; emoji: string; color: "green" | "yellow" | "red";
  taken: boolean; active: boolean; onClick: () => void;
}) {
  const colorMap = {
    green: {
      base: "border-green-200 bg-green-50 text-green-400",
      active: "border-green-400 bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer",
      taken: "border-green-400 bg-green-100 text-green-700",
    },
    yellow: {
      base: "border-yellow-200 bg-yellow-50 text-yellow-400",
      active: "border-yellow-400 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer",
      taken: "border-yellow-400 bg-yellow-100 text-yellow-700",
    },
    red: {
      base: "border-red-200 bg-red-50 text-red-300",
      active: "border-red-400 bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer",
      taken: "border-red-400 bg-red-100 text-red-700",
    },
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
