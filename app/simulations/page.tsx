"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CURRENT_NBA_PLAYERS, type CurrentNBAPlayer } from "@/lib/currentNBAPlayers";

// ─── Rank-based Pricing ───────────────────────────────────────────────────────
const SALARY_CAP   = 100; // $100M
const TOTAL_MINS   = 240; // 5 players × 48 min

const RINGER_RANKINGS: Record<string, number> = {
  // ── #1-6  ($18M) ─────────────────────────────────────────────────────
  jokic: 1, sga: 2, giannis: 3, luka: 4, ant: 5, wemby: 6,
  // ── #7-16  ($14M) ────────────────────────────────────────────────────
  curry: 7, brunson: 8, dmitchell: 9, cade: 10,
  lebron: 11, ad: 12, durant: 13, jwilliams2: 14, mobley: 15, tatum: 16,
  // ── #17-26  ($11M) ───────────────────────────────────────────────────
  jbrown: 17, booker: 18, banchero: 19, siakam: 20,
  kat: 21, kawhi: 22, harden: 23, jbutler: 24, bam: 25, defox: 26,
  // ── #27-36  ($9M) ────────────────────────────────────────────────────
  trae: 27, sengun: 28, jjackson: 29, cholmgren: 30,
  sabonis: 31, tmaxey: 32, garland: 33, ja: 34, fwagner: 35, jmurray: 36,
  // ── #37-46  ($7M) ────────────────────────────────────────────────────
  embiid: 37, sbarnes: 38, oganunoby: 39, haliburton: 40,
  athompson: 41, dame: 42, dbane: 43, agordon: 44, jrandle: 45, therro: 46,
  // ── #47-56  ($6M) ────────────────────────────────────────────────────
  lmarkkanen: 47, lamelo: 48, jallen: 49, mikalbridg: 50,
  areaves: 51, lavine: 52, kyrie: 53, dwhite: 54, dgreen: 55, zubac: 56,
  // ── #57-66  ($5M) ────────────────────────────────────────────────────
  zion: 57, jjohnson: 58, gobert: 59, mturner: 60,
  npowell: 61, ddaniels: 62, pgeorge: 63, mporter: 64, jhart: 65, acaruso: 66,
  // ── #67-76  ($4M) ────────────────────────────────────────────────────
  porzingis: 67, cjohnson: 68, ihartenstein: 69, cwhite: 70,
  tmurphy: 71, jmcdaniels: 72, ldort: 73, jsuggs: 74, bingram: 75, nreid: 76,
  // ── #77-86  ($3M) ────────────────────────────────────────────────────
  cbraun: 77, ppritchard: 78, giddey: 79, bmiller: 80,
  holiday: 81, anembhard: 82, cflagg: 83, rjbarrett: 84, dehunter: 85, anesmith: 86,
  // ── #87-96  ($2M) ────────────────────────────────────────────────────
  vucevic: 87, cjmcc: 88, tcamara: 89, dlively: 90,
  jgreen2: 91, asimons: 92, tharris: 93, dvassell: 94, kthompson: 95, jsmith: 96,
};

const RANK_TIERS = [
  { rangeLabel: "#1–6",    price: 18, bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  { rangeLabel: "#7–16",   price: 14, bg: "#ede9fe", text: "#4c1d95", border: "#8b5cf6" },
  { rangeLabel: "#17–26",  price: 11, bg: "#dbeafe", text: "#1e3a8a", border: "#60a5fa" },
  { rangeLabel: "#27–36",  price:  9, bg: "#dcfce7", text: "#14532d", border: "#4ade80" },
  { rangeLabel: "#37–46",  price:  7, bg: "#f0fdf4", text: "#166534", border: "#86efac" },
  { rangeLabel: "#47–56",  price:  6, bg: "#ecfeff", text: "#164e63", border: "#67e8f9" },
  { rangeLabel: "#57–66",  price:  5, bg: "#f0f9ff", text: "#075985", border: "#7dd3fc" },
  { rangeLabel: "#67–76",  price:  4, bg: "#faf5ff", text: "#581c87", border: "#c084fc" },
  { rangeLabel: "#77–86",  price:  3, bg: "#fdf4ff", text: "#701a75", border: "#e879f9" },
  { rangeLabel: "#87–96",  price:  2, bg: "#fff1f2", text: "#9f1239", border: "#fda4af" },
  { rangeLabel: "#97–100", price:  2, bg: "#fff7ed", text: "#9a3412", border: "#fdba74" },
  { rangeLabel: "NR",      price:  1, bg: "#f1f5f9", text: "#475569", border: "#94a3b8" },
] as const;

function playerRank(p: CurrentNBAPlayer): number {
  return RINGER_RANKINGS[p.id] ?? 999;
}

function rankTierIndex(rank: number): number {
  if (rank <=   6) return 0;
  if (rank <=  16) return 1;
  if (rank <=  26) return 2;
  if (rank <=  36) return 3;
  if (rank <=  46) return 4;
  if (rank <=  56) return 5;
  if (rank <=  66) return 6;
  if (rank <=  76) return 7;
  if (rank <=  86) return 8;
  if (rank <=  96) return 9;
  if (rank <= 100) return 10;
  return 11;
}

function playerSalary(p: CurrentNBAPlayer): number {
  return RANK_TIERS[rankTierIndex(playerRank(p))].price;
}

// ─── Slot definitions — defaults sum exactly to 240 ───────────────────────────
const SLOT_DEFS = [
  { id: "pg",    label: "POINT GUARD",    defaultMin: 36 },
  { id: "sg",    label: "SHOOTING GUARD", defaultMin: 30 },
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

interface Slot { id: string; label: string; player: CurrentNBAPlayer | null; minutes: number; }

// ─── Projection engine ─────────────────────────────────────────────────────────
function runProjection(slots: Slot[]) {
  const filled = slots.filter(s => s.player !== null);
  if (filled.length < 12) return null;

  let offScore = 0;
  let defScore = 0;
  for (const s of filled) {
    const p = s.player!;
    const w = s.minutes / 48;
    offScore += (p.ppg * 0.9 + p.apg * 1.4) * w;
    defScore += (p.spg * 4 + p.bpg * 3 + p.rpg * 0.4) * w;
  }

  const oRating   = Math.min(138, Math.max(98, 95 + offScore * 1.7));
  const dRating   = Math.min(130, Math.max(98, 122 - defScore * 1.9));
  const netRating = oRating - dRating;
  const projWins  = Math.round(Math.min(73, Math.max(8, 41 + netRating * 2.4)));

  const positions = new Set(filled.map(s => s.player!.position));
  const stars     = filled.filter(s => playerSalary(s.player!) >= 11).length;
  const chem      = (positions.size / 5) * 0.5 + (stars <= 3 ? 1 : Math.max(0.4, 1 - (stars - 3) * 0.15)) * 0.5;
  const chemistry = chem >= 0.88 ? "A+" : chem >= 0.78 ? "A" : chem >= 0.68 ? "B+" : chem >= 0.58 ? "B" : "C";

  const playoffs = Math.min(99, Math.max(2, Math.round((projWins - 18) / 56 * 100)));
  const r2       = Math.round(playoffs * 0.88);
  const cf       = Math.round(r2 * 0.82);
  const finals   = Math.round(cf * 0.72);
  const champs   = Math.round(finals * 0.62);

  const sorted       = [...filled].sort((a, b) => b.minutes - a.minutes);
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
function TierBadge({ player, small }: { player: CurrentNBAPlayer; small?: boolean }) {
  const rank = playerRank(player);
  const tier = RANK_TIERS[rankTierIndex(rank)];
  const label = rank <= 100 ? `#${rank}` : "NR";
  const height = small ? 18 : 22;
  return (
    <div style={{
      height, minWidth: small ? 30 : 36, paddingInline: 4, borderRadius: 4, flexShrink: 0,
      background: tier.bg, border: `1.5px solid ${tier.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: small ? 8 : 10, fontFamily: "var(--font-bebas)",
      letterSpacing: "0.03em", color: tier.text, fontWeight: 700,
    }}>
      {label}
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
function SlotCard({ slot, isActive, isDragging, isDragOver, maxMinutes, onActivate, onRemove,
                    onMinutes, onMinutesScrubStart,
                    onDragStart, onDragEnd, onDragEnter, onDragLeave, onDrop }: {
  slot: Slot; isActive: boolean; isDragging: boolean; isDragOver: boolean;
  maxMinutes: number;
  onActivate: () => void; onRemove: () => void;
  onMinutes: (v: number) => void;
  onMinutesScrubStart: (e: React.MouseEvent) => void;
  onDragStart: () => void; onDragEnd: () => void;
  onDragEnter: () => void; onDragLeave: () => void; onDrop: () => void;
}) {
  const [handleHover, setHandleHover] = React.useState(false);

  let border = "1.5px solid rgba(0,0,0,0.1)";
  let bg     = "white";
  let shadow = "0 2px 8px rgba(0,0,0,0.06)";

  if (isDragOver) {
    border = "2px solid #84cc16";
    bg     = "rgba(132,204,22,0.06)";
    shadow = "0 0 0 3px rgba(132,204,22,0.2)";
  } else if (isActive && !slot.player) {
    border = "2px solid #84cc16";
    bg     = "rgba(132,204,22,0.05)";
    shadow = "0 0 0 3px rgba(132,204,22,0.15)";
  }

  return (
    <motion.div
      whileHover={isDragging ? {} : { y: -2 }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter(); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Element)) onDragLeave();
      }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      onClick={slot.player ? undefined : onActivate}
      style={{
        borderRadius: 12, border, background: bg, boxShadow: shadow,
        cursor: slot.player ? "default" : isActive ? "pointer" : "default",
        overflow: "hidden", minHeight: 168,
        opacity: isDragging ? 0.45 : 1,
        transition: "opacity 0.15s, box-shadow 0.15s, border-color 0.15s",
        position: "relative" as const,
      }}
    >
      {/* Role header */}
      <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 9, fontFamily: "var(--font-bebas)", letterSpacing: "0.2em", color: "#9ca3af", lineHeight: 1 }}>{slot.label}</p>
          {/* Drag-to-scrub minutes number */}
          <p
            style={{
              fontSize: 9, color: slot.player ? "#374151" : "#6b7280",
              fontFamily: "monospace", marginTop: 1,
              cursor: slot.player ? "ew-resize" : "default",
              userSelect: "none",
              display: "inline-flex", alignItems: "center", gap: 3,
            }}
            onMouseDown={slot.player ? (e) => { e.stopPropagation(); onMinutesScrubStart(e); } : undefined}
          >
            {slot.player && (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="#9ca3af">
                <path d="M2 1h1v6H2zm3 0h1v6H5z"/>
              </svg>
            )}
            {slot.minutes} min
          </p>
        </div>
        {/* Dedicated drag handle — only this element is draggable */}
        {slot.player && (
          <div
            draggable
            onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
            onDragEnd={(e) => { e.stopPropagation(); onDragEnd(); }}
            onMouseEnter={() => setHandleHover(true)}
            onMouseLeave={() => setHandleHover(false)}
            title="Drag to reorder"
            style={{
              flexShrink: 0, padding: "3px 4px", borderRadius: 4,
              cursor: "grab", userSelect: "none",
              background: handleHover ? "rgba(0,0,0,0.06)" : "transparent",
              transition: "background 0.12s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill={handleHover ? "#6b7280" : "#d1d5db"} style={{ display: "block", transition: "fill 0.12s" }}>
              <circle cx="3.5" cy="2" r="1.2"/><circle cx="8.5" cy="2" r="1.2"/>
              <circle cx="3.5" cy="6" r="1.2"/><circle cx="8.5" cy="6" r="1.2"/>
              <circle cx="3.5" cy="10" r="1.2"/><circle cx="8.5" cy="10" r="1.2"/>
            </svg>
          </div>
        )}
      </div>

      {slot.player ? (
        <div style={{ padding: "10px 12px 10px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Avatar color={slot.player.teamColor} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.9rem", letterSpacing: "0.06em", color: "#111827", lineHeight: 1.1, paddingRight: 20 }}>{slot.player.name}</p>
              <p style={{ fontSize: 9, color: "#6b7280", marginTop: 2, fontFamily: "monospace" }}>{slot.player.team.split(" ").slice(-1)[0]} · {slot.player.position}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <TierBadge player={slot.player} small />
                <p style={{ fontSize: 10, color: "#65a30d", fontFamily: "monospace", fontWeight: 700 }}>${playerSalary(slot.player)}M</p>
                <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "monospace" }}>{RANK_TIERS[rankTierIndex(playerRank(slot.player))].rangeLabel}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{ position: "absolute" as const, top: 8, right: 8, width: 20, height: 20, background: "rgba(0,0,0,0.06)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center" }}
            >×</button>
          </div>
          {/* Slider */}
          <div style={{ marginTop: 10 }}>
            <input
              type="range" min={0} max={maxMinutes} step={1} value={slot.minutes}
              onChange={e => onMinutes(Number(e.target.value))}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
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
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: isDragOver ? "rgba(132,204,22,0.12)" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
            <svg width="22" height="22" viewBox="0 0 24 27" fill={isDragOver ? "#84cc16" : "#d1d5db"}>
              <circle cx="12" cy="7" r="5"/><path d="M3 23c0-5 4-8.5 9-8.5s9 3.5 9 8.5z"/>
            </svg>
          </div>
          <p style={{ fontSize: 11, color: isDragOver ? "#65a30d" : isActive ? "#65a30d" : "#9ca3af", fontFamily: "monospace", textAlign: "center", fontWeight: isDragOver || isActive ? 600 : 400 }}>
            {isDragOver ? "Drop here" : isActive ? "← Pick a player" : "Empty Slot"}
          </p>
          {!isActive && !isDragOver && <p style={{ fontSize: 9, color: "#d1d5db", fontFamily: "monospace" }}>Select a player</p>}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.14em", color: "#111827", lineHeight: 1 }}>TEAM PROJECTION</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, background: "rgba(0,0,0,0.07)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", margin: "16px 24px 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.1)" }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "rgba(0,0,0,0.07)", margin: "14px 24px 0", borderRadius: 8, overflow: "hidden" }}>
          <StatCell label="O RATING"   value={proj.oRating}   accent />
          <StatCell label="D RATING"   value={proj.dRating}   accent />
          <StatCell label="PROJ. WINS" value={proj.projWins}          />
          <StatCell label="NET RATING" value={proj.netRating}         />
          <StatCell label="CHEMISTRY"  value={proj.chemistry}         />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1, background: "rgba(0,0,0,0.07)", margin: "1px 24px 0", borderRadius: 8, overflow: "hidden" }}>
          <StatCell label="PLAYOFFS %"     value={`${proj.playoffs}.0%`} />
          <StatCell label="2ND ROUND %"    value={`${proj.r2}.0%`}       />
          <StatCell label="CONF. FINALS %" value={`${proj.cf}.0%`}       />
          <StatCell label="FINALS %"       value={`${proj.finals}.0%`}   />
          <StatCell label="CHAMPS %:"      value={`${proj.champs}.0%`}   />
        </div>

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
  const [activeSlotId, setActiveSlotId]     = useState<string | null>(null);
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [dragOverSlotId, setDragOverSlotId] = useState<string | null>(null);
  const [search, setSearch]                 = useState("");
  const [teamFilter, setTeamFilter]         = useState("All Teams");
  const [posFilter, setPosFilter]           = useState("All Positions");
  const [showModal, setShowModal]           = useState(false);

  // ── Minutes scrub (global mouse tracking) ──────────────────────────────────
  const scrubRef = useRef<{ slotId: string; startX: number; startMin: number; maxMin: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const s = scrubRef.current;
      if (!s) return;
      const delta  = Math.round((e.clientX - s.startX) / 2.5);
      const newMin = Math.max(0, Math.min(s.maxMin, s.startMin + delta));
      setSlots(prev => prev.map(sl => sl.id === s.slotId ? { ...sl, minutes: newMin } : sl));
    };
    const onUp = () => { scrubRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const usedSalary   = slots.reduce((s, sl) => s + (sl.player ? playerSalary(sl.player) : 0), 0);
  const filledCount  = slots.filter(s => s.player !== null).length;
  const totalMinutes = slots.reduce((s, sl) => s + (sl.player ? sl.minutes : 0), 0);

  const capPct   = (usedSalary  / SALARY_CAP) * 100;
  const minPct   = (totalMinutes / TOTAL_MINS) * 100;
  const capColor = capPct >= 95 ? "#ef4444" : capPct >= 80 ? "#f59e0b" : "#84cc16";
  const minColor = totalMinutes > TOTAL_MINS ? "#ef4444" : totalMinutes === TOTAL_MINS ? "#84cc16" : "#f59e0b";

  const canProject = filledCount === 12 && totalMinutes === TOTAL_MINS;

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
      .sort((a, b) => playerRank(a) - playerRank(b));
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
    setSlots(prev => {
      const otherFilled = prev.reduce((sum, s) => s.id === slotId ? sum : (s.player ? sum + s.minutes : sum), 0);
      const capped = Math.max(0, Math.min(48, Math.min(minutes, TOTAL_MINS - otherFilled)));
      return prev.map(s => s.id === slotId ? { ...s, minutes: capped } : s);
    });
  }, []);

  const swapSlots = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setSlots(prev => {
      const from = prev.find(s => s.id === fromId)!;
      const to   = prev.find(s => s.id === toId)!;
      return prev.map(s => {
        if (s.id === fromId) return { ...s, player: to.player };
        if (s.id === toId)   return { ...s, player: from.player };
        return s;
      });
    });
  }, []);

  // ── Hint message below the roster grid ────────────────────────────────────
  let hintMsg = "";
  if (filledCount < 12) {
    hintMsg = `Fill all 12 slots (${filledCount}/12) and set total minutes to 240 to unlock projection`;
  } else if (totalMinutes !== TOTAL_MINS) {
    const diff = TOTAL_MINS - totalMinutes;
    hintMsg = diff > 0
      ? `Distribute ${diff} more minute${diff > 1 ? "s" : ""} across your roster`
      : `Over by ${-diff} minute${-diff > 1 ? "s" : ""} — reduce some players' time`;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f0e6", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, height: 64, background: "rgba(244,240,230,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.09)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, #84cc16, #84cc1640)" }} />
        <Link href="/home" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/logo.svg" alt="" style={{ height: 34 }} />
          <span style={{ fontFamily: "var(--font-bebas)", color: "#111827", fontSize: "1.35rem", letterSpacing: "0.08em" }}>Courtside Central</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Salary cap meter */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Salary Cap</p>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", color: capColor, letterSpacing: "0.06em", lineHeight: 1 }}>${usedSalary}M <span style={{ color: "#9ca3af" }}>/ $100M</span></p>
            <div style={{ width: 80, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(100, capPct)}%`, background: capColor, transition: "width 0.3s, background 0.3s", borderRadius: 2 }} />
            </div>
          </div>
          {/* Minutes meter */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Minutes</p>
            <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", color: minColor, letterSpacing: "0.06em", lineHeight: 1 }}>{totalMinutes} <span style={{ color: "#9ca3af" }}>/ 240</span></p>
            <div style={{ width: 80, height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginTop: 2 }}>
              <div style={{ height: "100%", width: `${Math.min(100, minPct)}%`, background: minColor, transition: "width 0.3s, background 0.3s", borderRadius: 2 }} />
            </div>
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

          {/* Rank-tier legend */}
          <div style={{ padding: "8px 14px 10px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 5, flexWrap: "wrap" as const }}>
            {RANK_TIERS.map(tier => (
              <div key={tier.rangeLabel} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ height: 14, minWidth: 28, paddingInline: 3, borderRadius: 3, background: tier.bg, border: `1.5px solid ${tier.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontFamily: "var(--font-bebas)", color: tier.text, fontWeight: 700 }}>{tier.rangeLabel}</div>
                <span style={{ fontSize: 8, color: "#9ca3af", fontFamily: "monospace" }}>${tier.price}M</span>
              </div>
            ))}
            <span style={{ fontSize: 9, color: "#d1d5db", fontFamily: "monospace", marginLeft: 2 }}>cap: $100M</span>
          </div>

          {/* Player list */}
          <div style={{ flex: 1, overflowY: "auto", borderTop: "1px solid #f3f4f6" }}>
            {filteredPlayers.map(player => {
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
                    <TierBadge player={player} small />
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
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <div>
                <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.5rem", letterSpacing: "0.12em", color: "#111827", lineHeight: 1 }}>Build your championship squad</h1>
                <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", marginTop: 3 }}>Fill all 12 slots · set 240 total minutes · drag the number or slider to adjust</p>
              </div>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.08em", color: "#6b7280", whiteSpace: "nowrap" as const }}>{filledCount}/12 players</p>
            </div>

            <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${(filledCount / 12) * 100}%`, background: "linear-gradient(90deg, #84cc16, #a3e635)", borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          </div>

          {/* 4-column slot grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, position: "relative" as const }}>
            {slots.map(slot => {
              const otherFilled = slots.reduce((sum, s) => s.id === slot.id ? sum : (s.player ? sum + s.minutes : sum), 0);
              const maxMin = slot.player ? Math.min(48, TOTAL_MINS - otherFilled) : 48;
              return (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  isActive={activeSlotId === slot.id}
                  isDragging={draggingSlotId === slot.id}
                  isDragOver={dragOverSlotId === slot.id && draggingSlotId !== slot.id}
                  maxMinutes={maxMin}
                  onActivate={() => setActiveSlotId(prev => prev === slot.id ? null : slot.id)}
                  onRemove={() => removePlayer(slot.id)}
                  onMinutes={v => setMinutes(slot.id, v)}
                  onMinutesScrubStart={(e) => {
                    scrubRef.current = { slotId: slot.id, startX: e.clientX, startMin: slot.minutes, maxMin };
                  }}
                  onDragStart={() => setDraggingSlotId(slot.id)}
                  onDragEnd={() => { setDraggingSlotId(null); setDragOverSlotId(null); }}
                  onDragEnter={() => setDragOverSlotId(slot.id)}
                  onDragLeave={() => setDragOverSlotId(prev => prev === slot.id ? null : prev)}
                  onDrop={() => {
                    if (draggingSlotId) swapSlots(draggingSlotId, slot.id);
                    setDraggingSlotId(null);
                    setDragOverSlotId(null);
                  }}
                />
              );
            })}
          </div>

          {hintMsg && (
            <p style={{ textAlign: "center" as const, color: totalMinutes > TOTAL_MINS ? "#ef4444" : "#9ca3af", fontFamily: "monospace", fontSize: 10, marginTop: 20, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              {hintMsg}
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
