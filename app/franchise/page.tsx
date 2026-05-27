"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/app/components/GameHeader";
import {
  LEAGUE_TEAMS, simulateSeason, simulatePlayoffs, computeUserRating,
  computeOVR, generateSeasonStats, determineTrend, applyProgression,
  generateDraftClass, generateFreeAgents,
  type LeagueTeam, type StandingEntry, type RosterPlayer,
  type Prospect, type FreeAgent, type PlayoffResult, type Conference,
} from "@/lib/franchiseData";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";

// ─── Salary / rank data ────────────────────────────────────────────────────────
const SALARY_CAP      = 100; // hard cap for initial roster build
const OFFSEASON_CAP   = 140; // +$40M veteran fund unlocks in offseason

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
  // 2025 rookies
  dharper: 42, abailey: 52, jfears: 56, vjedgecombe: 68, kknueppel: 72,
  kjakucionis: 74, lmcneeley: 78, nessengue: 85, edemin: 88, dwolf: 90,
  kmaluach: 91, cmurrayb: 93,
};

const RANK_TIERS = [
  { max: 6,        price: 28 }, { max: 16,       price: 20 },
  { max: 26,       price: 15 }, { max: 36,       price: 11 },
  { max: 46,       price:  8 }, { max: 56,       price:  6 },
  { max: 66,       price:  5 }, { max: 76,       price:  4 },
  { max: 86,       price:  3 }, { max: 96,       price:  2 },
  { max: Infinity, price:  1 },
] as const;

// Known ages for young/notable NBA players (everyone else defaults to 27)
const PLAYER_AGES: Partial<Record<string, number>> = {
  // 2025 rookies (youngest)
  abailey: 19, jfears: 19, kmaluach: 19,
  cflagg: 20, dharper: 20, vjedgecombe: 20, lmcneeley: 20, nessengue: 20, edemin: 20,
  kknueppel: 21, cmurrayb: 21,
  dwolf: 22, kjakucionis: 22, wemby: 22,
  // 2024 rookies
  asarr: 20, zrisacher: 20,
  tcamara: 22, bmiller: 22, tmurphy: 22, cbraun: 22, jsuggs: 23,
  cade: 22, banchero: 22, jjohnson: 23,
  cholmgren: 23, sengun: 23, anesmith: 23, fwagner: 23,
  // primes / known ages
  ant: 23, sga: 26, luka: 25, jokic: 29, giannis: 30,
  curry: 37, lebron: 40, ad: 32, durant: 36, kyrie: 32,
  harden: 35, kawhi: 33, kthompson: 34,
};

function playerAge(p: CurrentNBAPlayer): number { return PLAYER_AGES[p.id] ?? 27; }

function derivePotential(ovr: number): "Star" | "Starter" | "Rotation" | "Bust" {
  if (ovr >= 88) return "Star";
  if (ovr >= 75) return "Starter";
  if (ovr >= 63) return "Rotation";
  return "Bust";
}

function playerRank(p: CurrentNBAPlayer): number { return RINGER_RANKINGS[p.id] ?? 999; }
function playerSalary(p: CurrentNBAPlayer): number {
  return RANK_TIERS.find(t => playerRank(p) <= t.max)!.price;
}

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
type Phase = "setup" | "build" | "simulating" | "review" | "standings" | "playoffs" | "offseason";
type Trend = "up" | "down" | "neutral";

type ContractSlot = {
  slotId: string;
  label: string;
  isNBA: boolean;
  nbaPlayer: CurrentNBAPlayer | null;
  rosterPlayer: RosterPlayer | null;
  salary: number;
  minutes: number;
  yearsLeft: number;
  ovr: number;
  prevOVR: number;
  trend: Trend;
  prevTrend: Trend;
  basePPG: number;
  baseRPG: number;
  baseAPG: number;
  seasonStats: { ppg: number; rpg: number; apg: number } | null;
  age: number;
  potential: "Star" | "Starter" | "Rotation" | "Bust";
};

// ─── SVG Icon Components (no emojis) ──────────────────────────────────────────
function TrophyIcon({ size = 28, color = "#84cc16" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v9a6 6 0 0 1-12 0V2z"/>
      <path d="M3.5 4H1v5a4 4 0 0 0 5 3.87"/>
      <path d="M20.5 4H23v5a4 4 0 0 1-5 3.87"/>
      <line x1="12" y1="17" x2="12" y2="20"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
      <line x1="8" y1="20" x2="16" y2="20"/>
    </svg>
  );
}

function BrokenHeartIcon({ size = 28, color = "#ef4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      <polyline points="12 8 10 12 14 13 12 17"/>
    </svg>
  );
}

function StarIcon({ size = 28, color = "#84cc16" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function WarningIcon({ size = 20, color = "#f59e0b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function CheckCircleIcon({ size = 20, color = "#22c55e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function BasketballIcon({ size = 36, color = "#84cc16" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M4.93 4.93c4.04 4.04 4.04 10.57 0 14.14"/>
      <path d="M19.07 4.93c-4.04 4.04-4.04 10.57 0 14.14"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  );
}

// ─── Trend arrow SVGs ──────────────────────────────────────────────────────────
function TrendArrow({ trend, size = 14 }: { trend: Trend; size?: number }) {
  if (trend === "up") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
        <polygon points="7,1 13,11 1,11" fill="#22c55e"/>
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
        <polygon points="7,13 1,3 13,3" fill="#ef4444"/>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
      <rect x="1" y="6" width="12" height="2" rx="1" fill="#9ca3af"/>
    </svg>
  );
}

function StatDelta({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.15) return <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>;
  const up = delta > 0;
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: up ? "#22c55e" : "#ef4444", display: "inline-flex", alignItems: "center", gap: 2 }}>
      <svg width={9} height={9} viewBox="0 0 7 7">
        {up
          ? <polygon points="3.5,0.5 6.5,5.5 0.5,5.5" fill="#22c55e"/>
          : <polygon points="3.5,6.5 0.5,1.5 6.5,1.5" fill="#ef4444"/>
        }
      </svg>
      {Math.abs(delta).toFixed(1)}
    </span>
  );
}

// ─── OVR Badge (replaces tier badge) ──────────────────────────────────────────
function OVRBadge({ ovr, small }: { ovr: number; small?: boolean }) {
  const s = ovr >= 90 ? { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" }
          : ovr >= 80 ? { bg: "#ede9fe", text: "#4c1d95", border: "#8b5cf6" }
          : ovr >= 70 ? { bg: "#dbeafe", text: "#1e3a8a", border: "#60a5fa" }
          : ovr >= 60 ? { bg: "#dcfce7", text: "#14532d", border: "#4ade80" }
          :             { bg: "#f1f5f9", text: "#475569", border: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      height: small ? 22 : 30, minWidth: small ? 56 : 72, paddingInline: 6, borderRadius: 5, flexShrink: 0,
      background: s.bg, border: `1.5px solid ${s.border}`, color: s.text,
      fontSize: small ? 12 : 16, fontFamily: "var(--font-bebas)", letterSpacing: "0.05em", fontWeight: 700,
    }}>OVR {ovr}</span>
  );
}

// ─── Team Logo ─────────────────────────────────────────────────────────────────
function TeamLogo({ url, color, size = 24 }: { url: string; color: string; size?: number }) {
  const [err, setErr] = React.useState(false);
  if (err) return <span style={{ width: size, height: size, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />;
  return <img src={url} alt="" width={size} height={size} style={{ objectFit: "contain", flexShrink: 0, display: "block" }} onError={() => setErr(true)} />;
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: color + "22", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 27" fill={color + "cc"}>
        <circle cx="12" cy="7" r="5"/>
        <path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
      </svg>
    </div>
  );
}

// ─── Contract badge ────────────────────────────────────────────────────────────
function ContractBadge({ years }: { years: number }) {
  const color = years <= 0 ? "#ef4444" : years === 1 ? "#f59e0b" : "#22c55e";
  const bg    = years <= 0 ? "#fee2e2" : years === 1 ? "#fef3c7" : "#dcfce7";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: bg, color, border: `1px solid ${color}60`, flexShrink: 0 }}>
      {years <= 0 ? "UFA" : `${years}yr`}
    </span>
  );
}

// ─── Standings table ───────────────────────────────────────────────────────────
function StandingsTable({ entries, userAbbr }: { entries: StandingEntry[]; userAbbr: string }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "22px 26px 1fr 40px 40px 52px", padding: "5px 10px", background: "#f8f7f2", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        {["#", "", "Team", "W", "L", "GB"].map(h => <span key={h} style={{ fontSize: 8, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</span>)}
      </div>
      {entries.map((e, i) => {
        const isUser = e.abbr === userAbbr;
        const inPlayoffs = i < 8;
        const gb = i === 0 ? "—" : ((entries[0].wins - e.wins) / 2).toFixed(1);
        return (
          <div key={e.abbr} style={{
            display: "grid", gridTemplateColumns: "22px 26px 1fr 40px 40px 52px",
            padding: "5px 10px", alignItems: "center",
            background: isUser ? "rgba(132,204,22,0.08)" : i % 2 === 0 ? "white" : "#fafaf7",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
            borderLeft: isUser ? "3px solid #84cc16" : "3px solid transparent",
          }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: inPlayoffs ? "#374151" : "#9ca3af" }}>{i + 1}</span>
            <TeamLogo url={e.logoUrl} color={e.color} size={18} />
            <span style={{ fontSize: 11, fontWeight: isUser ? 800 : 600, color: isUser ? "#1a3a00" : "#374151", display: "flex", alignItems: "center", gap: 4 }}>
              {e.abbr}
              {!inPlayoffs && <span style={{ fontSize: 8, color: "#c4b5a0", fontWeight: 400 }}>lotto</span>}
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
  const byRound = Object.fromEntries(results.map(r => [r.round, r.series]));

  function SeriesCard({ series }: { series: PlayoffResult[0]["series"][0] }) {
    const userW = series.winner.abbr === userAbbr;
    const userL = series.loser.abbr === userAbbr;
    const userIn = userW || userL;
    return (
      <div style={{
        borderRadius: 8, overflow: "hidden",
        border: userIn ? (userW ? "1.5px solid rgba(132,204,22,0.5)" : "1.5px solid rgba(239,68,68,0.35)") : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: userIn ? (userW ? "0 2px 12px rgba(132,204,22,0.15)" : "0 2px 8px rgba(239,68,68,0.1)") : "none",
      }}>
        <div style={{ padding: "6px 10px", background: userW && userIn ? "rgba(132,204,22,0.1)" : "#f8f7f4", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <TeamLogo url={series.winner.logoUrl} color={series.winner.color} size={20} />
          <span style={{ flex: 1, fontSize: 11, fontWeight: 800, color: userW ? "#1a3a00" : "#111827" }}>{series.winner.abbr}</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", fontVariantNumeric: "tabular-nums" }}>{series.winsW}</span>
        </div>
        <div style={{ padding: "6px 10px", background: "white", display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ opacity: 0.45 }}><TeamLogo url={series.loser.logoUrl} color={series.loser.color} size={20} /></div>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: "#6b7280" }}>{series.loser.abbr}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", fontVariantNumeric: "tabular-nums" }}>{series.winsL}</span>
        </div>
      </div>
    );
  }

  function RoundCol({ roundName, label }: { roundName: string; label: string }) {
    const series = byRound[roundName];
    if (!series) return null;
    return (
      <div>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {series.map((s, i) => <SeriesCard key={i} series={s} />)}
        </div>
      </div>
    );
  }

  const isChamp = champion?.abbr === userAbbr;

  return (
    <div>
      {/* East */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Eastern Conference</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <RoundCol roundName="East First Round" label="First Round" />
          <RoundCol roundName="East Semis" label="Conf. Semis" />
          <RoundCol roundName="East Finals" label="Conf. Finals" />
        </div>
      </div>
      {/* West */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Western Conference</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <RoundCol roundName="West First Round" label="First Round" />
          <RoundCol roundName="West Semis" label="Conf. Semis" />
          <RoundCol roundName="West Finals" label="Conf. Finals" />
        </div>
      </div>
      {/* Finals */}
      {byRound["NBA Finals"] && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "linear-gradient(135deg, #fef3c7, #fef9ec)", border: "2px solid #f59e0b", marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, textAlign: "center" }}>NBA Finals</p>
          <div style={{ maxWidth: 260, margin: "0 auto" }}>
            {byRound["NBA Finals"].map((s, i) => <SeriesCard key={i} series={s} />)}
          </div>
        </div>
      )}
      {/* Champion */}
      {champion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 22 }}
          style={{
            textAlign: "center", padding: "24px",  borderRadius: 16,
            background: isChamp ? "linear-gradient(135deg, rgba(132,204,22,0.18), rgba(132,204,22,0.06))" : "rgba(0,0,0,0.03)",
            border: isChamp ? "2px solid rgba(132,204,22,0.45)" : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            {isChamp ? <TrophyIcon size={52} color="#84cc16" /> : <BrokenHeartIcon size={48} color="#ef4444" />}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 6 }}>
            <TeamLogo url={champion.logoUrl} color={champion.color} size={36} />
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.1em", color: "#111827", lineHeight: 1 }}>
              {isChamp ? "NBA Champions!" : `${champion.name} win the title`}
            </p>
          </div>
          {!isChamp && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Better luck next season</p>}
        </motion.div>
      )}
    </div>
  );
}

// ─── Roster Slot Card ──────────────────────────────────────────────────────────
function minuteRole(m: number): { label: string; color: string } {
  return m >= 28 ? { label: "Starter", color: "#15803d" }
       : m >= 16 ? { label: "Rotation", color: "#b45309" }
       :           { label: "Bench", color: "#6b7280" };
}

function RosterSlotCard({ slot, isActive, isDragging, isDragOver, onClick, onRemove, onMins }: {
  slot: ContractSlot; isActive: boolean;
  isDragging: boolean; isDragOver: boolean;
  onClick: () => void; onRemove: () => void; onMins: (v: number) => void;
}) {
  const filled = slot.nbaPlayer !== null || slot.rosterPlayer !== null;
  const name   = slot.nbaPlayer?.name ?? slot.rosterPlayer?.name ?? null;
  const color  = slot.nbaPlayer?.teamColor ?? "#84cc16";
  const role   = minuteRole(slot.minutes);

  return (
    <div
      onClick={filled ? undefined : onClick}
      style={{
        borderRadius: 10,
        border: isDragOver
          ? "2px solid #84cc16"
          : isActive && !filled ? "2px solid #84cc16" : "1.5px solid rgba(0,0,0,0.09)",
        background: isDragOver
          ? "rgba(132,204,22,0.06)"
          : isActive && !filled ? "rgba(132,204,22,0.04)" : "white",
        boxShadow: isDragOver
          ? "0 0 0 4px rgba(132,204,22,0.2)"
          : isActive && !filled ? "0 0 0 3px rgba(132,204,22,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
        cursor: filled ? "grab" : "pointer",
        overflow: "hidden", marginBottom: 6,
        opacity: isDragging ? 0.35 : 1,
        transition: "opacity 0.15s, border-color 0.12s, box-shadow 0.12s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 8px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        {/* Drag handle */}
        {filled && (
          <svg width="8" height="12" viewBox="0 0 8 12" fill="#c4b5a0" style={{ flexShrink: 0 }}>
            <circle cx="2" cy="2" r="1.3"/><circle cx="6" cy="2" r="1.3"/>
            <circle cx="2" cy="6" r="1.3"/><circle cx="6" cy="6" r="1.3"/>
            <circle cx="2" cy="10" r="1.3"/><circle cx="6" cy="10" r="1.3"/>
          </svg>
        )}
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
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <OVRBadge ovr={slot.ovr} small />
                <span style={{ fontSize: 11, color: "#65a30d", fontFamily: "monospace", fontWeight: 700 }}>${slot.salary}M</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6 }}>
            <input type="range" min={0} max={48} step={1} value={slot.minutes}
              onChange={e => onMins(Number(e.target.value))}
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, accentColor: "#84cc16", height: 3 }} />
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "#374151", width: 28, textAlign: "right", flexShrink: 0 }}>{slot.minutes}m</span>
          </div>
          <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: "#f3f4f6", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: role.color, width: `${(slot.minutes / 48) * 100}%`, transition: "width 0.2s" }} />
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: role.color, flexShrink: 0 }}>{role.label}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "14px 10px" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isActive ? "rgba(132,204,22,0.12)" : isDragOver ? "rgba(132,204,22,0.18)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 27" fill={isActive || isDragOver ? "#84cc16" : "#d1d5db"}><circle cx="12" cy="7" r="5"/><path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/></svg>
          </div>
          <p style={{ fontSize: 10, color: isDragOver ? "#65a30d" : isActive ? "#65a30d" : "#9ca3af", fontFamily: "monospace", fontWeight: isActive || isDragOver ? 600 : 400 }}>
            {isDragOver ? "Drop here" : isActive ? "← Pick a player" : "Empty Slot"}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FranchisePage() {
  const [phase, setPhase]           = useState<Phase>("setup");
  const [season, setSeason]         = useState(1);
  const [chosenTeam, setChosenTeam] = useState<LeagueTeam | null>(null);
  const [confFilter, setConfFilter] = useState<"East" | "West">("East");

  const [slots, setSlots] = useState<ContractSlot[]>(
    SLOT_DEFS.map(d => ({
      slotId: d.id, label: d.label,
      isNBA: true, nbaPlayer: null, rosterPlayer: null,
      salary: 0, minutes: d.defaultMin, yearsLeft: 2,
      ovr: 60, prevOVR: 60, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: 0, baseRPG: 0, baseAPG: 0, seasonStats: null,
      age: 27, potential: "Rotation" as const,
    }))
  );
  const [activeSlot, setActiveSlot] = useState<string | null>(SLOT_DEFS[0].id);
  const [search, setSearch]         = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [posFilter, setPosFilter]   = useState("All");

  const [standingsData, setStandingsData] = useState<{ east: StandingEntry[]; west: StandingEntry[] } | null>(null);
  const [playoffResults, setPlayoffResults] = useState<PlayoffResult | null>(null);
  const [champion, setChampion]     = useState<StandingEntry | null>(null);
  const [draftClass, setDraftClass] = useState<Prospect[]>([]);
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([]);
  const [totalWins, setTotalWins]     = useState(0);
  const [titles, setTitles]           = useState(0);
  const [simDots, setSimDots]         = useState(0);
  const [dragSlotId, setDragSlotId]   = useState<string | null>(null);
  const [dragOverId, setDragOverId]   = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "simulating") return;
    const id = setInterval(() => setSimDots(d => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [phase]);

  // ─── Derived ────────────────────────────────────────────────────────────────
  const usedSalary   = slots.reduce((s, sl) => s + sl.salary, 0);
  const effectiveCap = phase === "offseason" ? OFFSEASON_CAP : SALARY_CAP;
  const capLeft      = effectiveCap - usedSalary;
  const filledCount  = slots.filter(s => s.nbaPlayer || s.rosterPlayer).length;

  const userRating = useMemo(() => {
    const rp = slots.filter(s => s.nbaPlayer || s.rosterPlayer).map(sl => ({
      name: sl.nbaPlayer?.name ?? sl.rosterPlayer?.name ?? "",
      ppg: sl.basePPG || sl.nbaPlayer?.ppg || 10,
      rpg: sl.baseRPG || sl.nbaPlayer?.rpg || 4,
      apg: sl.baseAPG || sl.nbaPlayer?.apg || 2,
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
    return CURRENT_NBA_PLAYERS.filter(p => {
      if (usedIds.has(p.id)) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (teamFilter !== "All Teams" && p.team !== teamFilter) return false;
      if (posFilter !== "All" && p.position !== posFilter) return false;
      return true;
    }).sort((a, b) => playerRank(a) - playerRank(b));
  }, [slots, search, teamFilter, posFilter]);

  // ─── Player management ───────────────────────────────────────────────────────
  function advanceActiveSlot(filledId: string) {
    const idx = SLOT_DEFS.findIndex(d => d.id === filledId);
    const next = SLOT_DEFS.slice(idx + 1).find(d => {
      const s = slots.find(sl => sl.slotId === d.id);
      return !s?.nbaPlayer && !s?.rosterPlayer;
    });
    setActiveSlot(next?.id ?? null);
  }

  function selectPlayer(p: CurrentNBAPlayer) {
    const sal = playerSalary(p);
    if (capLeft < sal) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const ovr = computeOVR(p.ppg, p.rpg, p.apg, p.spg, p.bpg);
    const age = playerAge(p);
    const potential = derivePotential(ovr);
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: p, rosterPlayer: null, isNBA: true,
      salary: sal, yearsLeft: 2,
      ovr, prevOVR: ovr, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: p.ppg, baseRPG: p.rpg, baseAPG: p.apg,
      seasonStats: null, age, potential,
    }));
    advanceActiveSlot(targetId);
    setSearch("");
  }

  function removePlayer(slotId: string) {
    const def = SLOT_DEFS.find(d => d.id === slotId)!;
    setSlots(prev => prev.map(sl => sl.slotId !== slotId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: null, isNBA: true,
      salary: 0, minutes: def.defaultMin, yearsLeft: 2,
      ovr: 60, prevOVR: 60, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: 0, baseRPG: 0, baseAPG: 0, seasonStats: null,
      age: 27, potential: "Rotation" as const,
    }));
    setActiveSlot(slotId);
  }

  function setMins(slotId: string, mins: number) {
    setSlots(prev => prev.map(sl => sl.slotId === slotId ? { ...sl, minutes: mins } : sl));
  }

  // Swap player data between two slots; slot identity (slotId, label, minutes) stays fixed
  function swapSlots(fromId: string, toId: string) {
    setSlots(prev => {
      const from = prev.find(s => s.slotId === fromId);
      const to   = prev.find(s => s.slotId === toId);
      if (!from || !to) return prev;
      const pick = (src: ContractSlot) => ({
        nbaPlayer: src.nbaPlayer, rosterPlayer: src.rosterPlayer, isNBA: src.isNBA,
        salary: src.salary, yearsLeft: src.yearsLeft,
        ovr: src.ovr, prevOVR: src.prevOVR,
        trend: src.trend, prevTrend: src.prevTrend,
        basePPG: src.basePPG, baseRPG: src.baseRPG, baseAPG: src.baseAPG,
        seasonStats: src.seasonStats, age: src.age, potential: src.potential,
      });
      return prev.map(sl => {
        if (sl.slotId === fromId) return { ...sl, ...pick(to) };
        if (sl.slotId === toId)   return { ...sl, ...pick(from) };
        return sl;
      });
    });
  }

  function signFA(fa: FreeAgent) {
    if (capLeft < fa.salary || filledCount >= 12) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const ovr = computeOVR(fa.ppg, fa.rpg, fa.apg);
    const potential = derivePotential(ovr);
    const rp: RosterPlayer = { name: fa.name, ppg: fa.ppg, rpg: fa.rpg, apg: fa.apg, salary: fa.salary, minutes: 20 };
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: rp, isNBA: false,
      salary: fa.salary, yearsLeft: 2,
      ovr, prevOVR: ovr, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: fa.ppg, baseRPG: fa.rpg, baseAPG: fa.apg, seasonStats: null,
      age: fa.age, potential,
    }));
    setFreeAgents(prev => prev.filter(f => f.name !== fa.name));
    advanceActiveSlot(targetId);
  }

  function signNBAPlayer(p: CurrentNBAPlayer) {
    const sal = playerSalary(p);
    if (capLeft < sal || filledCount >= 12) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const ovr = computeOVR(p.ppg, p.rpg, p.apg, p.spg, p.bpg);
    const age = playerAge(p);
    const potential = derivePotential(ovr);
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: p, rosterPlayer: null, isNBA: true,
      salary: sal, yearsLeft: 2,
      ovr, prevOVR: ovr, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: p.ppg, baseRPG: p.rpg, baseAPG: p.apg,
      seasonStats: null, age, potential,
    }));
    advanceActiveSlot(targetId);
  }

  function draftProspect(p: Prospect) {
    if (filledCount >= 12) return;
    const targetId = activeSlot ?? slots.find(s => !s.nbaPlayer && !s.rosterPlayer)?.slotId;
    if (!targetId) return;
    const ovr = computeOVR(p.ppg, p.rpg, p.apg);
    const rp: RosterPlayer = { name: p.name, ppg: p.ppg, rpg: p.rpg, apg: p.apg, salary: p.salary, minutes: 15 };
    setSlots(prev => prev.map(sl => sl.slotId !== targetId ? sl : {
      ...sl, nbaPlayer: null, rosterPlayer: rp, isNBA: false,
      salary: p.salary, yearsLeft: 2,
      ovr, prevOVR: ovr, trend: "neutral" as Trend, prevTrend: "neutral" as Trend,
      basePPG: p.ppg, baseRPG: p.rpg, baseAPG: p.apg, seasonStats: null,
      age: p.age, potential: p.potential,
    }));
    setDraftClass(prev => prev.filter(d => d.name !== p.name));
    advanceActiveSlot(targetId);
  }

  function extendPlayer(slotId: string) {
    setSlots(prev => prev.map(sl => {
      if (sl.slotId !== slotId) return sl;
      return { ...sl, yearsLeft: 2, salary: Math.min(28, Math.round(sl.salary * 1.25)) };
    }));
  }

  // ─── Season simulation ───────────────────────────────────────────────────────
  function runSeason() {
    if (!chosenTeam || filledCount < 12) return;
    setPhase("simulating");
    setTimeout(() => {
      const result = simulateSeason(userRating, chosenTeam.name, chosenTeam.abbr, chosenTeam.conf, chosenTeam.color, chosenTeam.logoUrl);
      const allEntries = [...result.east, ...result.west];
      const userEntry = allEntries.find(e => e.isUser);
      if (userEntry) setTotalWins(w => w + userEntry.wins);

      // Generate season stats, determine trends, tick contracts
      setSlots(prev => prev.map(sl => {
        if (!sl.nbaPlayer && !sl.rosterPlayer) return sl;
        const season = generateSeasonStats(sl.basePPG, sl.baseRPG, sl.baseAPG, sl.minutes);
        const trend = determineTrend(season.ppg, sl.basePPG, season.rpg, sl.baseRPG, season.apg, sl.baseAPG);
        return { ...sl, seasonStats: season, trend, yearsLeft: Math.max(0, sl.yearsLeft - 1) };
      }));

      setStandingsData(result);
      setPhase("review"); // show player report before standings
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
    // Apply progression: pass age, potential, momentum; cap OVR gain at +5/season; age players +1
    setSlots(prev => prev.map(sl => {
      if (!sl.nbaPlayer && !sl.rosterPlayer) return sl;
      const newStats = applyProgression(sl.basePPG, sl.baseRPG, sl.baseAPG, sl.trend, sl.age, sl.potential, sl.prevTrend, sl.minutes);
      const rawNewOVR = computeOVR(newStats.ppg, newStats.rpg, newStats.apg);
      const newOVR = Math.min(99, Math.min(rawNewOVR, sl.ovr + 5));
      return {
        ...sl,
        basePPG: newStats.ppg, baseRPG: newStats.rpg, baseAPG: newStats.apg,
        ovr: newOVR, prevOVR: sl.ovr, // save old OVR for delta display
        seasonStats: null,
        prevTrend: sl.trend,
        age: sl.age + 1,
      };
    }));

    setDraftClass(generateDraftClass(2025 + season));
    setFreeAgents(generateFreeAgents(season));
    setSeason(s => s + 1);
    setStandingsData(null);
    setPlayoffResults(null);
    setChampion(null);
    setPhase("offseason");
  }

  function userSeed() {
    if (!standingsData || !chosenTeam) return null;
    const conf = chosenTeam.conf === "East" ? standingsData.east : standingsData.west;
    const idx  = conf.findIndex(e => e.isUser);
    return idx >= 0 ? idx + 1 : null;
  }

  function madePlayoffs() { const s = userSeed(); return s !== null && s <= 8; }

  const expiring = slots.filter(s => (s.nbaPlayer || s.rosterPlayer) && s.yearsLeft === 0);

  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#f4f0e6" }}>
      <GameHeader title="Franchise Mode" />

      {/* Season bar */}
      {phase !== "setup" && chosenTeam && (
        <div style={{ background: "rgba(244,240,230,0.95)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "7px 24px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(8px)" }}>
          <TeamLogo url={chosenTeam.logoUrl} color={chosenTeam.color} size={28} />
          <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.1em", color: "#111827" }}>{chosenTeam.name}</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
            {[{ label: "Season", val: season }, { label: "Titles", val: titles }, { label: "Career W", val: totalWins }, { label: "Rating", val: userRating.toFixed(0) }].map(({ label, val }) => (
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
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6, maxWidth: 500 }}>Pick a team, build a 12-man roster, simulate full 82-game seasons, and manage your franchise year over year. Players improve or decline based on performance.</p>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["East", "West"] as const).map(c => (
              <button key={c} onClick={() => setConfFilter(c)} style={{ padding: "6px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", background: confFilter === c ? "#84cc16" : "white", color: confFilter === c ? "#111827" : "#6b7280", border: confFilter === c ? "1.5px solid #65a30d" : "1.5px solid #e5e7eb" }}>{c}ern</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 8 }}>
            {LEAGUE_TEAMS.filter(t => t.conf === confFilter).map(t => (
              <button key={t.abbr} onClick={() => { setChosenTeam(t); setPhase("build"); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, cursor: "pointer", background: "white", border: "1.5px solid #e5e7eb", textAlign: "left" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#84cc16")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                <TeamLogo url={t.logoUrl} color={t.color} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", lineHeight: 1.2 }}>{t.name}</p>
                  <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>{t.conf} · {t.abbr}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: t.rating >= 87 ? "#fef3c7" : t.rating >= 78 ? "#dcfce7" : "#f1f5f9", color: t.rating >= 87 ? "#92400e" : t.rating >= 78 ? "#14532d" : "#6b7280", border: "1px solid rgba(0,0,0,0.1)" }}>
                  {t.rating >= 87 ? "Title" : t.rating >= 78 ? "Playoff" : "Rebuild"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ════ BUILD ════ */}
      {phase === "build" && chosenTeam && (
        <div style={{ height: "calc(100vh - 112px)", display: "flex", overflow: "hidden" }}>
          {/* Left: slots */}
          <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(0,0,0,0.08)", background: "rgba(244,240,230,0.5)" }}>
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
              <div style={{ marginTop: 5, padding: "3px 7px", borderRadius: 5, background: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 4 }}>
                <svg width={10} height={10} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#22c55e" opacity="0.2"/><path d="M5 3v2l1 1" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 9, color: "#15803d", fontWeight: 600 }}>+$40M Veteran Fund unlocks in offseason</span>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              <p style={{ fontSize: 8, color: "#c4b5a0", fontFamily: "monospace", textAlign: "center", marginBottom: 6 }}>
                Drag ⠿ to reorder · more minutes = faster development
              </p>
              {slots.map(sl => {
                const isFilled = !!(sl.nbaPlayer || sl.rosterPlayer);
                return (
                  <div
                    key={sl.slotId}
                    draggable={isFilled}
                    onDragStart={e => {
                      if (!isFilled) return;
                      e.dataTransfer.setData("franchise-slot", sl.slotId);
                      e.dataTransfer.effectAllowed = "move";
                      // Slight delay so the ghost renders before opacity drops
                      setTimeout(() => setDragSlotId(sl.slotId), 0);
                    }}
                    onDragEnd={() => { setDragSlotId(null); setDragOverId(null); }}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverId(sl.slotId); }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverId(null); }}
                    onDrop={e => {
                      e.preventDefault();
                      const fromId = e.dataTransfer.getData("franchise-slot");
                      if (fromId && fromId !== sl.slotId) swapSlots(fromId, sl.slotId);
                      setDragSlotId(null); setDragOverId(null);
                    }}
                  >
                    <RosterSlotCard
                      slot={sl}
                      isActive={activeSlot === sl.slotId}
                      isDragging={dragSlotId === sl.slotId}
                      isDragOver={dragOverId === sl.slotId && dragSlotId !== sl.slotId}
                      onClick={() => setActiveSlot(sl.slotId)}
                      onRemove={() => removePlayer(sl.slotId)}
                      onMins={v => setMins(sl.slotId, v)}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <button onClick={runSeason} disabled={filledCount < 12}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: filledCount >= 12 ? "#84cc16" : "#e5e7eb", color: filledCount >= 12 ? "#111827" : "#9ca3af", fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em", cursor: filledCount >= 12 ? "pointer" : "not-allowed" }}
              >{filledCount < 12 ? `Need ${12 - filledCount} more` : "Simulate Season"}</button>
            </div>
          </div>

          {/* Right: player pool */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "white", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players…"
                style={{ flex: 1, minWidth: 120, padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, outline: "none", background: "#fafaf7", color: "#111827" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#84cc16")}
                onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, background: "#fafaf7", color: "#374151", outline: "none" }}>
                {["All","PG","SG","SF","PF","C"].map(p => <option key={p}>{p}</option>)}
              </select>
              <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, background: "#fafaf7", color: "#374151", outline: "none", maxWidth: 140 }}>
                {teamList.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* OVR legend */}
            <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(0,0,0,0.05)", background: "#fafaf7", display: "flex", gap: 8, overflowX: "auto" }}>
              {[{label:"90+ Elite",bg:"#fef3c7",text:"#92400e",border:"#f59e0b"},{label:"80–89 Star",bg:"#ede9fe",text:"#4c1d95",border:"#8b5cf6"},{label:"70–79 Starter",bg:"#dbeafe",text:"#1e3a8a",border:"#60a5fa"},{label:"60–69 Role",bg:"#dcfce7",text:"#14532d",border:"#4ade80"},{label:"<60 Fringe",bg:"#f1f5f9",text:"#475569",border:"#94a3b8"}].map(t => (
                <span key={t.label} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: t.bg, color: t.text, border: `1px solid ${t.border}`, flexShrink: 0 }}>{t.label}</span>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {filteredPlayers.map(p => {
                const sal = playerSalary(p);
                const ovr = computeOVR(p.ppg, p.rpg, p.apg, p.spg, p.bpg);
                const canAfford = capLeft >= sal;
                return (
                  <button key={p.id} onClick={() => canAfford && selectPlayer(p)} disabled={!canAfford}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 16px", border: "none", background: "transparent", cursor: canAfford ? "pointer" : "not-allowed", borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: canAfford ? 1 : 0.4, textAlign: "left" }}
                    onMouseEnter={e => { if (canAfford) e.currentTarget.style.background = "rgba(132,204,22,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <Avatar color={p.teamColor} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.05rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace", marginTop: 2 }}>{p.position} · Age {playerAge(p)} · {p.ppg}p {p.rpg}r {p.apg}a</p>
                    </div>
                    <OVRBadge ovr={ovr} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: canAfford ? "#65a30d" : "#ef4444", width: 46, textAlign: "right", flexShrink: 0 }}>${sal}M</span>
                  </button>
                );
              })}
              {filteredPlayers.length === 0 && <p style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af", fontSize: 12 }}>No players match your filters</p>}
            </div>
          </div>
        </div>
      )}

      {/* ════ SIMULATING ════ */}
      {phase === "simulating" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 40 }}>
          <style>{`@keyframes spin82{to{transform:rotate(360deg)}} @keyframes pulse82{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
          <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid rgba(132,204,22,0.15)" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid transparent", borderTopColor: "#84cc16", animation: "spin82 1s linear infinite" }} />
            <div style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#65a30d", animation: "spin82 1.4s linear infinite reverse" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BasketballIcon size={34} color="#84cc16" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "2.2rem", letterSpacing: "0.1em", color: "#111827", lineHeight: 1, marginBottom: 8 }}>Simulating Season {season}</p>
          <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: "monospace" }}>Playing 82 games{"." .repeat(simDots + 1)}</p>
          <div style={{ marginTop: 24, display: "flex", gap: 4 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#84cc16", animation: `pulse82 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* ════ SEASON REVIEW ════ */}
      {phase === "review" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>Season {season} Player Report</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Green arrow = trending up (75% chance to improve next season) · Red = declining · Extend before they get better</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {slots.filter(sl => sl.nbaPlayer || sl.rosterPlayer).map(sl => {
              const name = sl.nbaPlayer?.name ?? sl.rosterPlayer?.name ?? "";
              const color = sl.nbaPlayer?.teamColor ?? "#84cc16";
              const ss = sl.seasonStats;
              const dPPG = ss ? +(ss.ppg - sl.basePPG).toFixed(1) : 0;
              const dRPG = ss ? +(ss.rpg - sl.baseRPG).toFixed(1) : 0;
              const dAPG = ss ? +(ss.apg - sl.baseAPG).toFixed(1) : 0;

              return (
                <motion.div
                  key={sl.slotId}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    borderRadius: 12, background: "white",
                    border: sl.trend === "up" ? "1.5px solid rgba(34,197,94,0.3)" : sl.trend === "down" ? "1.5px solid rgba(239,68,68,0.2)" : "1.5px solid rgba(0,0,0,0.08)",
                    boxShadow: sl.trend === "up" ? "0 2px 12px rgba(34,197,94,0.08)" : sl.trend === "down" ? "0 2px 8px rgba(239,68,68,0.06)" : "none",
                  }}
                >
                  <Avatar color={color} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
                      <OVRBadge ovr={sl.ovr} small />
                      <ContractBadge years={sl.yearsLeft} />
                      <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>${sl.salary}M · Age {sl.age}</span>
                    </div>
                  </div>
                  {/* Season stats with deltas */}
                  <div style={{ display: "flex", gap: 18 }}>
                    {[
                      { label: "PPG", val: ss?.ppg ?? sl.basePPG, delta: dPPG },
                      { label: "RPG", val: ss?.rpg ?? sl.baseRPG, delta: dRPG },
                      { label: "APG", val: ss?.apg ?? sl.baseAPG, delta: dAPG },
                    ].map(({ label, val, delta }) => (
                      <div key={label} style={{ textAlign: "center", minWidth: 42 }}>
                        <p style={{ fontSize: 17, fontWeight: 800, color: "#111827", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{val.toFixed(1)}</p>
                        <p style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "2px 0 3px" }}>{label}</p>
                        <StatDelta delta={delta} />
                      </div>
                    ))}
                  </div>
                  {/* Trend arrow */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
                    <TrendArrow trend={sl.trend} size={24} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: sl.trend === "up" ? "#22c55e" : sl.trend === "down" ? "#ef4444" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {sl.trend === "up" ? "Rising" : sl.trend === "down" ? "Falling" : "Steady"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button onClick={() => setPhase("standings")} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}>
            See Standings
          </button>
        </div>
      )}

      {/* ════ STANDINGS ════ */}
      {phase === "standings" && standingsData && chosenTeam && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1 }}>Season {season} Standings</p>
            {userSeed() && <span style={{ fontSize: 14, color: "#65a30d", fontWeight: 800 }}>{madePlayoffs() ? `Seed #${userSeed()}` : "Missed Playoffs"}</span>}
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
          <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 16, background: madePlayoffs() ? "rgba(132,204,22,0.08)" : "rgba(239,68,68,0.05)", border: madePlayoffs() ? "1.5px solid rgba(132,204,22,0.3)" : "1.5px solid rgba(239,68,68,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              {madePlayoffs() ? <CheckCircleIcon size={16} color="#22c55e" /> : <WarningIcon size={16} color="#ef4444" />}
              <p style={{ fontWeight: 700, color: madePlayoffs() ? "#1a3a00" : "#7f1d1d" }}>
                {madePlayoffs() ? `Playoff bound — Seed #${userSeed()} in the ${chosenTeam.conf}` : "Missed the playoffs — head to offseason"}
              </p>
            </div>
            <p style={{ fontSize: 12, color: "#6b7280" }}>{madePlayoffs() ? "Run the playoffs to see how far you go" : "Use the offseason to retool for next year"}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={runPlayoffs} style={{ flex: 1, padding: "13px", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.1em" }}>Run Playoffs</button>
            <button onClick={goOffseason} style={{ padding: "13px 18px", borderRadius: 12, background: "white", color: "#6b7280", fontWeight: 700, fontSize: 13, border: "1.5px solid #e5e7eb", cursor: "pointer" }}>Skip to Offseason</button>
          </div>
        </div>
      )}

      {/* ════ PLAYOFFS ════ */}
      {phase === "playoffs" && playoffResults && chosenTeam && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-20">
          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(22px,5vw,40px)", letterSpacing: "0.06em", color: "#111827", lineHeight: 1, marginBottom: 24 }}>Playoff Results</p>
          <PlayoffBracket results={playoffResults} userAbbr={chosenTeam.abbr} champion={champion} />
          <div style={{ marginTop: 24 }}>
            <button onClick={goOffseason} style={{ width: "100%", padding: "14px", borderRadius: 12, background: "#84cc16", color: "#111827", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "var(--font-bebas)", letterSpacing: "0.12em" }}>Go to Offseason</button>
          </div>
        </div>
      )}

      {/* ════ OFFSEASON ════ */}
      {phase === "offseason" && chosenTeam && (
        <div style={{ height: "calc(100vh - 112px)", display: "flex", overflow: "hidden" }}>
          {/* Left: roster */}
          <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid rgba(0,0,0,0.08)", background: "rgba(244,240,230,0.5)" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em", color: "#111827" }}>Your Roster · Season {season}</p>
              <p style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>${usedSalary}M used · ${capLeft}M space · {filledCount} players</p>
              <div style={{ marginTop: 4, height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: capLeft < 8 ? "#ef4444" : "#84cc16", width: `${Math.min(100,(usedSalary/OFFSEASON_CAP)*100)}%`, transition: "width 0.25s" }} />
              </div>
              <p style={{ fontSize: 8, color: "#65a30d", marginTop: 3, fontWeight: 600 }}>$140M Offseason Cap (+$40M Veteran Fund active)</p>
            </div>
            {expiring.length > 0 && (
              <div style={{ padding: "8px 14px", background: "#fef3c7", borderBottom: "1px solid #f59e0b40", display: "flex", alignItems: "center", gap: 6 }}>
                <WarningIcon size={14} color="#92400e" />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#92400e" }}>{expiring.length} player{expiring.length > 1 ? "s" : ""} need a contract decision</p>
              </div>
            )}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              {slots.map(sl => {
                const name = sl.nbaPlayer?.name ?? sl.rosterPlayer?.name;
                const color = sl.nbaPlayer?.teamColor ?? "#84cc16";
                if (!name) return (
                  <div key={sl.slotId} style={{ padding: "7px 10px", borderRadius: 8, background: "#f3f4f6", marginBottom: 5, fontSize: 10, color: "#9ca3af", textAlign: "center" }}>
                    {sl.label} — Empty
                  </div>
                );
                const isExpiring = sl.yearsLeft === 0;
                return (
                  <div key={sl.slotId} style={{ marginBottom: 6, borderRadius: 10, padding: "9px 10px", background: isExpiring ? "#fef9ec" : "white", border: isExpiring ? "1.5px solid #f59e0b60" : "1px solid rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isExpiring ? 8 : 0 }}>
                      <Avatar color={color} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.78rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{name}</p>
                          <TrendArrow trend={sl.trend} size={11} />
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center", flexWrap: "wrap" }}>
                          <OVRBadge ovr={sl.ovr} small />
                          {sl.ovr !== sl.prevOVR && (
                            <span style={{ fontSize: 10, fontWeight: 800, color: sl.ovr > sl.prevOVR ? "#16a34a" : "#dc2626" }}>
                              {sl.ovr > sl.prevOVR ? `+${sl.ovr - sl.prevOVR}` : `${sl.ovr - sl.prevOVR}`}
                            </span>
                          )}
                          <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "monospace" }}>${sl.salary}M</span>
                          <ContractBadge years={sl.yearsLeft} />
                        </div>
                      </div>
                    </div>
                    {isExpiring && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => extendPlayer(sl.slotId)} style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "#84cc16", color: "#111827", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10 }}>
                          Extend · ${Math.min(28, Math.round(sl.salary * 1.25))}M
                        </button>
                        <button onClick={() => removePlayer(sl.slotId)} style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5", cursor: "pointer", fontWeight: 700, fontSize: 10 }}>
                          Release
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
              {expiring.length > 0 && (
                <p style={{ fontSize: 10, color: "#92400e", fontWeight: 700, textAlign: "center", marginBottom: 6 }}>
                  Extend or release {expiring.length} player{expiring.length > 1 ? "s" : ""} first
                </p>
              )}
              <button
                onClick={() => setPhase("build")}
                disabled={expiring.length > 0}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: expiring.length > 0 ? "#e5e7eb" : "#84cc16", color: expiring.length > 0 ? "#9ca3af" : "#111827", fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.12em", cursor: expiring.length > 0 ? "not-allowed" : "pointer" }}
              >
                {expiring.length > 0 ? `${expiring.length} Contract${expiring.length > 1 ? "s" : ""} Pending` : `Finalize Roster · Season ${season}`}
              </button>
            </div>
          </div>

          {/* Right: Draft / FA tabs */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <OffseasonTabs
              draftClass={draftClass}
              freeAgents={freeAgents}
              nbaPool={CURRENT_NBA_PLAYERS.filter(p => !slots.some(s => s.nbaPlayer?.id === p.id)).sort((a,b) => playerRank(a) - playerRank(b))}
              capLeft={capLeft}
              filledCount={filledCount}
              season={season}
              onDraft={draftProspect}
              onSign={signFA}
              onSignNBA={signNBAPlayer}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Offseason Tabs ────────────────────────────────────────────────────────────
function OffseasonTabs({ draftClass, freeAgents, nbaPool, capLeft, filledCount, season, onDraft, onSign, onSignNBA }: {
  draftClass: Prospect[]; freeAgents: FreeAgent[]; nbaPool: CurrentNBAPlayer[];
  capLeft: number; filledCount: number; season: number;
  onDraft: (p: Prospect) => void; onSign: (fa: FreeAgent) => void; onSignNBA: (p: CurrentNBAPlayer) => void;
}) {
  const [tab, setTab] = useState<"draft" | "fa" | "nba">("draft");
  return (
    <>
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
        {([["draft", "Draft Class"], ["fa", "Free Agents"], ["nba", "NBA Stars"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "11px 16px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: tab === t ? "#f4f0e6" : "white", color: tab === t ? "#111827" : "#6b7280", borderBottom: tab === t ? "2px solid #84cc16" : "2px solid transparent" }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        {tab === "draft" && (
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontFamily: "monospace" }}>{2024 + season} Draft Class · All signees get a 2-year deal</p>
            {draftClass.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "40px 0" }}>All prospects drafted</p>
            : draftClass.map((p, i) => {
              const canDraft = filledCount < 12;
              const ovr = computeOVR(p.ppg, p.rpg, p.apg);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 7, opacity: canDraft ? 1 : 0.5 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{p.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{p.pos} · Age {p.age} · {p.ppg.toFixed(1)}p {p.rpg.toFixed(1)}r</p>
                  </div>
                  <OVRBadge ovr={ovr} />
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0, background: p.potential === "Star" ? "#fef3c7" : p.potential === "Starter" ? "#dcfce7" : p.potential === "Rotation" ? "#ede9fe" : "#f1f5f9", color: p.potential === "Star" ? "#92400e" : p.potential === "Starter" ? "#14532d" : p.potential === "Rotation" ? "#4c1d95" : "#6b7280", border: "1px solid rgba(0,0,0,0.1)" }}>{p.potential}</span>
                  <button onClick={() => canDraft && onDraft(p)} disabled={!canDraft} style={{ padding: "5px 12px", borderRadius: 7, border: "none", flexShrink: 0, background: canDraft ? "#84cc16" : "#e5e7eb", color: canDraft ? "#111827" : "#9ca3af", cursor: canDraft ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11 }}>Draft · ${p.salary}M</button>
                </div>
              );
            })}
          </div>
        )}
        {tab === "fa" && (
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontFamily: "monospace" }}>Free agents available · ${capLeft}M cap space</p>
            {freeAgents.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "40px 0" }}>No free agents available</p>
            : freeAgents.map((fa, i) => {
              const canSign = capLeft >= fa.salary && filledCount < 12;
              const ovr = computeOVR(fa.ppg, fa.rpg, fa.apg);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 7, opacity: canSign ? 1 : 0.45 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{fa.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{fa.pos} · Age {fa.age} · {fa.ppg.toFixed(1)}p {fa.rpg.toFixed(1)}r · ${fa.salary}M/yr</p>
                  </div>
                  <OVRBadge ovr={ovr} />
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 5, flexShrink: 0, background: fa.tier === "Max" ? "#fef3c7" : fa.tier === "Mid" ? "#dcfce7" : "#f1f5f9", color: fa.tier === "Max" ? "#92400e" : fa.tier === "Mid" ? "#14532d" : "#6b7280", border: "1px solid rgba(0,0,0,0.1)" }}>{fa.tier}</span>
                  <button onClick={() => canSign && onSign(fa)} disabled={!canSign} style={{ padding: "5px 12px", borderRadius: 7, border: "none", flexShrink: 0, background: canSign ? "#84cc16" : "#e5e7eb", color: canSign ? "#111827" : "#9ca3af", cursor: canSign ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 11 }}>Sign</button>
                </div>
              );
            })}
          </div>
        )}
        {tab === "nba" && (
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontFamily: "monospace" }}>Sign current NBA players · ${capLeft}M cap space · 2-year deal</p>
            {nbaPool.length === 0
              ? <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", padding: "40px 0" }}>All available players already on your roster</p>
              : nbaPool.map(p => {
                const sal = playerSalary(p);
                const ovr = computeOVR(p.ppg, p.rpg, p.apg, p.spg, p.bpg);
                const canSign = capLeft >= sal && filledCount < 12;
                return (
                  <button key={p.id} onClick={() => canSign && onSignNBA(p)} disabled={!canSign}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.07)", marginBottom: 7, opacity: canSign ? 1 : 0.4, cursor: canSign ? "pointer" : "not-allowed", textAlign: "left" }}
                    onMouseEnter={e => { if (canSign) e.currentTarget.style.borderColor = "#84cc16"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)"; }}
                  >
                    <Avatar color={p.teamColor} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1 }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", marginTop: 2 }}>{p.position} · Age {playerAge(p)} · {p.ppg}p {p.rpg}r {p.apg}a</p>
                    </div>
                    <OVRBadge ovr={ovr} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: canSign ? "#65a30d" : "#ef4444", width: 46, textAlign: "right", flexShrink: 0 }}>${sal}M</span>
                  </button>
                );
              })
            }
          </div>
        )}
      </div>
    </>
  );
}
