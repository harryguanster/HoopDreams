"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import {
  LEAGUE_TEAMS, simulateSeason, simulatePlayoffs, computeUserRating,
  generateDraftClass, generateFreeAgents,
  type LeagueTeam, type StandingEntry, type RosterPlayer,
  type Prospect, type FreeAgent, type PlayoffResult, type Conference,
} from "@/lib/franchiseData";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";

// ─── Salary / rank data ────────────────────────────────────────────────────────
const SALARY_CAP = 100;

const RINGER_RANKINGS: Record<string, number> = {
  jokic: 1, sga: 2, giannis: 3, luka: 4, ant: 5, wemby: 6,
  curry: 7, brunson: 8, dmitchell: 9, cade: 10,
  lebron: 11, ad: 12, durant: 13, jwilliams2: 14, mobley: 15, tatum: 16,
  jbrown: 17, booker: 18, banchero: 19, siakam: 20,
  kat: 21, kawhi: 22, harden: 23, jbutler: 24, bam: 25, defox: 26,
  trae: 27, sengun: 28, jjackson: 29, cholmgren: 30,
  sabonis: 31, tmaxey: 32, garland: 33, ja: 34, fwagner: 35, jmurray: 36,
  embiid: 37, sbarnes: 38, oganunoby: 39, haliburton: 40,
  athompson: 41, dame: 42, dbane: 43, agordon: 44, jrandle: 45, therro: 46,
  lmarkkanen: 47, lamelo: 48, jallen: 49, mikalbridg: 50,
  areaves: 51, lavine: 52, kyrie: 53, dwhite: 54, dgreen: 55, zubac: 56,
  zion: 57, jjohnson: 58, gobert: 59, mturner: 60,
  npowell: 61, ddaniels: 62, pgeorge: 63, mporter: 64, jhart: 65, acaruso: 66,
  porzingis: 67, cjohnson: 68, ihartenstein: 69, cwhite: 70,
  tmurphy: 71, jmcdaniels: 72, ldort: 73, jsuggs: 74, bingram: 75, nreid: 76,
  cbraun: 77, ppritchard: 78, giddey: 79, bmiller: 80,
  holiday: 81, anembhard: 82, cflagg: 83, rjbarrett: 84, dehunter: 85, anesmith: 86,
  vucevic: 87, cjmcc: 88, tcamara: 89, dlively: 90,
  jgreen2: 91, asimons: 92, tharris: 93, dvassell: 94, kthompson: 95, jsmith: 96,
};

const RANK_TIERS = [
  { max: 6,         price: 28, bg: "#fef3c7", text: "#92400e", border: "#f59e0b", label: "#1–6" },
  { max: 16,        price: 20, bg: "#ede9fe", text: "#4c1d95", border: "#8b5cf6", label: "#7–16" },
  { max: 26,        price: 15, bg: "#dbeafe", text: "#1e3a8a", border: "#60a5fa", label: "#17–26" },
  { max: 36,        price: 11, bg: "#dcfce7", text: "#14532d", border: "#4ade80", label: "#27–36" },
  { max: 46,        price:  8, bg: "#f0fdf4", text: "#166534", border: "#86efac", label: "#37–46" },
  { max: 56,        price:  6, bg: "#ecfeff", text: "#164e63", border: "#67e8f9", label: "#47–56" },
  { max: 66,        price:  5, bg: "#f0f9ff", text: "#075985", border: "#7dd3fc", label: "#57–66" },
  { max: 76,        price:  4, bg: "#faf5ff", text: "#581c87", border: "#c084fc", label: "#67–76" },
  { max: 86,        price:  3, bg: "#fdf4ff", text: "#701a75", border: "#e879f9", label: "#77–86" },
  { max: 96,        price:  2, bg: "#fff1f2", text: "#9f1239", border: "#fda4af", label: "#87–96" },
  { max: Infinity,  price:  1, bg: "#f1f5f9", text: "#475569", border: "#94a3b8", label: "NR" },
] as const;

function playerRank(p: CurrentNBAPlayer): number { return RINGER_RANKINGS[p.id] ?? 999; }
function rankTier(rank: number) { return RANK_TIERS.find(t => rank <= t.max)!; }
function playerSalary(p: CurrentNBAPlayer): number { return rankTier(playerRank(p)).price; }

// ─── Slot definitions ──────────────────────────────────────────────────────────
const SLOT_DEFS = [
  { id: "pg",    label: "POINT GUARD",    defaultMin: 36 },
  { id: "sg",    label: "SHOOT GUARD",    defaultMin: 30 },
  { id: "sf",    label: "SMALL FORWARD",  defaultMin: 28 },
  { id: "pf",    label: "POWER FORWARD",  defaultMin: 28 },
  { id: "c",     label: "CENTER",         defaultMin: 28 },
  { id: "6th",   label: "6TH MAN",        defaultMin: 24 },
  { id: "rot1",  label: "ROTATION",       defaultMin: 20 },
  { id: "rot2",  label: "ROTATION",       defaultMin: 16 },
  { id: "rot3",  label: "ROTATION",       defaultMin: 12 },
  { id: "rot4",  label: "ROTATION",       defaultMin: 10 },
  { id: "lpt",   label: "LIMITED PT",     defaultMin:  6 },
  { id: "bench", label: "DEEP BENCH",     defaultMin:  2 },
] as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
type Phase = "setup" | "build" | "simulating" | "standings" | "playoffs" | "offseason";

type ContractSlot = {
  slotId: string;
  label: string;
  player: CurrentNBAPlayer | null;
  isNBA: boolean;
  nbaPlayer: CurrentNBAPlayer | null;
  rosterPlayer: RosterPlayer | null;
  salary: number;
  minutes: number;
  yearsLeft: number;
};

// ─── Small helpers ─────────────────────────────────────────────────────────────
function fmt1(n: number) { return n.toFixed(1); }

function Avatar({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: color + "22", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 27" fill={color + "cc"}>
        <circle cx="12" cy="7" r="5"/>
        <path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
      </svg>
    </div>
  );
}

function TierBadge({ rank, small }: { rank: number; small?: boolean }) {
  const t = rankTier(rank);
  const label = rank <= 96 ? `#${rank}` : "NR";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      height: small ? 16 : 20, minWidth: small ? 28 : 34, paddingInline: 4, borderRadius: 4,
      background: t.bg, border: `1px solid ${t.border}`, color: t.text,
      fontSize: small ? 8 : 9, fontFamily: "var(--font-bebas)", letterSpacing: "0.04em", fontWeight: 700, flexShrink: 0,
    }}>{label}</span>
  );
}

function ContractBadge({ years }: { years: number }) {
  const color = years <= 0 ? "#ef4444" : years === 1 ? "#f59e0b" : "#22c55e";
  const bg    = years <= 0 ? "#fee2e2" : years === 1 ? "#fef3c7" : "#dcfce7";
  return (
    <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: bg, color, border: `1px solid ${color}60`, flexShrink: 0 }}>
      {years <= 0 ? "UFA" : `${years}yr`}
    </span>
  );
}

// ─── Roster Slot Card ──────────────────────────────────────────────────────────
function RosterSlotCard({
  slot, isActive, onClick, onRemove, onMins,
}: {
  slot: ContractSlot;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
  onMins: (v: number) => void;
}) {
  const filled = slot.player !== null || slot.rosterPlayer !== null;
  const name   = slot.nbaPlayer?.name ?? slot.rosterPlayer?.name ?? null;
  const ppg    = slot.nbaPlayer?.ppg  ?? slot.rosterPlayer?.ppg  ?? 0;
  const pos    = slot.nbaPlayer?.position ?? "";
  const color  = slot.nbaPlayer?.teamColor ?? "#84cc16";
  const rank   = slot.nbaPlayer ? playerRank(slot.nbaPlayer) : 999;

  return (
    <div
      onClick={filled ? undefined : onClick}
      style={{
        borderRadius: 10, border: isActive && !filled ? "2px solid #84cc16" : "1.5px solid rgba(0,0,0,0.09)",
        background: isActive && !filled ? "rgba(132,204,22,0.04)" : "white",
        boxShadow: isActive && !filled ? "0 0 0 3px rgba(132,204,22,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
        cursor: filled ? "default" : "pointer",
        overflow: "hidden", transition: "box-shadow 0.15s, border-color 0.15s",
        marginBottom: 6,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 10px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <span style={{ flex: 1, fontSize: 8, fontFamily: "var(--font-bebas)", letterSpacing: "0.18em", color: "#9ca3af" }}>{slot.label}</span>
        {filled && (
          <>
            <ContractBadge years={slot.yearsLeft} />
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(0,0,0,0.04)", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "#9ca3af"; }}
            >×</button>
          </>
        )}
      </div>

      {filled ? (
        <div style={{ padding: "8px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar color={color} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.82rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <TierBadge rank={rank} small />
                <span style={{ fontSize: 9, color: "#65a30d", fontFamily: "monospace", fontWeight: 700 }}>${slot.salary}M</span>
                <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "monospace" }}>{pos}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="range" min={0} max={48} step={1} value={slot.minutes}
              onChange={e => onMins(Number(e.target.value))}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, accentColor: "#84cc16", height: 3 }}
            />
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#374151", width: 28, textAlign: "right", flexShrink: 0 }}>{slot.minutes}m</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 10px" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isActive ? "rgba(132,204,22,0.12)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 27" fill={isActive ? "#84cc16" : "#d1d5db"}>
              <circle cx="12" cy="7" r="5"/><path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
            </svg>
          </div>
          <p style={{ fontSize: 10, color: isActive ? "#65a30d" : "#9ca3af", fontFamily: "monospace", fontWeight: isActive ? 600 : 400 }}>
            {isActive ? "← Pick a player" : "Empty Slot"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Standings table ───────────────────────────────────────────────────────────
function StandingsTable({ entries, userAbbr }: { entries: StandingEntry[]; userAbbr: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "22px 1fr 44px 44px 60px", padding: "5px 10px", background: "#f8f7f2", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        {["#","Team","W","L","GB"].map(h => <span key={h} style={{ fontSize: 8, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>)}
      </div>
      {entries.map((e, i) => {
        const isUser = e.abbr === userAbbr;
        const inPlayoffs = i < 8;
        const gb = i === 0 ? "—" : ((entries[0].wins - e.wins) / 2).toFixed(1);
        return (
          <div
            key={e.abbr}
            style={{
              display: "grid", gridTemplateColumns: "22px 1fr 44px 44px 60px",
              padding: "6px 10px", alignItems: "center",
              background: isUser ? "rgba(132,204,22,0.08)" : i % 2 === 0 ? "white" : "#fafaf7",
              borderBottom: "1px solid rgba(0,0,0,0.04)",
              borderLeft: isUser ? "3px solid #84cc16" : "3px solid transparent",
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: inPlayoffs ? "#374151" : "#9ca3af" }}>{i + 1}</span>
            <span style={{ fontSize: 11, fontWeight: isUser ? 800 : 600, color: isUser ? "#1a3a00" : "#374151", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: e.color, flexShrink: 0, display: "inline-block" }} />
              {e.abbr}
              {!inPlayoffs && <span style={{ fontSize: 8, color: "#c4b5a0", fontWeight: 400, marginLeft: 2 }}>lotto</span>}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontVariantNumeric: "tabular-nums" }}>{e.wins}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{e.losses}</span>
            <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}>{gb}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Playoff Bracket ───────────────────────────────────────────────────────────
function PlayoffBracket({ results, userAbbr, champion }: { results: PlayoffResult; userAbbr: string; champion: StandingEntry | null }) {
  const roundOrder = ["East First Round", "East Semis", "East Finals", "West First Round", "West Semis", "West Finals", "NBA Finals"];
  const byRound = Object.fromEntries(results.map(r => [r.round, r.series]));

  function SeriesCard({ series, userAbbr }: { series: PlayoffResult[0]["series"][0]; userAbbr: string }) {
    const userInvolved = series.winner.abbr === userAbbr || series.loser.abbr === userAbbr;
    const userWon = series.winner.abbr === userAbbr;

    return (
      <div style={{
        borderRadius: 8, overflow: "hidden",
        border: userInvolved ? (userWon ? "1.5px solid rgba(132,204,22,0.5)" : "1.5px solid rgba(239,68,68,0.35)") : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: userInvolved ? (userWon ? "0 2px 12px rgba(132,204,22,0.15)" : "0 2px 12px rgba(239,68,68,0.1)") : "none",
      }}>
        {/* Winner */}
        <div style={{ padding: "6px 10px", background: userWon && userInvolved ? "rgba(132,204,22,0.1)" : "#f8f7f4", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: series.winner.color, flexShrink: 0, display: "inline-block" }} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 800, color: series.winner.abbr === userAbbr ? "#1a3a00" : "#111827" }}>{series.winner.abbr}</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{series.winsW}</span>
        </div>
        {/* Loser */}
        <div style={{ padding: "6px 10px", background: "white", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: series.loser.color, flexShrink: 0, display: "inline-block", opacity: 0.5 }} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#6b7280" }}>{series.loser.abbr}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{series.winsL}</span>
        </div>
      </div>
    );
  }

  function RoundSection({ roundName, label }: { roundName: string; label: string }) {
    const series = byRound[roundName];
    if (!series) return null;
    return (
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {series.map((s, i) => <SeriesCard key={i} series={s} userAbbr={userAbbr} />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* East */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Eastern Conference</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <RoundSection roundName="East First Round" label="First Round" />
          <RoundSection roundName="East Semis" label="Conf. Semis" />
          <RoundSection roundName="East Finals" label="Conf. Finals" />
        </div>
      </div>

      {/* West */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Western Conference</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <RoundSection roundName="West First Round" label="First Round" />
          <RoundSection roundName="West Semis" label="Conf. Semis" />
          <RoundSection roundName="West Finals" label="Conf. Finals" />
        </div>
      </div>

      {/* Finals */}
      {byRound["NBA Finals"] && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg, #fef3c7 0%, #fef9ec 100%)", border: "2px solid #f59e0b", marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, textAlign: "center" }}>🏆 NBA Finals</p>
          <div style={{ maxWidth: 280, margin: "0 auto" }}>
            {byRound["NBA Finals"].map((s, i) => <SeriesCard key={i} series={s} userAbbr={userAbbr} />)}
          </div>
        </div>
      )}

      {/* Champion banner */}
      {champion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            textAlign: "center", padding: "20px 24px", borderRadius: 14,
            background: champion.abbr === userAbbr ? "linear-gradient(135deg, rgba(132,204,22,0.18), rgba(132,204,22,0.06))" : "linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.02))",
            border: champion.abbr === userAbbr ? "2px solid rgba(132,204,22,0.45)" : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>{champion.abbr === userAbbr ? "🏆" : "💔"}</div>
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#111827", lineHeight: 1 }}>
            {champion.abbr === userAbbr ? "NBA Champions!" : `${champion.name} win the title`}
          </p>
          {champion.abbr !== userAbbr && (
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
              Better luck next season
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FranchisePage() {
  const [phase, setPhase]                 = useState<Phase>("setup");
  const [season, setSeason]               = useState(1);
  const [chosenTeam, setChosenTeam]       = useState<LeagueTeam | null>(null);
  const [confFilter, setConfFilter]       = useState<"East" | "West">("East");

  // Roster state
  const [slots, setSlots] = useState<ContractSlot[]>(
    SLOT_DEFS.map(d => ({
      slotId: d.id, label: d.label,
      player: null, isNBA: true, nbaPlayer: null, rosterPlayer: null,
      salary: 0, minutes: d.defaultMin, yearsLeft: 2,
    }))
  );
  const [activeSlot, setActiveSlot] = useState<string | null>(SLOT_DEFS[0].id);

  // Player list filters
  const [search, setSearch]       = useState("");
  const [teamFilter, setTeamFilter]   = useState("All Teams");
  const [posFilter, setPosFilter] = useState("All");

  // Season / playoff data
  const [standingsData, setStandingsData] = useState<{ east: StandingEntry[]; west: StandingEntry[] } | null>(null);
  const [playoffResults, setPlayoffResults] = useState<PlayoffResult | null>(null);
  const [champion, setChampion]           = useState<StandingEntry | null>(null);
  const [draftClass, setDraftClass]       = useState<Prospect[]>([]);
  const [freeAgents, setFreeAgents]       = useState<FreeAgent[]>([]);
  const [totalWins, setTotalWins]         = useState(0);
  const [titles, setTitles]               = useState(0);
  const [simDots, setSimDots]             = useState(0);

  // ─── Sim animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "simulating") return;
    const id = setInterval(() => setSimDots(d => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [phase]);

  // ─── Derived values ─────────────────────────────────────────────────────────
  const usedSalary  = slots.reduce((s, sl) => s + sl.salary, 0);
  const capLeft     = SALARY_CAP - usedSalary;
  const filledCount = slots.filter(s => s.nbaPlayer || s.rosterPlayer).length;

  const userRating = useMemo(() => {
    const rp = slots.filter(s => s.nbaPlayer || s.rosterPlayer).map(sl => ({
      name: sl.nbaPlayer?.name ?? sl.rosterPlayer?.name ?? "",
      ppg: sl.nbaPlayer?.ppg ?? sl.rosterPlayer?.ppg ?? 10,
      rpg: sl.nbaPlayer?.rpg ?? sl.rosterPlayer?.rpg ?? 4,
      apg: sl.nbaPlayer?.apg ?? sl.rosterPlayer?.apg ?? 2,
      salary: sl.salary, minutes: sl.minutes,
    }));
    return computeUserRating(rp);
  }, [slots]);

  const teamList = useMemo(() => {
    const teams = [...new Set(CURRENT_NBA_PLAYERS.map(p => p.team))].sort();
    return ["All Teams", ...teams];
  }, []);

  const filteredPlayers = useMemo(() => {
    const usedIds = new Set(slots.filter(s => s.nbaPlayer).map(s => s.nbaPlayer!.id));
    const q = search.toLowerCase();
    return CURRENT_NBA_PLAYERS
      .filter(p => {
        if (usedIds.has(p.id)) return false;
        if (q && !p.name.toLowerCase().includes(q)) return false;
        if (teamFilter !== "All Teams" && p.team !== teamFilter) return false;
        if (posFilter !== "All" && p.position !== posFilter) return false;
        return true;
      })
      .sort((a, b) => playerRank(a) - playerRank(b));
  }, [slots, search, teamFilter, posFilter]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  function selectPlayer(p: CurrentNBAPlayer) {
    const sal = playerSalary(p);
    if (capLeft < sal) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    setSlots(prev => prev.map(sl => {
      if (sl.slotId !== targetId) return sl;
      return { ...sl, nbaPlayer: p, rosterPlayer: null, isNBA: true, salary: sal, yearsLeft: 2 };
    }));
    // advance active slot
    const idx = SLOT_DEFS.findIndex(d => d.id === targetId);
    const next = SLOT_DEFS.slice(idx + 1).find(d => {
      const s = slots.find(sl => sl.slotId === d.id);
      return !s?.nbaPlayer && !s?.rosterPlayer;
    });
    setActiveSlot(next?.id ?? null);
    setSearch("");
  }

  function removePlayer(slotId: string) {
    const def = SLOT_DEFS.find(d => d.id === slotId)!;
    setSlots(prev => prev.map(sl => sl.slotId !== slotId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: null, isNBA: true, salary: 0, minutes: def.defaultMin, yearsLeft: 2,
    }));
    setActiveSlot(slotId);
  }

  function setMins(slotId: string, mins: number) {
    setSlots(prev => prev.map(sl => sl.slotId === slotId ? { ...sl, minutes: mins } : sl));
  }

  function signFA(fa: FreeAgent) {
    if (capLeft < fa.salary || filledCount >= 12) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const rp: RosterPlayer = { name: fa.name, ppg: fa.ppg, rpg: fa.rpg, apg: fa.apg, salary: fa.salary, minutes: 20 };
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: rp, isNBA: false, salary: fa.salary, yearsLeft: 2,
    }));
    setFreeAgents(prev => prev.filter(f => f.name !== fa.name));
    const idx = SLOT_DEFS.findIndex(d => d.id === targetId);
    const next = SLOT_DEFS.slice(idx + 1).find(d => {
      const s = slots.find(sl => sl.slotId === d.id);
      return !s?.nbaPlayer && !s?.rosterPlayer;
    });
    setActiveSlot(next?.id ?? null);
  }

  function draftProspect(p: Prospect) {
    if (filledCount >= 12) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const rp: RosterPlayer = { name: p.name, ppg: p.ppg, rpg: p.rpg, apg: p.apg, salary: p.salary, minutes: 15 };
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: rp, isNBA: false, salary: p.salary, yearsLeft: 2,
    }));
    setDraftClass(prev => prev.filter(d => d.name !== p.name));
    const idx = SLOT_DEFS.findIndex(d => d.id === targetId);
    const next = SLOT_DEFS.slice(idx + 1).find(d => {
      const s = slots.find(sl => sl.slotId === d.id);
      return !s?.nbaPlayer && !s?.rosterPlayer;
    });
    setActiveSlot(next?.id ?? null);
  }

  function extendPlayer(slotId: string) {
    setSlots(prev => prev.map(sl => {
      if (sl.slotId !== slotId) return sl;
      const newSal = Math.min(28, Math.round(sl.salary * 1.25));
      return { ...sl, yearsLeft: 2, salary: newSal };
    }));
  }

  function releasePlayer(slotId: string) {
    removePlayer(slotId);
  }

  // ─── Season simulation ───────────────────────────────────────────────────────
  function runSeason() {
    if (!chosenTeam || filledCount < 12) return;
    setPhase("simulating");
    setTimeout(() => {
      const result = simulateSeason(userRating, chosenTeam.name, chosenTeam.abbr, chosenTeam.conf, chosenTeam.color);
      const allEntries = [...result.east, ...result.west];
      const userEntry = allEntries.find(e => e.isUser);
      if (userEntry) setTotalWins(w => w + userEntry.wins);
      setStandingsData(result);

      // Tick down contracts
      setSlots(prev => prev.map(sl => ({ ...sl, yearsLeft: Math.max(0, sl.yearsLeft - 1) })));
      setPhase("standings");
    }, 2200);
  }

  function runPlayoffs() {
    if (!standingsData || !chosenTeam) return;
    const { results, champion: champ } = simulatePlayoffs(standingsData.east, standingsData.west);
    setPlayoffResults(results);
    setChampion(champ);
    if (champ.abbr === chosenTeam.abbr) setTitles(t => t + 1);
    setPhase("playoffs");
  }

  function goOffseason() {
    setDraftClass(generateDraftClass(2025 + season));
    setFreeAgents(generateFreeAgents(season));
    setSeason(s => s + 1);
    setStandingsData(null);
    setPlayoffResults(null);
    setChampion(null);
    setPhase("offseason");
  }

  // ─── User's seed ────────────────────────────────────────────────────────────
  function userSeed() {
    if (!standingsData || !chosenTeam) return null;
    const conf = chosenTeam.conf === "East" ? standingsData.east : standingsData.west;
    const idx  = conf.findIndex(e => e.isUser);
    return idx >= 0 ? idx + 1 : null;
  }

  function madePlayoffs() {
    const seed = userSeed();
    return seed !== null && seed <= 8;
  }

  const expiring = slots.filter(s => (s.nbaPlayer || s.rosterPlayer) && s.yearsLeft === 0);

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#f4f0e6" }}>
      <GameHeader title="Franchise Mode" />

      {/* Season bar */}
      {phase !== "setup" && chosenTeam && (
        <div style={{ background: "rgba(244,240,230,0.95)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "8px 24px", display: "flex", alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(8px)" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: chosenTeam.color, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.1em", color: "#111827" }}>{chosenTeam.name}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            {[
              { label: "Season", val: season },
              { label: "Titles", val: titles },
              { label: "Career Wins", val: totalWins },
              { label: "Rating", val: userRating.toFixed(0) },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 7, color: "#9ca3af", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════ SETUP ════ */}
      {phase === "setup" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px,6vw,52px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>Franchise Mode</p>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6, maxWidth: 500 }}>
              Pick a team, build a 12-man roster, simulate a full season, and manage your franchise year over year. Every player starts on a 2-year deal.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["East","West"] as const).map(c => (
              <button
                key={c}
                onClick={() => setConfFilter(c)}
                style={{
                  padding: "6px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: confFilter === c ? "#84cc16" : "white",
                  color: confFilter === c ? "#111827" : "#6b7280",
                  border: confFilter === c ? "1.5px solid #65a30d" : "1.5px solid #e5e7eb",
                }}
              >{c}ern</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 8 }}>
            {LEAGUE_TEAMS.filter(t => t.conf === confFilter).map(t => (
              <button
                key={t.abbr}
                onClick={() => { setChosenTeam(t); setPhase("build"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                  background: "white", border: "1.5px solid #e5e7eb", textAlign: "left",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#84cc16")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <div style={{ width: 13, height: 13, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{t.name}</p>
                  <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>OVR {t.rating}</p>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                  background: t.rating >= 87 ? "#fef3c7" : t.rating >= 78 ? "#dcfce7" : "#f1f5f9",
                  color: t.rating >= 87 ? "#92400e" : t.rating >= 78 ? "#14532d" : "#6b7280",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}>
                  {t.rating >= 87 ? "Title" : t.rating >= 78 ? "Playoff" : "Rebuild"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════ BUILD ROSTER ════ */}
      {phase === "build" && chosenTeam && (
        <div style={{ height: "calc(100vh - 112px)", display: "flex", overflow: "hidden" }}>

          {/* Left: Roster slots */}
          <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(0,0,0,0.08)", background: "rgba(244,240,230,0.5)" }}>
            {/* Cap bar */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#374151" }}>Salary Cap</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: capLeft < 8 ? "#ef4444" : "#374151" }}>${usedSalary}M / $100M</span>
              </div>
              <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", background: capLeft < 8 ? "#ef4444" : "#84cc16", width: `${Math.min(100,(usedSalary/SALARY_CAP)*100)}%`, borderRadius: 3, transition: "width 0.25s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 9, color: "#9ca3af" }}>{filledCount}/12 players</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#65a30d" }}>Rating {userRating.toFixed(0)}</span>
              </div>
            </div>

            {/* Slots list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {slots.map(sl => (
                <RosterSlotCard
                  key={sl.slotId}
                  slot={sl}
                  isActive={activeSlot === sl.slotId}
                  onClick={() => setActiveSlot(sl.slotId)}
                  onRemove={() => removePlayer(sl.slotId)}
                  onMins={v => setMins(sl.slotId, v)}
                />
              ))}
            </div>

            {/* Simulate button */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <button
                onClick={runSeason}
                disabled={filledCount < 12}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: "none",
                  background: filledCount >= 12 ? "#84cc16" : "#e5e7eb",
                  color: filledCount >= 12 ? "#111827" : "#9ca3af",
                  fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em",
                  cursor: filledCount >= 12 ? "pointer" : "not-allowed", fontWeight: 700,
                }}
              >
                {filledCount < 12 ? `Need ${12 - filledCount} more` : "Simulate Season →"}
              </button>
            </div>
          </div>

          {/* Right: Player pool */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Filters */}
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "white", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search players…"
                style={{ flex: 1, minWidth: 120, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, outline: "none", background: "#fafaf7", color: "#111827" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#84cc16")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <select
                value={posFilter}
                onChange={e => setPosFilter(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, background: "#fafaf7", color: "#374151", outline: "none" }}
              >
                {["All","PG","SG","SF","PF","C"].map(p => <option key={p}>{p}</option>)}
              </select>
              <select
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
                style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, background: "#fafaf7", color: "#374151", outline: "none", maxWidth: 140 }}
              >
                {teamList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Legend */}
            <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#fafaf7", display: "flex", gap: 10, overflowX: "auto" }}>
              {RANK_TIERS.slice(0, 6).map(t => (
                <span key={t.label} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: t.bg, color: t.text, border: `1px solid ${t.border}`, flexShrink: 0 }}>
                  {t.label} ${t.price}M
                </span>
              ))}
            </div>

            {/* Player list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {filteredPlayers.map(p => {
                const sal = playerSalary(p);
                const rank = playerRank(p);
                const canAfford = capLeft >= sal;
                const tier = rankTier(rank);
                return (
                  <button
                    key={p.id}
                    onClick={() => canAfford && selectPlayer(p)}
                    disabled={!canAfford}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "9px 16px", border: "none",
                      background: "transparent", cursor: canAfford ? "pointer" : "not-allowed",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      opacity: canAfford ? 1 : 0.4, textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (canAfford) e.currentTarget.style.background = "rgba(132,204,22,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Avatar color={p.teamColor} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.88rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{p.name}</p>
                      <p style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace", marginTop: 1 }}>
                        {p.position} · {p.team.split(" ").at(-1)} · {p.ppg}p {p.rpg}r {p.apg}a
                      </p>
                    </div>
                    <TierBadge rank={rank} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: canAfford ? "#65a30d" : "#ef4444", width: 40, textAlign: "right", flexShrink: 0 }}>${sal}M</span>
                  </button>
                );
              })}
              {filteredPlayers.length === 0 && (
                <p style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>
                  No players match your filters
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ SIMULATING ════ */}
      {phase === "simulating" && chosenTeam && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 40 }}>
          <style>{`@keyframes spin82{to{transform:rotate(360deg)}} @keyframes pulse82{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(132,204,22,0.15)" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid transparent", borderTopColor: "#84cc16", animation: "spin82 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#65a30d", animation: "spin82 1.4s linear infinite reverse" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 32 }}>🏀</span>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.2rem", letterSpacing: "0.1em", color: "#111827", lineHeight: 1, marginBottom: 8 }}>
            Simulating Season {season}
          </p>
          <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: "monospace" }}>
            Playing 82 games{"." .repeat(simDots + 1)}
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#84cc16", animation: `pulse82 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* ════ STANDINGS ════ */}
      {phase === "standings" && standingsData && chosenTeam && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>Season {season} Standings</p>
            {userSeed() && (
              <span style={{ fontSize: 14, color: "#65a30d", fontWeight: 800 }}>
                {madePlayoffs() ? `✅ Seed #${userSeed()}` : "❌ Missed Playoffs"}
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Eastern Conference</p>
              <StandingsTable entries={standingsData.east} userAbbr={chosenTeam.abbr} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Western Conference</p>
              <StandingsTable entries={standingsData.west} userAbbr={chosenTeam.abbr} />
            </div>
          </div>

          {/* Playoff eligibility banner */}
          <div style={{
            padding: "14px 18px", borderRadius: 12, marginBottom: 16,
            background: madePlayoffs() ? "rgba(132,204,22,0.08)" : "rgba(239,68,68,0.05)",
            border: madePlayoffs() ? "1.5px solid rgba(132,204,22,0.3)" : "1.5px solid rgba(239,68,68,0.2)",
          }}>
            <p style={{ fontWeight: 700, color: madePlayoffs() ? "#1a3a00" : "#7f1d1d", marginBottom: 2 }}>
              {madePlayoffs() ? `🏆 Playoff bound — Seed #${userSeed()} in the ${chosenTeam.conf}` : "Missed the playoffs — head to offseason"}
            </p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              {madePlayoffs() ? "Run the playoffs to see how far your franchise goes" : "Use the offseason to retool for next year"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={runPlayoffs}
              style={{ flex: 1, padding: "13px", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}
            >
              Run Playoffs →
            </button>
            <button
              onClick={goOffseason}
              style={{ padding: "13px 18px", borderRadius: 12, background: "white", color: "#6b7280", fontWeight: 700, fontSize: 13, border: "1.5px solid #e5e7eb", cursor: "pointer" }}
            >
              Skip to Offseason
            </button>
          </div>
        </div>
      )}

      {/* ════ PLAYOFFS ════ */}
      {phase === "playoffs" && playoffResults && chosenTeam && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1, marginBottom: 24 }}>
            Playoff Results
          </p>
          <PlayoffBracket results={playoffResults} userAbbr={chosenTeam.abbr} champion={champion} />
          <div style={{ marginTop: 24 }}>
            <button
              onClick={goOffseason}
              style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}
            >
              Go to Offseason →
            </button>
          </div>
        </div>
      )}

      {/* ════ OFFSEASON ════ */}
      {phase === "offseason" && chosenTeam && (
        <div style={{ height: "calc(100vh - 112px)", display: "flex", overflow: "hidden" }}>

          {/* Left: Roster management */}
          <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(0,0,0,0.08)", background: "rgba(244,240,230,0.5)" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em", color: "#111827" }}>Your Roster · Season {season}</p>
              <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>${usedSalary}M used · ${capLeft}M space · {filledCount} players</p>
            </div>

            {expiring.length > 0 && (
              <div style={{ padding: "8px 14px", background: "#fef3c7", borderBottom: "1px solid #f59e0b40" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e" }}>⚠️ {expiring.length} player{expiring.length > 1 ? "s" : ""} need a contract decision</p>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {slots.map(sl => {
                const name = sl.nbaPlayer?.name ?? sl.rosterPlayer?.name;
                const color = sl.nbaPlayer?.teamColor ?? "#84cc16";
                const rank  = sl.nbaPlayer ? playerRank(sl.nbaPlayer) : 999;
                if (!name) return (
                  <div key={sl.slotId} style={{ padding: "8px 10px", borderRadius: 8, background: "#f3f4f6", marginBottom: 5, fontSize: 11, color: "#9ca3af", fontFamily: "monospace", textAlign: "center" }}>
                    {sl.label} — Empty
                  </div>
                );
                const isExpiring = sl.yearsLeft === 0;
                return (
                  <div key={sl.slotId} style={{
                    marginBottom: 6, borderRadius: 10, padding: "9px 10px",
                    background: isExpiring ? "#fef9ec" : "white",
                    border: isExpiring ? "1.5px solid #f59e0b60" : "1px solid rgba(0,0,0,0.08)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isExpiring ? 8 : 0 }}>
                      <Avatar color={color} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.78rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{name}</p>
                        <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
                          {sl.nbaPlayer && <TierBadge rank={rank} small />}
                          <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "monospace" }}>${sl.salary}M</span>
                          <ContractBadge years={sl.yearsLeft} />
                        </div>
                      </div>
                    </div>
                    {isExpiring && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => extendPlayer(sl.slotId)}
                          style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "#84cc16", color: "#111827", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10 }}
                        >
                          Extend (${Math.min(28, Math.round(sl.salary * 1.25))}M)
                        </button>
                        <button
                          onClick={() => releasePlayer(sl.slotId)}
                          style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 700, fontSize: 10 }}
                        >
                          Release
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <button
                onClick={() => setPhase("build")}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: "none",
                  background: "#84cc16", color: "#111827",
                  fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em",
                  cursor: "pointer", fontWeight: 700,
                }}
              >
                Finalize → Simulate Season {season} →
              </button>
            </div>
          </div>

          {/* Right: Draft + Free Agency tabs */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <OffseasonTabs
              draftClass={draftClass}
              freeAgents={freeAgents}
              capLeft={capLeft}
              filledCount={filledCount}
              season={season}
              onDraft={draftProspect}
              onSign={signFA}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Offseason Tabs ────────────────────────────────────────────────────────────
function OffseasonTabs({
  draftClass, freeAgents, capLeft, filledCount, season, onDraft, onSign,
}: {
  draftClass: Prospect[];
  freeAgents: FreeAgent[];
  capLeft: number;
  filledCount: number;
  season: number;
  onDraft: (p: Prospect) => void;
  onSign: (fa: FreeAgent) => void;
}) {
  const [tab, setTab] = useState<"draft" | "fa">("draft");

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
        {([["draft","Draft Class"], ["fa","Free Agents"]] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "11px 20px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
              background: tab === t ? "#f4f0e6" : "white",
              color: tab === t ? "#111827" : "#6b7280",
              borderBottom: tab === t ? "2px solid #84cc16" : "2px solid transparent",
              transition: "border-color 0.15s",
            }}
          >{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {tab === "draft" && (
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontFamily: "monospace" }}>
              {2024 + season} Draft Class · Drafted players get a 2-year deal
            </p>
            {draftClass.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "40px 0" }}>All prospects drafted</p>
            ) : draftClass.map((p, i) => {
              const canDraft = filledCount < 12;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 7,
                  opacity: canDraft ? 1 : 0.5,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{p.pos} · Age {p.age} · {fmt1(p.ppg)}p {fmt1(p.rpg)}r</p>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0,
                    background: p.potential === "Star" ? "#fef3c7" : p.potential === "Starter" ? "#dcfce7" : p.potential === "Rotation" ? "#ede9fe" : "#f1f5f9",
                    color: p.potential === "Star" ? "#92400e" : p.potential === "Starter" ? "#14532d" : p.potential === "Rotation" ? "#4c1d95" : "#6b7280",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}>{p.potential}</span>
                  <button
                    onClick={() => canDraft && onDraft(p)}
                    disabled={!canDraft}
                    style={{
                      padding: "5px 12px", borderRadius: 7, border: "none", flexShrink: 0,
                      background: canDraft ? "#84cc16" : "#e5e7eb",
                      color: canDraft ? "#111827" : "#9ca3af",
                      cursor: canDraft ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11,
                    }}
                  >Draft · ${p.salary}M</button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "fa" && (
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontFamily: "monospace" }}>
              Free agents available · ${capLeft}M cap space remaining
            </p>
            {freeAgents.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "40px 0" }}>No free agents available</p>
            ) : freeAgents.map((fa, i) => {
              const canSign = capLeft >= fa.salary && filledCount < 12;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 7,
                  opacity: canSign ? 1 : 0.45,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{fa.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{fa.pos} · Age {fa.age} · {fmt1(fa.ppg)}p {fmt1(fa.rpg)}r · ${fa.salary}M/yr</p>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0,
                    background: fa.tier === "Max" ? "#fef3c7" : fa.tier === "Mid" ? "#dcfce7" : "#f1f5f9",
                    color: fa.tier === "Max" ? "#92400e" : fa.tier === "Mid" ? "#14532d" : "#6b7280",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}>{fa.tier}</span>
                  <button
                    onClick={() => canSign && onSign(fa)}
                    disabled={!canSign}
                    style={{
                      padding: "5px 12px", borderRadius: 7, border: "none", flexShrink: 0,
                      background: canSign ? "#84cc16" : "#e5e7eb",
                      color: canSign ? "#111827" : "#9ca3af",
                      cursor: canSign ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11,
                    }}
                  >Sign</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
