"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  MY_TEAM_CARDS, cardById, generatePack, computeOVR, packChance,
  getStarColor, STAR_COLORS, TIER_GLOW, tierFromLevel,
  DEFAULT_TEAM_STATE, DAILY_PACK_KEY,
  type MTCard, type TeamState,
} from "@/lib/myTeamData";
import { getTodayStr } from "@/lib/dailyUtils";

// ─── Shiny CSS keyframes (injected once) ─────────────────────────────────────
function ShinyStyles() {
  return (
    <style>{`
      @keyframes shiny-sweep {
        0%   { transform: translateX(-180%) skewX(-20deg); }
        100% { transform: translateX(280%)  skewX(-20deg); }
      }
      @keyframes shiny-star {
        0%   { filter: brightness(1) drop-shadow(0 0 3px currentColor); }
        100% { filter: brightness(2.8) drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor); }
      }
      @keyframes rainbow-spin {
        0%   { background-position: 0%   50%; }
        100% { background-position: 200% 50%; }
      }
    `}</style>
  );
}

// ─── Star strip ──────────────────────────────────────────────────────────────
function Stars({ level, size = 11, isShiny = false }: { level: number; size?: number; isShiny?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(slot => {
        const color = getStarColor(slot, level);
        const c = STAR_COLORS[color];
        const lit = color !== "empty";
        return (
          <span key={slot} style={{
            fontSize: size,
            color: c,
            lineHeight: 1,
            textShadow: lit ? `0 0 ${isShiny ? 10 : 5}px ${c}` : "none",
            animation: lit && isShiny ? `shiny-star ${0.7 + slot * 0.12}s ease-in-out infinite alternate` : "none",
          }}>
            ★
          </span>
        );
      })}
    </div>
  );
}

// ─── 2K-style card ───────────────────────────────────────────────────────────
type CardSize = "xs" | "sm" | "md" | "lg";
const SIZES: Record<CardSize, { w: number; h: number }> = {
  xs: { w: 100, h: 142 },
  sm: { w: 128, h: 181 },
  md: { w: 165, h: 234 },
  lg: { w: 230, h: 326 },
};

function Card2K({
  card, size = "md", badge, onClick, dimmed,
}: {
  card: MTCard; size?: CardSize; badge?: string; onClick?: () => void; dimmed?: boolean;
}) {
  const { w, h } = SIZES[size];
  const s = w / 165; // scale factor relative to md
  const tier = tierFromLevel(card.starLevel);
  const glow = TIER_GLOW[tier];
  const ovr = computeOVR(card.starLevel);

  return (
    <motion.div
      onClick={onClick}
      className="relative flex-shrink-0"
      style={{ width: w, height: h, cursor: onClick ? "pointer" : "default", opacity: dimmed ? 0.4 : 1 }}
      whileHover={onClick ? { scale: 1.06, y: -5 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
    >
      {/* Shiny rainbow border (behind card) */}
      {card.isShiny && (
        <div style={{
          position: "absolute", inset: -2, borderRadius: w * 0.065 + 2, zIndex: 0,
          background: "linear-gradient(135deg, #f59e0b, #ec4899, #c084fc, #60a5fa, #34d399, #f59e0b)",
          backgroundSize: "300% 300%",
          animation: "rainbow-spin 2s linear infinite",
        }} />
      )}

      {/* Card frame */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: w * 0.065,
          border: `${s * 2}px solid ${card.isShiny ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: card.isShiny
            ? `0 0 ${s * 35}px ${glow}88, 0 0 ${s * 60}px ${glow}33, 0 ${s * 6}px ${s * 20}px rgba(0,0,0,0.6)`
            : `0 0 ${s * 20}px ${glow}44, 0 ${s * 6}px ${s * 20}px rgba(0,0,0,0.6)`,
          background: "#060c18",
          zIndex: 1,
        }}
      >
        {/* Photo */}
        {card.photo ? (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${card.photo})`,
            backgroundSize: "cover",
            backgroundPosition: card.photoPos ?? "center top",
          }} />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(145deg, ${card.teamColor}55 0%, #060c18 55%, ${card.accentColor}22 100%)`,
          }} />
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.05) 28%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.97) 100%)`,
        }} />

        {/* Top tier shimmer */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: s * 48,
          background: `linear-gradient(to bottom, ${glow}18, transparent)`,
        }} />

        {/* Diagonal accent */}
        <div style={{
          position: "absolute", left: "-25%", right: "-25%",
          bottom: "33%", height: s * 3.5,
          background: `linear-gradient(90deg, transparent, ${card.teamColor}ee, ${card.accentColor}88, ${card.teamColor}ee, transparent)`,
          transform: "rotate(-3.5deg)",
        }} />

        {/* Top-left OVR */}
        <div style={{ position: "absolute", top: s * 8, left: s * 9 }}>
          <div style={{
            background: "rgba(0,0,0,0.72)", borderRadius: s * 4,
            padding: `${s * 2}px ${s * 5}px`,
            border: `${s}px solid ${glow}55`,
          }}>
            <span style={{
              fontFamily: "monospace", fontWeight: 900,
              color: glow, fontSize: s * 17, lineHeight: 1, display: "block",
              textShadow: `0 0 8px ${glow}`,
            }}>
              {ovr}
            </span>
          </div>
          <span style={{
            fontFamily: "monospace", fontWeight: 700, fontSize: s * 8,
            color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
            letterSpacing: "0.08em", display: "block", marginTop: s * 1.5, marginLeft: s * 2,
          }}>
            {card.position}
          </span>
        </div>

        {/* Top-right team */}
        <div style={{
          position: "absolute", top: s * 9, right: s * 9,
          fontFamily: "monospace", fontWeight: 800, fontSize: s * 8,
          color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {card.teamAbbr}
        </div>

        {/* Badge overlay (in-team / NEW indicator) */}
        {badge && (
          <div style={{
            position: "absolute", top: s * 9, right: s * 9,
            background: badge === "NEW" ? glow : badge === "STR" ? "#84cc16" : "#f59e0b",
            color: badge === "NEW" && tier === "purple" ? "#fff" : "#000",
            borderRadius: s * 3, padding: `${s}px ${s * 5}px`,
            fontFamily: "monospace", fontWeight: 900, fontSize: s * 7.5,
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {badge}
          </div>
        )}

        {/* Shiny sweep overlay */}
        {card.isShiny && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
            animation: "shiny-sweep 2.2s ease-in-out infinite",
          }} />
        )}

        {/* Bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: `${s * 5}px ${s * 8}px ${s * 7}px`, zIndex: 3 }}>
          <Stars level={card.starLevel} size={s * 10} isShiny={card.isShiny} />
          <p style={{
            fontFamily: "monospace", fontWeight: 700, fontSize: s * 8,
            color: "rgba(255,255,255,0.55)", textTransform: "uppercase",
            letterSpacing: "0.06em", margin: `${s * 3}px 0 0`,
          }}>
            {card.firstName}
          </p>
          <p className="font-playfair" style={{
            fontWeight: 900, fontStyle: "italic",
            fontSize: size === "xs" ? s * 13 : s * 15,
            color: "#fff", lineHeight: 1.05, letterSpacing: "-0.01em", margin: 0,
          }}>
            {card.lastName}
          </p>
          <div className="flex justify-between items-center" style={{ marginTop: s * 2 }}>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: s * 7.5, color: glow, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {card.era}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: s * 7, color: "rgba(255,255,255,0.3)" }}>
              {card.ppg} PPG
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty slot ──────────────────────────────────────────────────────────────
function EmptySlot({ label, isStarter }: { label: string; isStarter: boolean }) {
  return (
    <div style={{
      width: SIZES.sm.w, height: SIZES.sm.h, borderRadius: 10, flexShrink: 0,
      border: `2px dashed ${isStarter ? "rgba(132,204,22,0.25)" : "rgba(255,255,255,0.08)"}`,
      background: isStarter ? "rgba(132,204,22,0.02)" : "rgba(255,255,255,0.01)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: 18, color: isStarter ? "rgba(132,204,22,0.25)" : "rgba(255,255,255,0.08)" }}>+</span>
      <p style={{
        fontFamily: "monospace", fontSize: 8, fontWeight: 700, marginTop: 4,
        color: isStarter ? "rgba(132,204,22,0.3)" : "rgba(255,255,255,0.15)",
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>
        {label}
      </p>
    </div>
  );
}

// ─── Pack opening screen ─────────────────────────────────────────────────────
function PackScreen({
  cards,
  ownedBefore,
  onCollect,
}: {
  cards: MTCard[];
  ownedBefore: Set<string>;
  onCollect: () => void;
}) {
  const [revealed, setRevealedArr] = useState([false, false, false, false, false]);
  const allRevealed = revealed.every(Boolean);

  function reveal(i: number) {
    setRevealedArr(prev => { const n = [...prev]; n[i] = true; return n; });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(3,5,12,0.97)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Title */}
      <motion.p
        className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/30 mb-4"
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
      >
        Pack Opening
      </motion.p>
      <motion.h2
        className="font-playfair font-black text-white italic mb-10"
        style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
      >
        {allRevealed ? "Pack Complete!" : "Tap to Reveal"}
      </motion.h2>

      {/* Cards */}
      <div className="flex gap-4 flex-wrap justify-center px-4">
        {cards.map((card, i) => {
          const tier = tierFromLevel(card.starLevel);
          const glow = TIER_GLOW[tier];
          const isNew = !ownedBefore.has(card.id);

          return (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 + 0.35, type: "spring", bounce: 0.3 }}
              className="relative"
            >
              {!revealed[i] ? (
                // Face-down card
                <motion.div
                  onClick={() => reveal(i)}
                  className="cursor-pointer flex flex-col items-center justify-center"
                  style={{
                    width: SIZES.md.w, height: SIZES.md.h,
                    background: "linear-gradient(145deg, #0d1526 0%, #0a0f1a 100%)",
                    border: "2px solid rgba(255,255,255,0.08)",
                    borderRadius: 11,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                  }}
                  whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div style={{ fontSize: 48, opacity: 0.12 }}>🏀</div>
                  <p style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 8 }}>
                    Tap to Reveal
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className="relative"
                  initial={{ scale: 0.6, rotateY: -90, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.4, duration: 0.55 }}
                >
                  <Card2K card={card} size="md" badge={isNew ? "NEW" : undefined} />

                  {/* Shiny burst */}
                  {card.isShiny && (
                    <>
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.2 }}
                        transition={{ duration: 1.0, ease: "easeOut" }}
                        style={{ background: `radial-gradient(circle, #fff8 0%, #f59e0b66 30%, transparent 70%)`, borderRadius: 11 }}
                      />
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0.9, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                        style={{ background: `radial-gradient(circle, #c084fc88 0%, transparent 70%)`, borderRadius: 11 }}
                      />
                    </>
                  )}
                  {/* Purple burst */}
                  {!card.isShiny && tier === "purple" && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      initial={{ opacity: 0.9, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.6 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      style={{ background: `radial-gradient(circle, ${glow}88 0%, transparent 70%)`, borderRadius: 11 }}
                    />
                  )}
                  {/* Blue flash */}
                  {!card.isShiny && tier === "blue" && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.3 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ background: `radial-gradient(circle, ${glow}66 0%, transparent 70%)`, borderRadius: 11 }}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Collect button */}
      <AnimatePresence>
        {allRevealed && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onCollect}
            className="mt-10 px-12 py-4 font-mono font-bold uppercase tracking-[0.25em] text-sm text-[#111827]"
            style={{ background: "#84cc16", boxShadow: "0 0 40px rgba(132,204,22,0.4)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Collect All →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Card detail modal ───────────────────────────────────────────────────────
function CardModal({
  card, inStarters, inBench,
  onAddStarter, onAddBench, onRemove, onClose,
}: {
  card: MTCard; inStarters: boolean; inBench: boolean;
  onAddStarter: () => void; onAddBench: () => void;
  onRemove: () => void; onClose: () => void;
}) {
  const tier = tierFromLevel(card.starLevel);
  const glow = TIER_GLOW[tier];
  const inTeam = inStarters || inBench;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row items-center gap-8 p-8"
        style={{
          background: "#0a0f1a", border: `2px solid ${glow}44`,
          borderRadius: 16, boxShadow: `0 0 60px ${glow}22`,
          maxWidth: 600, width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        <Card2K card={card} size="lg" />
        <div className="flex flex-col gap-4 flex-1 w-full">
          <div className="grid grid-cols-2 gap-2">
            {([["PPG", card.ppg], ["RPG", card.rpg], ["APG", card.apg], ["FG%", `${card.fg}%`]] as const).map(([l, v]) => (
              <div key={l} className="text-center p-2 rounded" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-mono text-[8px] uppercase tracking-widest text-white/30">{l}</p>
                <p className="font-mono font-bold text-white text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-widest text-white/30 mb-2">Badges</p>
            <div className="flex flex-wrap gap-1.5">
              {card.badges.map(b => (
                <span key={b} className="font-mono text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                  style={{ border: `1px solid ${glow}`, color: glow }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            {inTeam ? (
              <button onClick={onRemove}
                className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs border border-white/15 rounded text-white/50 hover:border-red-500 hover:text-red-400 transition-colors">
                Remove from Team
              </button>
            ) : (
              <>
                <button onClick={onAddStarter}
                  className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs rounded"
                  style={{ background: "#84cc16", color: "#000" }}>
                  Add to Starting 5
                </button>
                <button onClick={onAddBench}
                  className="w-full py-3 font-mono font-bold uppercase tracking-[0.15em] text-xs border border-white/15 text-white/50 rounded hover:border-white/30 hover:text-white/80 transition-colors">
                  Add to Bench
                </button>
              </>
            )}
            <button onClick={onClose}
              className="font-mono text-[9px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors pt-1">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Card catalog (all cards by era) ─────────────────────────────────────────
function CatalogSection({ owned }: { owned: Set<string> }) {
  // Group cards by decade, sorted chronologically
  const groups: Record<string, MTCard[]> = {};
  const sorted = [...MY_TEAM_CARDS].sort((a, b) => parseInt(a.era) - parseInt(b.era));
  for (const card of sorted) {
    const year = parseInt(card.era);
    const dec = `${Math.floor(year / 10) * 10}s`;
    if (!groups[dec]) groups[dec] = [];
    groups[dec].push(card);
  }

  const totalOwned = sorted.filter(c => owned.has(c.id)).length;

  return (
    <div className="space-y-12">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">Collection Progress</p>
          <p className="font-mono text-[9px] text-white/30">{totalOwned} / {MY_TEAM_CARDS.length} cards</p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #84cc16, #c084fc)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(totalOwned / MY_TEAM_CARDS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {Object.entries(groups).map(([decade, cards]) => {
        const ownedInGroup = cards.filter(c => owned.has(c.id)).length;
        return (
          <div key={decade}>
            {/* Decade header */}
            <div className="flex items-center gap-4 mb-5">
              <div>
                <p className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {decade}
                </p>
                <p className="font-mono text-[8px] text-white/25 uppercase tracking-widest mt-0.5">
                  {ownedInGroup}/{cards.length} collected
                </p>
              </div>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <p className="font-mono text-[8px] text-white/15 uppercase tracking-widest">{cards[0].era.split("-")[0]}–{cards[cards.length - 1].era}</p>
            </div>

            {/* Cards grid */}
            <div className="flex flex-wrap gap-4">
              {cards.map(card => {
                const isOwned = owned.has(card.id);
                const tier = tierFromLevel(card.starLevel);
                const glow = TIER_GLOW[tier];
                const { w, h } = SIZES.md;
                const s = w / 165;

                return (
                  <motion.div
                    key={card.id}
                    className="relative flex-shrink-0"
                    style={{ width: w, height: h }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ filter: isOwned ? "none" : "grayscale(100%) brightness(0.35)", transition: "filter 0.3s" }}>
                      <Card2K card={card} size="md" dimmed={false} />
                    </div>

                    {/* Owned badge */}
                    {isOwned && (
                      <div style={{
                        position: "absolute", top: s * 9, right: s * 9,
                        background: "#84cc16", color: "#000",
                        borderRadius: s * 3, padding: `${s}px ${s * 5}px`,
                        fontFamily: "monospace", fontWeight: 900,
                        fontSize: s * 7.5, textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        Owned
                      </div>
                    )}

                    {/* Lock overlay with centered pack % */}
                    {!isOwned && (
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: w * 0.065,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: s * 4,
                        border: `2px solid rgba(255,255,255,0.06)`,
                      }}>
                        <span style={{ fontSize: s * 22, opacity: 0.18 }}>🔒</span>
                        <div style={{
                          background: "rgba(0,0,0,0.75)", borderRadius: s * 4,
                          padding: `${s * 2.5}px ${s * 6}px`,
                          border: `${s}px solid ${glow}44`,
                        }}>
                          <span style={{
                            fontFamily: "monospace", fontWeight: 800, fontSize: s * 8.5,
                            color: glow, letterSpacing: "0.06em",
                          }}>
                            {packChance(card)}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Filter pill ─────────────────────────────────────────────────────────────
function FilterBtn({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all"
      style={{
        border: `1.5px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        color: active ? color : "rgba(255,255,255,0.3)",
        background: active ? `${color}11` : "transparent",
        boxShadow: active ? `0 0 10px ${color}33` : "none",
      }}>
      {label}
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
type TierFilter = "all" | "purple" | "blue" | "gold";
type Tab = "team" | "catalog";

export default function MyTeamPage() {
  const { isSignedIn } = useUser();
  const [state, setState] = useState<TeamState>(DEFAULT_TEAM_STATE);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selected, setSelected] = useState<MTCard | null>(null);
  const [packCards, setPackCards] = useState<MTCard[] | null>(null);
  const [ownedBeforePack, setOwnedBeforePack] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<TierFilter>("all");
  const [hasDailyPack, setHasDailyPack] = useState(false);
  const [tab, setTab] = useState<Tab>("team");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load
  useEffect(() => {
    async function load() {
      let loaded: TeamState | null = null;
      if (isSignedIn) {
        try {
          const res = await fetch("/api/my-team");
          const data = await res.json();
          loaded = data.myTeam as TeamState;
        } catch {}
      }
      if (!loaded) {
        try {
          const raw = localStorage.getItem("my_team_v3");
          if (raw) loaded = JSON.parse(raw);
        } catch {}
      }
      if (loaded) {
        // Migrate from old format
        const migrated: TeamState = {
          collection: loaded.collection ?? [],
          packs: loaded.packs ?? DEFAULT_TEAM_STATE.packs,
          starters: loaded.starters ?? [],
          bench: loaded.bench ?? [],
        };
        setState(migrated);
      }
    }
    load();

    // Check daily free pack
    const last = localStorage.getItem(DAILY_PACK_KEY);
    setHasDailyPack(last !== getTodayStr());
  }, [isSignedIn]);

  const saveState = useCallback((s: TeamState) => {
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    localStorage.setItem("my_team_v3", JSON.stringify(s));
    if (isSignedIn) {
      saveTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/my-team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ myTeam: s }),
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch { setSaveStatus("error"); }
      }, 800);
    } else {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }
  }, [isSignedIn]);

  function openPack(isDaily = false) {
    if (state.packs <= 0 && !isDaily) return;
    const owned = new Set(state.collection);
    const cards = generatePack(owned);
    setOwnedBeforePack(owned);
    setPackCards(cards);
    if (isDaily) {
      localStorage.setItem(DAILY_PACK_KEY, getTodayStr());
      setHasDailyPack(false);
    }
  }

  function collectPack() {
    if (!packCards) return;
    setState(prev => {
      const newCollection = [...new Set([...prev.collection, ...packCards.map(c => c.id)])];
      const newPacks = Math.max(0, prev.packs - 1);
      const next = { ...prev, collection: newCollection, packs: newPacks };
      saveState(next);
      return next;
    });
    setPackCards(null);
  }

  function addCard(cardId: string, slot: "starter" | "bench") {
    setState(prev => {
      let next = { ...prev };
      if (slot === "starter" && prev.starters.length < 5 && !prev.starters.includes(cardId) && !prev.bench.includes(cardId)) {
        next.starters = [...prev.starters, cardId];
      } else if (slot === "bench" && prev.bench.length < 5 && !prev.starters.includes(cardId) && !prev.bench.includes(cardId)) {
        next.bench = [...prev.bench, cardId];
      }
      saveState(next);
      return next;
    });
    setSelected(null);
  }

  function removeCard(cardId: string) {
    setState(prev => {
      const next = { ...prev, starters: prev.starters.filter(id => id !== cardId), bench: prev.bench.filter(id => id !== cardId) };
      saveState(next);
      return next;
    });
    setSelected(null);
  }

  const owned = new Set(state.collection);
  const starterCards = state.starters.map(id => cardById(id)).filter(Boolean) as MTCard[];
  const benchCards = state.bench.map(id => cardById(id)).filter(Boolean) as MTCard[];
  const collectionCards = state.collection.map(id => cardById(id)).filter(Boolean) as MTCard[];

  const filteredCollection = filter === "all" ? collectionCards
    : collectionCards.filter(c => tierFromLevel(c.starLevel) === filter);

  const totalByTier = {
    purple: MY_TEAM_CARDS.filter(c => tierFromLevel(c.starLevel) === "purple").length,
    blue:   MY_TEAM_CARDS.filter(c => tierFromLevel(c.starLevel) === "blue").length,
    gold:   MY_TEAM_CARDS.filter(c => tierFromLevel(c.starLevel) === "gold").length,
  };
  const ownedByTier = {
    purple: collectionCards.filter(c => tierFromLevel(c.starLevel) === "purple").length,
    blue:   collectionCards.filter(c => tierFromLevel(c.starLevel) === "blue").length,
    gold:   collectionCards.filter(c => tierFromLevel(c.starLevel) === "gold").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "#060c18" }}>
      <ShinyStyles />
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(6,12,24,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-4">
          <a href="/games" className="font-mono text-white/25 text-xs hover:text-white/55 transition-colors">← Games</a>
          <div className="w-px h-4 bg-white/10" />
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#84cc16]">My Team</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest animate-pulse">Saving…</span>}
          {saveStatus === "saved"  && <span className="font-mono text-[9px] text-[#84cc16] uppercase tracking-widest">Saved ✓</span>}
          {!isSignedIn && (
            <a href="/sign-in" className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] border border-[#f59e0b33] px-2 py-1 hover:bg-[#f59e0b0d] transition-colors rounded">
              Sign in to sync →
            </a>
          )}
        </div>
      </header>

      {/* Tab bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(6,12,24,0.9)" }}>
        <div className="max-w-7xl mx-auto px-4 flex">
          {(["team", "catalog"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] px-5 py-3.5 transition-colors relative"
              style={{ color: tab === t ? "#84cc16" : "rgba(255,255,255,0.25)" }}
            >
              {t === "team" ? "My Team" : "Card Catalog"}
              {tab === t && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "#84cc16" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-14 pb-28">

        {tab === "catalog" ? (
          <CatalogSection owned={owned} />
        ) : (<>

        {/* ── PACKS ── */}
        <section>
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/25 mb-3">Pack Store</p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Inventory */}
            <motion.div
              className="flex-1 flex flex-col justify-between p-6 rounded-xl"
              style={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.07)", minHeight: 140 }}
              whileHover={{ borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">Pack Inventory</p>
                <span className="font-mono text-[9px] text-white/20">{MY_TEAM_CARDS.length} total cards</span>
              </div>
              <div className="flex items-end gap-4 mt-3">
                <div>
                  <p className="font-playfair font-black text-white italic" style={{ fontSize: "3.2rem", lineHeight: 1 }}>{state.packs}</p>
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mt-1">Packs Available</p>
                </div>
                <div className="flex flex-col gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: TIER_GLOW.purple }} />
                    <span className="font-mono text-[8px] text-white/30">~12% purple</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: TIER_GLOW.blue }} />
                    <span className="font-mono text-[8px] text-white/30">~30% blue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: TIER_GLOW.gold }} />
                    <span className="font-mono text-[8px] text-white/30">~58% gold</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg,#f59e0b,#c084fc)" }} />
                    <span className="font-mono text-[8px] text-white/30">3% shiny ✦</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Open pack button */}
            <div className="flex flex-col gap-3 sm:w-64">
              <motion.button
                onClick={() => openPack(false)}
                disabled={state.packs <= 0}
                className="flex-1 py-5 font-mono font-bold uppercase tracking-[0.2em] text-sm rounded-xl"
                style={{
                  background: state.packs > 0 ? "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)" : "rgba(255,255,255,0.05)",
                  color: state.packs > 0 ? "#111827" : "rgba(255,255,255,0.2)",
                  cursor: state.packs > 0 ? "pointer" : "not-allowed",
                  boxShadow: state.packs > 0 ? "0 0 30px rgba(132,204,22,0.3)" : "none",
                }}
                whileHover={state.packs > 0 ? { scale: 1.03 } : {}}
                whileTap={state.packs > 0 ? { scale: 0.97 } : {}}
              >
                Open Pack ({state.packs})
              </motion.button>

              {hasDailyPack && (
                <motion.button
                  onClick={() => openPack(true)}
                  className="py-3 font-mono font-bold uppercase tracking-[0.18em] text-xs rounded-xl border"
                  style={{ borderColor: "#c084fc55", color: "#c084fc", background: "#c084fc0a" }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(192,132,252,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                >
                  Claim Daily Free Pack ★
                </motion.button>
              )}
            </div>
          </div>
        </section>

        {/* ── TEAM BUILDER ── */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/25 mb-1">Your Roster</p>
              <h2 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1 }}>
                Build Your Squad
              </h2>
            </div>
            <p className="font-mono text-[9px] text-white/25 uppercase tracking-widest">
              {state.starters.length}/5 starters · {state.bench.length}/5 bench
            </p>
          </div>

          {/* Starters */}
          <div className="mb-5">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#84cc16] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" /> Starting 5
            </p>
            <div className="flex gap-3 flex-wrap">
              {starterCards.map((c, i) => (
                <Card2K key={c.id} card={c} size="sm" badge={`S${i + 1}`} onClick={() => setSelected(c)} />
              ))}
              {Array.from({ length: 5 - starterCards.length }, (_, i) => (
                <EmptySlot key={i} label={`Starter ${starterCards.length + i + 1}`} isStarter />
              ))}
            </div>
          </div>

          {/* Bench */}
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/25 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Bench
            </p>
            <div className="flex gap-3 flex-wrap">
              {benchCards.map((c, i) => (
                <Card2K key={c.id} card={c} size="sm" badge={`B${i + 1}`} onClick={() => setSelected(c)} />
              ))}
              {Array.from({ length: 5 - benchCards.length }, (_, i) => (
                <EmptySlot key={i} label={`Bench ${benchCards.length + i + 1}`} isStarter={false} />
              ))}
            </div>
          </div>
        </section>

        {/* ── COLLECTION ── */}
        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/25 mb-1">Collection</p>
              <h2 className="font-playfair font-black text-white italic" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", lineHeight: 1 }}>
                Your Cards
                <span className="font-mono font-normal text-white/30 not-italic ml-3" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)" }}>
                  {owned.size}/{MY_TEAM_CARDS.length}
                </span>
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              <FilterBtn label="All" active={filter === "all"} color="#ffffff" onClick={() => setFilter("all")} />
              <FilterBtn label={`Purple ${ownedByTier.purple}/${totalByTier.purple}`} active={filter === "purple"} color="#c084fc" onClick={() => setFilter("purple")} />
              <FilterBtn label={`Blue ${ownedByTier.blue}/${totalByTier.blue}`}     active={filter === "blue"}   color="#60a5fa" onClick={() => setFilter("blue")} />
              <FilterBtn label={`Gold ${ownedByTier.gold}/${totalByTier.gold}`}     active={filter === "gold"}   color="#f59e0b" onClick={() => setFilter("gold")} />
            </div>
          </div>

          {filteredCollection.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {filteredCollection.map(card => (
                <Card2K
                  key={card.id}
                  card={card}
                  size="md"
                  badge={state.starters.includes(card.id) ? "STR" : state.bench.includes(card.id) ? "BEN" : undefined}
                  onClick={() => setSelected(card)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-white/5 rounded-xl" style={{ background: "rgba(255,255,255,0.01)" }}>
              {owned.size === 0 ? (
                <>
                  <p className="font-playfair font-black text-white/15 italic" style={{ fontSize: "2rem" }}>No Cards Yet</p>
                  <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest mt-2">Open a pack above to start your collection</p>
                </>
              ) : (
                <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">No {filter} cards collected yet</p>
              )}
            </div>
          )}
        </section>

        {/* Legend */}
        <div className="flex items-center gap-6 flex-wrap">
          <p className="font-mono text-[8px] uppercase tracking-widest text-white/15">Card Tiers</p>
          {(["gold", "blue", "purple"] as const).map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <Stars level={t === "gold" ? 5 : t === "blue" ? 10 : 15} size={9} />
              <span className="font-mono text-[8px] uppercase tracking-widest capitalize" style={{ color: TIER_GLOW[t] }}>{t}</span>
            </div>
          ))}
        </div>

        </>)}
      </main>

      {/* Pack opening overlay */}
      <AnimatePresence>
        {packCards && (
          <PackScreen cards={packCards} ownedBefore={ownedBeforePack} onCollect={collectPack} />
        )}
      </AnimatePresence>

      {/* Card detail modal */}
      <AnimatePresence>
        {selected && !packCards && (
          <CardModal
            card={selected}
            inStarters={state.starters.includes(selected.id)}
            inBench={state.bench.includes(selected.id)}
            onAddStarter={() => addCard(selected.id, "starter")}
            onAddBench={() => addCard(selected.id, "bench")}
            onRemove={() => removeCard(selected.id)}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
