"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";

// ─── Tier System ──────────────────────────────────────────────────────────────
// S  = MVP-caliber elite  ($18M) — Jokic, SGA, Luka, Giannis, Wemby, Ant …
// A  = Franchise star     ($12M) — KD, Booker, Dame, Brunson, Maxey, Trae …
// B  = Quality starter    ($8M)  — solid starters, near All-Stars
// C  = Role player        ($5M)  — rotation contributors
// D  = Bench              ($3M)  — depth / specialists
const SALARY_CAP = 100; // $100M

const TIER_CONFIG = {
  S: { price: 18, label: "S", bg: "#fef3c7", text: "#92400e", border: "#f59e0b", desc: "MVP Tier"       },
  A: { price: 12, label: "A", bg: "#ede9fe", text: "#4c1d95", border: "#8b5cf6", desc: "Franchise Star" },
  B: { price:  8, label: "B", bg: "#dbeafe", text: "#1e3a8a", border: "#60a5fa", desc: "Starter"        },
  C: { price:  5, label: "C", bg: "#dcfce7", text: "#14532d", border: "#4ade80", desc: "Role Player"    },
  D: { price:  3, label: "D", bg: "#f1f5f9", text: "#475569", border: "#94a3b8", desc: "Bench"          },
} as const;

type TierKey = keyof typeof TIER_CONFIG;

// Manual overrides: players whose current playoff/preseason form or franchise
// status puts them above (or below) what the stat formula alone would say.
const TIER_OVERRIDES: Record<string, TierKey> = {
  // S bumps — borderline score but undeniably MVP-tier performers
  ant:      "S", // 28.8 ppg, elite two-way star, rising top-3 candidate
  dmitchell:"S", // 27.9 ppg, elite playoff scorer, franchise cornerstone
  embiid:   "S", // MVP when healthy, generational scorer
  tatum:    "S", // Champion, first-team All-NBA, elite postseason performer
  curry:    "S", // GOAT shooter, still the engine of a contender

  // A caps — star caliber but injury history or age keeps them from S
  ja:       "A", // Elite when healthy; chronic injury risk caps the price
  lebron:   "A", // Still All-Star quality at 41, but no longer S-tier impact
};

function playerTier(p: CurrentNBAPlayer): TierKey {
  if (p.id in TIER_OVERRIDES) return TIER_OVERRIDES[p.id];
  // Composite score weights scoring + playmaking + defense
  const score = p.ppg + p.rpg * 0.5 + p.apg * 0.75 + p.spg * 1.5 + p.bpg * 1.2;
  if (score >= 38) return "S"; // true MVP / elite level
  if (score >= 29) return "A"; // All-Star / franchise star
  if (score >= 20) return "B"; // quality starter
  if (score >= 12) return "C"; // rotation contributor
  return "D";
}

function playerSalary(p: CurrentNBAPlayer): number {
  return TIER_CONFIG[playerTier(p)].price;
}

// ─── Slot definitions ──────────────────────────────────────────────────────────
const SLOT_DEFS = [
  { id: "pg",    label: "POINT GUARD",    defaultMin: 36 },
  { id: "sg",    label: "SHOOTING GUARD", defaultMin: 30 },
  { id: "sf",    label: "SMALL FORWARD",  defaultMin: 28 },
  { id: "pf",    label: "POWER FORWARD",  defaultMin: 28 },
  { id: "c",     label: "CENTER",         defaultMin: 30 },
  { id: "6th",   label: "6TH MAN",        defaultMin: 24 },
  { id: "rot1",  label: "ROTATION",       defaultMin: 20 },
  { id: "rot2",  label: "ROTATION",       defaultMin: 16 },
  { id: "rot3",  label: "ROTATION",       defaultMin: 12 },
  { id: "rot4",  label: "ROTATION",       defaultMin: 10 },
  { id: "lpt",   label: "LIMITED PT",     defaultMin: 8  },
  { id: "bench", label: "DEEP BENCH",     defaultMin: 4  },
] as const;

interface Slot { id: string; label: string; player: CurrentNBAPlayer | null; minutes: number; }

// ─── Projection engine ─────────────────────────────────────────────────────────
function runProjection(slots: Slot[]) {
  const filled = slots.filter(s => s.player !== null);
  if (filled.length < 5) return null;

  let offScore = 0;
  let defScore = 0;
  for (const s of filled) {
    const p = s.player!;
    const w = s.minutes / 48;
    offScore += (p.ppg * 0.9 + p.apg * 1.4) * w;
    defScore += (p.spg * 4 + p.bpg * 3 + p.rpg * 0.4) * w;
  }

  const oRating    = Math.min(138, Math.max(98, 95 + offScore * 1.7));
  const dRating    = Math.min(130, Math.max(98, 122 - defScore * 1.9));
  const netRating  = oRating - dRating;
  const projWins   = Math.round(Math.min(73, Math.max(8, 41 + netRating * 2.4)));

  const positions = new Set(filled.map(s => s.player!.position));
  const stars     = filled.filter(s => playerSalary(s.player!) >= 12).length;
  const chem      = (positions.size / 5) * 0.5 + (stars <= 3 ? 1 : Math.max(0.4, 1 - (stars - 3) * 0.15)) * 0.5;
  const chemistry = chem >= 0.88 ? "A+" : chem >= 0.78 ? "A" : chem >= 0.68 ? "B+" : chem >= 0.58 ? "B" : "C";

  const playoffs = Math.min(99, Math.max(2, Math.round((projWins - 18) / 56 * 100)));
  const r2       = Math.round(playoffs * 0.88);
  const cf       = Math.round(r2 * 0.82);
  const finals   = Math.round(cf * 0.72);
  const champs   = Math.round(finals * 0.62);

  const sorted  = [...filled].sort((a, b) => b.minutes - a.minutes);
  const starterLabels = ["Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center"];

  return {
    oRating: oRating.toFixed(1), dRating: dRating.toFixed(1),
    netRating: netRating.toFixed(1), projWins, chemistry,
    playoffs, r2, cf, finals, champs,
    starters: sorted.slice(0, 5),
    starterLabels,
    sixthMan: sorted[5] ?? null,
    bench: sorted.slice(6),
  };
}

// ─── Tier Badge ───────────────────────────────────────────────────────────────
function TierBadge({ tier, small }: { tier: TierKey; small?: boolean }) {
  const cfg = TIER_CONFIG[tier];
  const size = small ? 18 : 22;
  return (
    <div style={{
      width: size, height: size, borderRadius: 4, flexShrink: 0,
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: small ? 9 : 11, fontFamily: "var(--font-bebas)",
      letterSpacing: "0.05em", color: cfg.text, fontWeight: 700,
    }}>
      {cfg.label}
    </div>
  );
}

// ─── Player Avatar ─────────────────────────────────────────────────────────────
function Avatar({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: color + "20", border: `2px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size * 0.54} height={size * 0.54} viewBox="0 0 24 27" fill={color + "bb"}>
        <circle cx="12" cy="7" r="5"/>
        <path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
      </svg>
    </div>
  );
}

// ─── Slot Card ─────────────────────────────────────────────────────────────────
function SlotCard({ slot, isActive, onActivate, onRemove, onMinutes }: {
  slot: Slot; isActive: boolean;
  onActivate: () => void; onRemove: () => void; onMinutes: (v: number) => void;
}) {
  const border = isActive && !slot.player ? "2px solid #84cc16" : "1.5px solid rgba(0,0,0,0.1)";
  const bg     = isActive && !slot.player ? "rgba(132,204,22,0.05)" : "white";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={slot.player ? undefined : onActivate}
      style={{ borderRadius: 12, border, background: bg, boxShadow: isActive && !slot.player ? "0 0 0 3px rgba(132,204,22,0.15)" : "0 2px 8px rgba(0,0,0,0.06)", cursor: slot.player ? "default" : "pointer", overflow: "hidden", minHeight: 168 }}
    >
      {/* Role header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: 9, fontFamily: "var(--font-bebas)", letterSpacing: "0.2em", color: "#9ca3af", lineHeight: 1 }}>{slot.label}</p>
        <p style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace", marginTop: 1 }}>{slot.minutes} min/game</p>
      </div>

      {slot.player ? (
        <div style={{ padding: "10px 12px 10px" }}>
          {/* Remove */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Avatar color={slot.player.teamColor} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem", letterSpacing: "0.06em", color: "#111827", lineHeight: 1.1, paddingRight: 20 }}>{slot.player.name}</p>
              <p style={{ fontSize: 9, color: "#6b7280", marginTop: 2, fontFamily: "monospace" }}>{slot.player.team.split(" ").slice(-1)[0]} · {slot.player.position}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <TierBadge tier={playerTier(slot.player)} small />
                <p style={{ fontSize: 10, color: "#65a30d", fontFamily: "monospace", fontWeight: 700 }}>${playerSalary(slot.player)}M</p>
                <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}>{TIER_CONFIG[playerTier(slot.player)].desc}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position: "absolute" as const, top: 8, right: 8, width: 20, height: 20, background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}
            >×</button>
          </div>
          {/* Slider */}
          <div style={{ marginTop: 10, position: "relative" as const }}>
            <input
              type="range" min={0} max={48} step={1} value={slot.minutes}
              onChange={e => onMinutes(Number(e.target.value))}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", accentColor: "#84cc16" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              {[0, 12, 24, 36, 48].map(v => (
                <span key={v} style={{ fontSize: 8, color: "#d1d5db", fontFamily: "monospace" }}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 12px", gap: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 27" fill="#d1d5db">
              <circle cx="12" cy="7" r="5"/><path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
            </svg>
          </div>
          <p style={{ fontSize: 11, color: isActive ? "#65a30d" : "#9ca3af", fontFamily: "monospace", textAlign: "center", fontWeight: isActive ? 600 : 400 }}>
            {isActive ? "← Pick a player" : "Empty Slot"}
          </p>
          {!isActive && <p style={{ fontSize: 9, color: "#d1d5db", fontFamily: "monospace" }}>Select a player</p>}
        </div>
      )}
    </motion.div>
  );
}

// ─── Stat cell ─────────────────────────────────────────────────────────────────
function StatCell({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ background: "#faf9f4", padding: "12px 14px" }}>
      <p style={{ fontSize: 8, fontFamily: "var(--font-bebas)", letterSpacing: "0.18em", color: "#9ca3af", marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.3rem", letterSpacing: "0.06em", color: accent ? "#2563eb" : "#111827", lineHeight: 1 }}>{value}</p>
    </div>
  );
}

// ─── Projection Modal ──────────────────────────────────────────────────────────
function ProjectionModal({ slots, onClose }: { slots: Slot[]; onClose: () => void }) {
  const proj = runProjection(slots);
  if (!proj) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#faf9f4", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 90px rgba(0,0,0,0.4)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.14em", color: "#111827", lineHeight: 1 }}>TEAM PROJECTION</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, background: "rgba(0,0,0,0.07)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Starters + Bench panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", margin: "16px 24px 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
          {/* Starters */}
          <div style={{ background: "#141c2b", padding: "14px 18px" }}>
            <p style={{ fontSize: 9, fontFamily: "var(--font-bebas)", letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>STARTERS & 6TH MAN</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {proj.starters.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar color={s.player!.teamColor} size={34} />
                  <div>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.88rem", letterSpacing: "0.06em", color: "white", lineHeight: 1 }}>{s.player!.name}</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginTop: 1 }}>{proj.starterLabels[i]}</p>
                  </div>
                </div>
              ))}
              {proj.sixthMan && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar color={proj.sixthMan.player!.teamColor} size={34} />
                  <div>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.88rem", letterSpacing: "0.06em", color: "white", lineHeight: 1 }}>{proj.sixthMan.player!.name}</p>
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginTop: 1 }}>6th Man</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Bench */}
          <div style={{ background: "#1a2535", padding: "14px 18px", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 9, fontFamily: "var(--font-bebas)", letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>BENCH PLAYERS</p>
            {proj.bench.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {proj.bench.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar color={s.player!.teamColor} size={34} />
                    <div>
                      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.88rem", letterSpacing: "0.06em", color: "white", lineHeight: 1 }}>{s.player!.name}</p>
                      <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginTop: 1 }}>Rotation</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>No bench players</p>
            )}
          </div>
        </div>

        {/* Team stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "rgba(0,0,0,0.07)", margin: "14px 24px 0", borderRadius: 8, overflow: "hidden" }}>
          <StatCell label="O RATING"    value={proj.oRating}    accent />
          <StatCell label="D RATING"    value={proj.dRating}    accent />
          <StatCell label="PROJ. WINS"  value={proj.projWins}            />
          <StatCell label="NET RATING"  value={proj.netRating}           />
          <StatCell label="CHEMISTRY"   value={proj.chemistry}           />
        </div>

        {/* Playoff odds */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "rgba(0,0,0,0.07)", margin: "1px 24px 0", borderRadius: 8, overflow: "hidden" }}>
          <StatCell label="PLAYOFFS %"      value={`${proj.playoffs}.0%`} />
          <StatCell label="2ND ROUND %"     value={`${proj.r2}.0%`}       />
          <StatCell label="CONF. FINALS %"  value={`${proj.cf}.0%`}       />
          <StatCell label="FINALS %"        value={`${proj.finals}.0%`}   />
          <StatCell label="CHAMPS %:"       value={`${proj.champs}.0%`}   />
        </div>

        {/* CTA */}
        <div style={{ padding: "18px 24px" }}>
          <button
            onClick={onClose}
            style={{ width: "100%", background: "linear-gradient(90deg, #2563eb, #3b82f6)", color: "white", border: "none", borderRadius: 8, padding: "14px", fontFamily: "var(--font-bebas)", fontSize: "1.15rem", letterSpacing: "0.18em", cursor: "pointer" }}
          >
            SHOW OFF YOUR SQUAD!
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SimulationsPage() {
  const [slots, setSlots] = useState<Slot[]>(
    SLOT_DEFS.map(d => ({ id: d.id, label: d.label, player: null, minutes: d.defaultMin }))
  );
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [teamFilter, setTeamFilter]     = useState("All Teams");
  const [posFilter, setPosFilter]       = useState("All Positions");
  const [showModal, setShowModal]       = useState(false);

  const usedSalary   = slots.reduce((s, sl) => s + (sl.player ? playerSalary(sl.player) : 0), 0);
  const filledCount  = slots.filter(s => s.player !== null).length;
  const capPct       = (usedSalary / SALARY_CAP) * 100;
  const capColor     = capPct >= 95 ? "#ef4444" : capPct >= 80 ? "#f59e0b" : "#84cc16";

  const teamList = useMemo(() => {
    const teams = [...new Set(CURRENT_NBA_PLAYERS.map(p => p.team))].sort();
    return ["All Teams", ...teams];
  }, []);

  const filteredPlayers = useMemo(() => {
    const usedIds = new Set(slots.filter(s => s.player).map(s => s.player!.id));
    const q = search.toLowerCase();
    return CURRENT_NBA_PLAYERS
      .filter(p => {
        if (usedIds.has(p.id)) return false;
        if (q && !p.name.toLowerCase().includes(q) && !p.team.toLowerCase().includes(q)) return false;
        if (teamFilter !== "All Teams" && p.team !== teamFilter) return false;
        if (posFilter !== "All Positions" && p.position !== posFilter) return false;
        return true;
      })
      .sort((a, b) => playerSalary(b) - playerSalary(a));
  }, [slots, search, teamFilter, posFilter]);

  const selectPlayer = useCallback((player: CurrentNBAPlayer) => {
    setSlots(prev => {
      const currentUsed = prev.reduce((s, sl) => s + (sl.player ? playerSalary(sl.player) : 0), 0);
      if (currentUsed + playerSalary(player) > SALARY_CAP) return prev;

      const targetId = activeSlotId ?? prev.find(s => !s.player)?.id;
      if (!targetId) return prev;

      const updated = prev.map(s => s.id === targetId ? { ...s, player } : s);
      const nextEmpty = updated.find(s => !s.player)?.id ?? null;
      setActiveSlotId(nextEmpty);
      return updated;
    });
  }, [activeSlotId]);

  const removePlayer = useCallback((slotId: string) => {
    const def = SLOT_DEFS.find(d => d.id === slotId);
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, player: null, minutes: def?.defaultMin ?? 10 } : s));
  }, []);

  const setMinutes = useCallback((slotId: string, minutes: number) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, minutes } : s));
  }, []);

  const canProject = filledCount >= 5;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f0e6", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, height: 56, background: "rgba(244,240,230,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.09)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #84cc16, #84cc1640)" }} />
        <Link href="/home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.svg" alt="" style={{ height: 34 }} />
          <span style={{ fontFamily: "var(--font-bebas)", color: "#111827", fontSize: "1.35rem", letterSpacing: "0.08em" }}>Courtside Central</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Cap meter */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Salary Cap</p>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", color: capColor, letterSpacing: "0.06em", lineHeight: 1 }}>${usedSalary}M <span style={{ color: "#9ca3af" }}>/ ${SALARY_CAP}M</span></p>
          </div>
          <div style={{ width: 90, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, capPct)}%`, background: capColor, transition: "width 0.3s, background 0.3s", borderRadius: 3 }} />
          </div>
          <button
            onClick={() => canProject && setShowModal(true)}
            disabled={!canProject}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 8, border: "none", cursor: canProject ? "pointer" : "not-allowed", fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.15em", background: canProject ? "linear-gradient(90deg, #84cc16, #ccff00)" : "#e5e7eb", color: canProject ? "#111827" : "#9ca3af" }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2l11 6-11 6z"/></svg>
            Run Projection
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Sidebar ── */}
        <aside style={{ width: 284, flexShrink: 0, background: "white", borderRight: "1px solid rgba(0,0,0,0.09)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px" }}>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem", letterSpacing: "0.22em", color: "#6b7280", marginBottom: 10 }}>PLAYER BROWSER</p>
            {/* Search */}
            <div style={{ position: "relative" as const, marginBottom: 8 }}>
              <input
                type="text" placeholder="Search players…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "7px 10px 7px 32px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 12, color: "#111827", outline: "none", boxSizing: "border-box" as const, background: "#fafafa" }}
              />
              <svg style={{ position: "absolute" as const, left: 9, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6 }}>
              <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={{ flex: 1, padding: "5px 6px", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: 10, color: "#374151", background: "white", outline: "none" }}>
                {teamList.map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ width: 90, padding: "5px 6px", borderRadius: 6, border: "1.5px solid #e5e7eb", fontSize: 10, color: "#374151", background: "white", outline: "none" }}>
                <option>All Positions</option>
                {["PG","SG","SF","PF","C"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Tier legend */}
          <div style={{ padding: "8px 14px 10px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {(Object.entries(TIER_CONFIG) as [TierKey, typeof TIER_CONFIG[TierKey]][]).map(([key, cfg]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontFamily: "var(--font-bebas)", color: cfg.text, fontWeight: 700 }}>{cfg.label}</div>
                <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}>${cfg.price}M</span>
              </div>
            ))}
            <span style={{ fontSize: 9, color: "#d1d5db", fontFamily: "monospace", marginLeft: 2 }}>cap: $100M</span>
          </div>

          {/* Player list */}
          <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #f3f4f6" }}>
            {filteredPlayers.map(player => {
              const tier = playerTier(player);
              const sal  = playerSalary(player);
              const over = usedSalary + sal > SALARY_CAP;
              return (
                <div key={player.id} style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: "1px solid #f9fafb", gap: 9, opacity: over ? 0.5 : 1 }}>
                  <Avatar color={player.teamColor} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.8rem", letterSpacing: "0.05em", color: "#111827", lineHeight: 1.1, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</p>
                    <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}>{player.team.split(" ").slice(-1)[0]} · {player.position}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <TierBadge tier={tier} small />
                    <p style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: over ? "#ef4444" : "#65a30d", minWidth: 28, textAlign: "right" as const }}>${sal}M</p>
                  </div>
                  <button
                    onClick={() => !over && selectPlayer(player)}
                    disabled={over}
                    style={{ padding: "4px 10px", borderRadius: 6, border: `1.5px solid ${over ? "#e5e7eb" : "#84cc16"}`, background: "white", color: over ? "#d1d5db" : "#65a30d", fontSize: 10, fontFamily: "var(--font-bebas)", letterSpacing: "0.1em", cursor: over ? "not-allowed" : "pointer", whiteSpace: "nowrap" as const }}
                  >Select</button>
                </div>
              );
            })}
            {filteredPlayers.length === 0 && (
              <p style={{ textAlign: "center" as const, color: "#9ca3af", fontFamily: "monospace", fontSize: 11, padding: 24, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>No players found</p>
            )}
          </div>
        </aside>

        {/* ── Main Roster Area ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "22px 24px 40px" }}>
          {/* Title + progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.5rem", letterSpacing: "0.12em", color: "#111827", lineHeight: 1 }}>Build your championship squad</h1>
                <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginTop: 3 }}>Click a slot to activate it, then select a player from the left panel</p>
              </div>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.08em", color: "#6b7280", whiteSpace: "nowrap" as const }}>{filledCount}/12 players</p>
            </div>

            {/* Roster progress bar */}
            <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${(filledCount / 12) * 100}%`, background: "linear-gradient(90deg, #84cc16, #a3e635)", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* 4-column slot grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, position: "relative" as const }}>
            {slots.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isActive={activeSlotId === slot.id}
                onActivate={() => setActiveSlotId(prev => prev === slot.id ? null : slot.id)}
                onRemove={() => removePlayer(slot.id)}
                onMinutes={v => setMinutes(slot.id, v)}
              />
            ))}
          </div>

          {!canProject && filledCount > 0 && (
            <p style={{ textAlign: "center" as const, color: "#9ca3af", fontFamily: "monospace", fontSize: 10, marginTop: 20, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              Add {5 - filledCount} more player{5 - filledCount > 1 ? "s" : ""} to unlock projection
            </p>
          )}
          {filledCount === 0 && (
            <p style={{ textAlign: "center" as const, color: "#d1d5db", fontFamily: "monospace", fontSize: 10, marginTop: 20, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              Select players from the browser to build your squad
            </p>
          )}
        </main>
      </div>

      {/* ── Projection Modal ── */}
      <AnimatePresence>
        {showModal && <ProjectionModal slots={slots} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
